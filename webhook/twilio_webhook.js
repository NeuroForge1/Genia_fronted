// Webhook para recibir mensajes de WhatsApp de Twilio
// Este archivo debe ser desplegado en el backend para recibir y procesar mensajes entrantes

// Importar dependencias
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://axfcmtrhsvmtzqqhxwul.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'tu-clave-service-role';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de Twilio
const accountSid = process.env.TWILIO_SID || 'AC00000000000000000000000000000000';
const authToken = process.env.TWILIO_AUTH_TOKEN || '00000000000000000000000000000000';
const twilioClient = require('twilio')(accountSid, authToken);
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

// Configuración de OpenAI
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || 'sk-demo-openai-key-for-development-purposes-only',
});
const openai = new OpenAIApi(configuration);

// Crear aplicación Express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Ruta para recibir mensajes de WhatsApp
app.post('/api/webhooks/twilio/whatsapp', async (req, res) => {
  try {
    // Extraer información del mensaje
    const from = req.body.From; // Formato: whatsapp:+1234567890
    const to = req.body.To; // Formato: whatsapp:+14155238886
    const body = req.body.Body;
    const mediaUrl = req.body.MediaUrl0 || null;
    
    console.log(`Mensaje recibido de ${from}: ${body}`);
    
    // Extraer número de teléfono sin el prefijo "whatsapp:"
    const phoneNumber = from.startsWith('whatsapp:') ? from.substring(9) : from;
    
    // Verificar si el número está registrado en la base de datos
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('phone_number', phoneNumber)
      .single();
    
    if (userError || !userData) {
      // Si el número no está registrado, enviar mensaje de bienvenida
      await sendWhatsAppMessage(
        phoneNumber,
        `¡Hola! Gracias por contactar a GENIA. Para utilizar nuestro servicio, necesitas registrarte en nuestra plataforma: https://v0-genia-fronted.vercel.app/\n\nUna vez registrado, podrás vincular este número de WhatsApp a tu cuenta.`
      );
      
      // Responder a Twilio
      return res.status(200).send({
        success: true,
        message: 'Mensaje de bienvenida enviado a usuario no registrado'
      });
    }
    
    // Procesar el mensaje según su contenido
    if (body.toLowerCase() === 'hola' || body.toLowerCase() === 'hello') {
      // Manejar saludo
      await sendWhatsAppMessage(
        phoneNumber,
        `¡Hola ${userData.name || 'usuario'}! 👋\n\nSoy GENIA, tu asistente de IA. Estoy aquí para ayudarte a crecer tu negocio.\n\n¿En qué puedo ayudarte hoy?\n\n- Puedes pedirme ideas para contenido\n- Consultar estrategias de marketing\n- Solicitar análisis de datos\n- O cualquier otra consulta relacionada con tu negocio`
      );
    } else if (body.toLowerCase().includes('ayuda') || body.toLowerCase().includes('help')) {
      // Manejar solicitud de ayuda
      await sendWhatsAppMessage(
        phoneNumber,
        `Comandos disponibles en GENIA WhatsApp:\n\n- *Hola*: Iniciar conversación\n- *Ayuda*: Ver esta lista de comandos\n- *Status*: Ver estado de tu cuenta\n- *Clones*: Ver lista de clones disponibles\n\nPara hablar con un clon específico, escribe el nombre del clon seguido de dos puntos y tu mensaje. Por ejemplo:\n*Content: Necesito ideas para mi próximo post*`
      );
    } else {
      // Determinar qué clon usar
      let cloneType = 'general';
      let userMessage = body;
      
      // Verificar si el mensaje especifica un clon
      const cloneMatch = body.match(/^(content|ads|ceo|voice):\s*(.*)/i);
      if (cloneMatch) {
        cloneType = cloneMatch[1].toLowerCase();
        userMessage = cloneMatch[2];
      }
      
      // Obtener sistema de mensajes según el tipo de clon
      const systemMessage = getCloneSystemMessage(cloneType);
      
      // Obtener historial de conversación
      const { data: conversationHistory, error: historyError } = await supabase
        .from('whatsapp_conversations')
        .select('role, content')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: true })
        .limit(10);
      
      // Preparar mensajes para OpenAI
      const messages = [
        { role: 'system', content: systemMessage }
      ];
      
      // Añadir historial de conversación si existe
      if (!historyError && conversationHistory && conversationHistory.length > 0) {
        messages.push(...conversationHistory);
      }
      
      // Añadir el mensaje actual del usuario
      messages.push({ role: 'user', content: userMessage });
      
      try {
        // Enviar mensaje a OpenAI
        const completion = await openai.createChatCompletion({
          model: 'gpt-4-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        });
        
        const aiResponse = completion.data.choices[0].message.content;
        
        // Guardar mensaje del usuario y respuesta en la base de datos
        await supabase.from('whatsapp_conversations').insert([
          { user_id: userData.id, role: 'user', content: userMessage },
          { user_id: userData.id, role: 'assistant', content: aiResponse }
        ]);
        
        // Enviar respuesta de OpenAI por WhatsApp
        await sendWhatsAppMessage(phoneNumber, aiResponse);
      } catch (openaiError) {
        console.error('Error al procesar consulta con OpenAI:', openaiError);
        
        // Enviar mensaje de error al usuario
        await sendWhatsAppMessage(
          phoneNumber,
          `Lo siento, tuve un problema al procesar tu consulta. Por favor, intenta nuevamente más tarde o contacta a soporte si el problema persiste.`
        );
      }
    }
    
    // Responder a Twilio
    return res.status(200).send({
      success: true,
      message: 'Mensaje procesado correctamente'
    });
  } catch (error) {
    console.error('Error al procesar mensaje de WhatsApp:', error);
    
    // Responder a Twilio con error
    return res.status(500).send({
      success: false,
      message: `Error al procesar mensaje: ${error.message}`
    });
  }
});

// Función para enviar mensaje de WhatsApp
async function sendWhatsAppMessage(to, message) {
  try {
    // Asegurarse de que el número tenga el formato correcto
    const formattedNumber = formatPhoneNumber(to);
    
    // Enviar mensaje a través de Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${twilioWhatsappNumber}`,
      to: `whatsapp:${formattedNumber}`
    });
    
    console.log(`Mensaje enviado a ${formattedNumber}, SID: ${twilioMessage.sid}`);
    return {
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status
    };
  } catch (error) {
    console.error('Error al enviar mensaje de WhatsApp:', error);
    throw error;
  }
}

// Función para formatear número de teléfono
function formatPhoneNumber(phoneNumber) {
  // Eliminar caracteres no numéricos
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Asegurarse de que tenga el código de país
  if (!cleaned.startsWith('1') && !cleaned.startsWith('+1')) {
    cleaned = '1' + cleaned; // Añadir código de país de EE. UU. por defecto
  }
  
  // Eliminar el + si existe
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  return cleaned;
}

// Función para obtener el mensaje de sistema según el tipo de clon
function getCloneSystemMessage(cloneType) {
  switch(cloneType) {
    case 'content':
      return 'Eres GENIA Content, un asistente especializado en crear contenido para redes sociales y marketing digital. Tu objetivo es ayudar a generar ideas creativas, textos persuasivos y estrategias de contenido efectivas.';
    case 'ads':
      return 'Eres GENIA Ads, un asistente especializado en publicidad digital. Tu objetivo es ayudar a crear anuncios efectivos, optimizar campañas y maximizar el retorno de inversión en publicidad.';
    case 'ceo':
      return 'Eres GENIA CEO, un asistente ejecutivo especializado en estrategia de negocio. Tu objetivo es ayudar con decisiones estratégicas, análisis de mercado y planificación de crecimiento empresarial.';
    case 'voice':
      return 'Eres GENIA Voice, un asistente especializado en comunicación verbal. Tu objetivo es ayudar a crear guiones para videos, podcasts y mensajes de voz efectivos.';
    default:
      return 'Eres GENIA, un asistente de IA que ayuda a emprendedores y negocios a crecer utilizando inteligencia artificial. Tu objetivo es proporcionar respuestas útiles, precisas y orientadas a resultados.';
  }
}

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor webhook de Twilio iniciado en puerto ${PORT}`);
});

module.exports = app;
