// Plantillas de correo electrónico para GENIA
// Este archivo contiene las plantillas HTML para los correos electrónicos enviados por la aplicación

const emailTemplates = {
  // Plantilla de correo de bienvenida
  welcome: (userData) => {
    const userName = userData.name || 'Usuario';
    const businessType = userData.business_type ? `especializado en ${userData.business_type}` : 'en crecimiento';
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido a GENIA!</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #67f8c0;
      color: #000000;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .features {
      margin: 30px 0;
      padding: 0;
      list-style-type: none;
    }
    .features li {
      margin-bottom: 10px;
      padding-left: 25px;
      position: relative;
    }
    .features li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #67f8c0;
      font-weight: bold;
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    p {
      margin: 15px 0;
    }
    .highlight {
      font-weight: bold;
      color: #4361ee;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #888;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://v0-genia-fronted.vercel.app/assets/logo.svg" alt="GENIA Logo" class="logo">
    </div>
    
    <div class="content">
      <h1>¡Bienvenido a GENIA, ${userName}!</h1>
      
      <p>Estamos emocionados de tenerte como parte de nuestra comunidad de emprendedores y negocios que utilizan inteligencia artificial para crecer.</p>
      
      <p>Tu cuenta ha sido activada y tienes acceso a <span class="highlight">todos los clones de IA</span> durante tu periodo de prueba de 7 días.</p>
      
      <p>Como negocio ${businessType}, GENIA te ayudará a:</p>
      
      <ul class="features">
        <li>Crear contenido persuasivo para tus redes sociales</li>
        <li>Diseñar campañas publicitarias efectivas</li>
        <li>Analizar datos para tomar mejores decisiones</li>
        <li>Automatizar tareas repetitivas</li>
        <li>Escalar tu negocio sin contratar más personal</li>
      </ul>
      
      <p>Para comenzar, inicia sesión en tu cuenta y explora todas las funcionalidades que GENIA tiene para ti:</p>
      
      <div style="text-align: center;">
        <a href="https://v0-genia-fronted.vercel.app/dashboard.html" class="button">Acceder a mi cuenta</a>
      </div>
      
      <p>Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo o a través de WhatsApp.</p>
      
      <p>¡Gracias por unirte a GENIA!</p>
      
      <p>Saludos,<br>El equipo de GENIA</p>
    </div>
    
    <div class="footer">
      <p>© 2025 GENIA. Todos los derechos reservados.</p>
      <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
      <div class="social-links">
        <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  },
  
  // Plantilla de correo de recuperación de contraseña
  passwordReset: (userData, resetToken) => {
    const userName = userData.name || 'Usuario';
    const resetUrl = `https://v0-genia-fronted.vercel.app/reset-password.html?token=${resetToken}&email=${encodeURIComponent(userData.email)}`;
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperación de contraseña - GENIA</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #67f8c0;
      color: #000000;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    p {
      margin: 15px 0;
    }
    .warning {
      background-color: #fff8e1;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      border-left: 4px solid #ffc107;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #888;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://v0-genia-fronted.vercel.app/assets/logo.svg" alt="GENIA Logo" class="logo">
    </div>
    
    <div class="content">
      <h1>Recuperación de contraseña</h1>
      
      <p>Hola ${userName},</p>
      
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en GENIA. Si no realizaste esta solicitud, puedes ignorar este correo.</p>
      
      <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Restablecer contraseña</a>
      </div>
      
      <div class="warning">
        <p>Este enlace expirará en 24 horas por motivos de seguridad.</p>
      </div>
      
      <p>Si el botón no funciona, copia y pega la siguiente URL en tu navegador:</p>
      <p style="word-break: break-all; font-size: 12px;">${resetUrl}</p>
      
      <p>Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.</p>
      
      <p>Saludos,<br>El equipo de GENIA</p>
    </div>
    
    <div class="footer">
      <p>© 2025 GENIA. Todos los derechos reservados.</p>
      <div class="social-links">
        <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  },
  
  // Plantilla de correo de fin de prueba
  trialEnding: (userData, daysLeft) => {
    const userName = userData.name || 'Usuario';
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu prueba de GENIA está por terminar</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #67f8c0;
      color: #000000;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .countdown {
      font-size: 24px;
      font-weight: bold;
      color: #ff6b6b;
      text-align: center;
      margin: 20px 0;
    }
    .plans {
      display: flex;
      justify-content: space-between;
      margin: 30px 0;
    }
    .plan {
      flex: 1;
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 4px;
      margin: 0 10px;
      text-align: center;
    }
    .plan-title {
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .plan-price {
      font-size: 22px;
      margin: 15px 0;
    }
    .plan-features {
      list-style-type: none;
      padding: 0;
      margin: 0;
      text-align: left;
    }
    .plan-features li {
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }
    .plan-features li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #67f8c0;
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    p {
      margin: 15px 0;
    }
    .highlight {
      font-weight: bold;
      color: #4361ee;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #888;
      text-decoration: none;
    }
    @media (max-width: 600px) {
      .plans {
        flex-direction: column;
      }
      .plan {
        margin: 10px 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://v0-genia-fronted.vercel.app/assets/logo.svg" alt="GENIA Logo" class="logo">
    </div>
    
    <div class="content">
      <h1>Tu prueba gratuita está por terminar</h1>
      
      <p>Hola ${userName},</p>
      
      <p>Te recordamos que tu periodo de prueba de GENIA terminará en:</p>
      
      <div class="countdown">
        ${daysLeft} día${daysLeft !== 1 ? 's' : ''}
      </div>
      
      <p>Esperamos que hayas disfrutado de todas las funcionalidades que GENIA tiene para ofrecer. Para seguir aprovechando al máximo nuestra plataforma, te invitamos a elegir uno de nuestros planes:</p>
      
      <div class="plans">
        <div class="plan">
          <div class="plan-title">GENIA Básico</div>
          <div class="plan-price">$29/mes</div>
          <ul class="plan-features">
            <li>Acceso a 2 clones de IA</li>
            <li>500 créditos mensuales</li>
            <li>Soporte por correo</li>
          </ul>
        </div>
        
        <div class="plan" style="border-color: #67f8c0; box-shadow: 0 0 10px rgba(103, 248, 192, 0.2);">
          <div class="plan-title" style="color: #4361ee;">GENIA Pro</div>
          <div class="plan-price">$49/mes</div>
          <ul class="plan-features">
            <li>Acceso a todos los clones</li>
            <li>1500 créditos mensuales</li>
            <li>Soporte prioritario</li>
            <li>Integración con WhatsApp</li>
          </ul>
        </div>
      </div>
      
      <p>Actualiza ahora y obtén un <span class="highlight">20% de descuento</span> en tu primer mes:</p>
      
      <div style="text-align: center;">
        <a href="https://v0-genia-fronted.vercel.app/pricing.html" class="button">Actualizar mi plan</a>
      </div>
      
      <p>Si tienes alguna pregunta sobre nuestros planes o necesitas ayuda, no dudes en contactarnos respondiendo a este correo.</p>
      
      <p>Saludos,<br>El equipo de GENIA</p>
    </div>
    
    <div class="footer">
      <p>© 2025 GENIA. Todos los derechos reservados.</p>
      <p>Si deseas cancelar tu suscripción, puedes hacerlo desde tu panel de control.</p>
      <div class="social-links">
        <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  },
  
  // Plantilla de correo de notificación general
  notification: (userData, subject, message) => {
    const userName = userData.name || 'Usuario';
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject} - GENIA</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 30px 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #67f8c0;
      color: #000000;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    h1 {
      color: #333;
      margin-top: 0;
    }
    p {
      margin: 15px 0;
    }
    .message-box {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #888;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://v0-genia-fronted.vercel.app/assets/logo.svg" alt="GENIA Logo" class="logo">
    </div>
    
    <div class="content">
      <h1>${subject}</h1>
      
      <p>Hola ${userName},</p>
      
      <div class="message-box">
        ${message}
      </div>
      
      <p>Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.</p>
      
      <div style="text-align: center;">
        <a href="https://v0-genia-fronted.vercel.app/dashboard.html" class="button">Ir a mi dashboard</a>
      </div>
      
      <p>Saludos,<br>El equipo de GENIA</p>
    </div>
    
    <div class="footer">
      <p>© 2025 GENIA. Todos los derechos reservados.</p>
      <div class="social-links">
        <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
};

// Exportar las plantillas
if (typeof module !== 'undefined' && module.exports) {
  module.exports = emailTemplates;
} else {
  window.emailTemplates = emailTemplates;
}
