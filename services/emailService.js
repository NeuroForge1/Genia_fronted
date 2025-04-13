/**
 * Servicio para integración con Brevo (Email)
 */
const emailService = {
  /**
   * Enviar email
   * @param {string} to - Email del destinatario
   * @param {string} subject - Asunto del email
   * @param {string} htmlContent - Contenido HTML del email
   * @param {Object} params - Parámetros adicionales (opcional)
   * @returns {Promise} - Promesa con el resultado del envío
   */
  async sendEmail(to, subject, htmlContent, params = {}) {
    try {
      const response = await fetch('https://genia-backend.onrender.com/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        },
        body: JSON.stringify({
          to,
          subject,
          htmlContent,
          params
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar email');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Email enviado correctamente',
        data
      };
    } catch (error) {
      console.error('Error al enviar email:', error);
      return {
        status: 'error',
        message: 'No se pudo enviar el email',
        error: error.message
      };
    }
  },
  
  /**
   * Enviar email de bienvenida
   * @param {string} to - Email del destinatario
   * @param {string} name - Nombre del destinatario
   * @returns {Promise} - Promesa con el resultado del envío
   */
  async sendWelcomeEmail(to, name) {
    const subject = '¡Bienvenido a GENIA!';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a6cf7;">¡Bienvenido a GENIA!</h1>
        <p>Hola ${name},</p>
        <p>Gracias por registrarte en GENIA, tu plataforma SaaS basada en IA para crear clones inteligentes, generar embudos, contenido y automatizaciones desde WhatsApp.</p>
        <p>Con GENIA podrás:</p>
        <ul>
          <li>Crear clones inteligentes que interactúen con tus clientes</li>
          <li>Generar embudos de venta automatizados</li>
          <li>Crear contenido de alta calidad con IA</li>
          <li>Automatizar tus comunicaciones por WhatsApp</li>
        </ul>
        <p>Para comenzar, accede a tu <a href="https://v0-genia-fronted.vercel.app/dashboard" style="color: #4a6cf7;">dashboard</a> y explora todas las funcionalidades.</p>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>¡Saludos!</p>
        <p>El equipo de GENIA</p>
      </div>
    `;
    
    return this.sendEmail(to, subject, htmlContent);
  },
  
  /**
   * Enviar email de confirmación de compra
   * @param {string} to - Email del destinatario
   * @param {string} name - Nombre del destinatario
   * @param {Object} orderDetails - Detalles de la orden
   * @returns {Promise} - Promesa con el resultado del envío
   */
  async sendPurchaseConfirmationEmail(to, name, orderDetails) {
    const subject = 'Confirmación de compra - GENIA';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4a6cf7;">Confirmación de Compra</h1>
        <p>Hola ${name},</p>
        <p>Gracias por tu compra en GENIA. A continuación, encontrarás los detalles de tu pedido:</p>
        <div style="background-color: #f5f7fb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Detalles del pedido:</h3>
          <p><strong>ID de pedido:</strong> ${orderDetails.orderId}</p>
          <p><strong>Fecha:</strong> ${orderDetails.date}</p>
          <p><strong>Plan:</strong> ${orderDetails.plan}</p>
          <p><strong>Monto:</strong> ${orderDetails.amount}</p>
        </div>
        <p>Puedes acceder a tu factura desde tu <a href="https://v0-genia-fronted.vercel.app/dashboard/billing" style="color: #4a6cf7;">panel de facturación</a>.</p>
        <p>Si tienes alguna pregunta sobre tu compra, no dudes en contactarnos.</p>
        <p>¡Gracias por confiar en GENIA!</p>
        <p>El equipo de GENIA</p>
      </div>
    `;
    
    return this.sendEmail(to, subject, htmlContent);
  },
  
  /**
   * Verificar estado de la integración con Brevo
   * @returns {Promise} - Promesa con el estado de la integración
   */
  async checkStatus() {
    try {
      const response = await fetch('https://genia-backend.onrender.com/api/email/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genia_token')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al verificar estado del servicio de email');
      }
      
      const data = await response.json();
      return {
        status: 'success',
        message: 'Estado del servicio de email verificado correctamente',
        data
      };
    } catch (error) {
      console.error('Error al verificar estado del servicio de email:', error);
      return {
        status: 'error',
        message: 'No se pudo verificar el estado del servicio de email',
        error: error.message
      };
    }
  }
};

export default emailService;
