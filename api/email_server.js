// Backend para el envío de correos con Brevo SMTP
// Este archivo debe ser desplegado en el backend para manejar el envío de correos

// Importar dependencias
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Importar plantillas de correo
const emailTemplates = require('./email_templates');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://axfcmtrhsvmtzqqhxwul.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'tu-clave-service-role';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de Brevo SMTP
const BREVO_SMTP_HOST = 'smtp-relay.brevo.com';
const BREVO_SMTP_PORT = 587;
const BREVO_SMTP_USER = '8a2c1a001@smtp-brevo.com';
const BREVO_SMTP_PASS = 'f0h8ELCZnH32sWcF';
const BREVO_FROM_EMAIL = 'notificaciones@genia.app';
const BREVO_FROM_NAME = 'GENIA';
const TEST_EMAIL = 'mendezchristhian1@gmail.com';

// Crear transporter de Nodemailer
const transporter = nodemailer.createTransport({
  host: BREVO_SMTP_HOST,
  port: BREVO_SMTP_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: BREVO_SMTP_USER,
    pass: BREVO_SMTP_PASS,
  },
});

// Crear aplicación Express
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Middleware para verificar token de autenticación
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de autenticación no proporcionado' });
  }
  
  try {
    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ success: false, message: 'Token de autenticación inválido' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(500).json({ success: false, message: 'Error al verificar autenticación' });
  }
};

// Ruta para enviar correo de bienvenida
app.post('/api/email/welcome', async (req, res) => {
  try {
    const { email, name, business_type } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'El correo electrónico es obligatorio' });
    }
    
    // Datos del usuario para la plantilla
    const userData = {
      email,
      name: name || 'Usuario',
      business_type: business_type || ''
    };
    
    // Generar contenido HTML con la plantilla
    const htmlContent = emailTemplates.welcome(userData);
    
    // Configurar correo
    const mailOptions = {
      from: `"${BREVO_FROM_NAME}" <${BREVO_FROM_EMAIL}>`,
      to: process.env.NODE_ENV === 'production' ? email : TEST_EMAIL,
      subject: '¡Bienvenido a GENIA! Tu sistema de crecimiento con IA',
      html: htmlContent
    };
    
    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo de bienvenida enviado:', info.messageId);
    
    // Guardar registro en la base de datos
    await supabase.from('email_logs').insert({
      email_to: email,
      email_type: 'welcome',
      status: 'sent',
      message_id: info.messageId
    });
    
    return res.status(200).json({
      success: true,
      message: 'Correo de bienvenida enviado correctamente',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error al enviar correo de bienvenida:', error);
    
    // Guardar registro de error en la base de datos
    if (req.body.email) {
      await supabase.from('email_logs').insert({
        email_to: req.body.email,
        email_type: 'welcome',
        status: 'error',
        error_message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: `Error al enviar correo de bienvenida: ${error.message}`
    });
  }
});

// Ruta para enviar correo de recuperación de contraseña
app.post('/api/email/password-reset', async (req, res) => {
  try {
    const { email, resetToken } = req.body;
    
    if (!email || !resetToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'El correo electrónico y el token de recuperación son obligatorios' 
      });
    }
    
    // Buscar usuario en la base de datos
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    
    // Generar contenido HTML con la plantilla
    const htmlContent = emailTemplates.passwordReset(userData, resetToken);
    
    // Configurar correo
    const mailOptions = {
      from: `"${BREVO_FROM_NAME}" <${BREVO_FROM_EMAIL}>`,
      to: process.env.NODE_ENV === 'production' ? email : TEST_EMAIL,
      subject: 'Recuperación de contraseña - GENIA',
      html: htmlContent
    };
    
    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo de recuperación enviado:', info.messageId);
    
    // Guardar registro en la base de datos
    await supabase.from('email_logs').insert({
      email_to: email,
      email_type: 'password_reset',
      status: 'sent',
      message_id: info.messageId
    });
    
    return res.status(200).json({
      success: true,
      message: 'Correo de recuperación enviado correctamente',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    
    // Guardar registro de error en la base de datos
    if (req.body.email) {
      await supabase.from('email_logs').insert({
        email_to: req.body.email,
        email_type: 'password_reset',
        status: 'error',
        error_message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: `Error al enviar correo de recuperación: ${error.message}`
    });
  }
});

// Ruta para enviar correo de notificación
app.post('/api/email/notification', authenticateToken, async (req, res) => {
  try {
    const { email, name, subject, message } = req.body;
    
    if (!email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'El correo electrónico, asunto y mensaje son obligatorios' 
      });
    }
    
    // Datos del usuario para la plantilla
    const userData = {
      email,
      name: name || 'Usuario'
    };
    
    // Generar contenido HTML con la plantilla
    const htmlContent = emailTemplates.notification(userData, subject, message);
    
    // Configurar correo
    const mailOptions = {
      from: `"${BREVO_FROM_NAME}" <${BREVO_FROM_EMAIL}>`,
      to: process.env.NODE_ENV === 'production' ? email : TEST_EMAIL,
      subject: `${subject} - GENIA`,
      html: htmlContent
    };
    
    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo de notificación enviado:', info.messageId);
    
    // Guardar registro en la base de datos
    await supabase.from('email_logs').insert({
      email_to: email,
      email_type: 'notification',
      status: 'sent',
      message_id: info.messageId,
      subject,
      message_content: message
    });
    
    return res.status(200).json({
      success: true,
      message: 'Correo de notificación enviado correctamente',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error al enviar correo de notificación:', error);
    
    // Guardar registro de error en la base de datos
    if (req.body.email) {
      await supabase.from('email_logs').insert({
        email_to: req.body.email,
        email_type: 'notification',
        status: 'error',
        error_message: error.message,
        subject: req.body.subject,
        message_content: req.body.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: `Error al enviar correo de notificación: ${error.message}`
    });
  }
});

// Ruta para enviar correo de fin de prueba
app.post('/api/email/trial-ending', authenticateToken, async (req, res) => {
  try {
    const { email, name, daysLeft } = req.body;
    
    if (!email || !daysLeft) {
      return res.status(400).json({ 
        success: false, 
        message: 'El correo electrónico y los días restantes son obligatorios' 
      });
    }
    
    // Datos del usuario para la plantilla
    const userData = {
      email,
      name: name || 'Usuario'
    };
    
    // Generar contenido HTML con la plantilla
    const htmlContent = emailTemplates.trialEnding(userData, daysLeft);
    
    // Configurar correo
    const mailOptions = {
      from: `"${BREVO_FROM_NAME}" <${BREVO_FROM_EMAIL}>`,
      to: process.env.NODE_ENV === 'production' ? email : TEST_EMAIL,
      subject: `Tu prueba de GENIA termina en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`,
      html: htmlContent
    };
    
    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo de fin de prueba enviado:', info.messageId);
    
    // Guardar registro en la base de datos
    await supabase.from('email_logs').insert({
      email_to: email,
      email_type: 'trial_ending',
      status: 'sent',
      message_id: info.messageId,
      days_left: daysLeft
    });
    
    return res.status(200).json({
      success: true,
      message: 'Correo de fin de prueba enviado correctamente',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error al enviar correo de fin de prueba:', error);
    
    // Guardar registro de error en la base de datos
    if (req.body.email) {
      await supabase.from('email_logs').insert({
        email_to: req.body.email,
        email_type: 'trial_ending',
        status: 'error',
        error_message: error.message,
        days_left: req.body.daysLeft
      });
    }
    
    return res.status(500).json({
      success: false,
      message: `Error al enviar correo de fin de prueba: ${error.message}`
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de correo iniciado en puerto ${PORT}`);
});

module.exports = app;
