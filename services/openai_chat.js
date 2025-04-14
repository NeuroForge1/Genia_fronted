// OpenAI Chat Service para GENIA
// Este archivo maneja la integración con la API de OpenAI para el chat

// Usar la clave API de OpenAI desde las variables de entorno
const OPENAI_API_KEY = window.ENV ? window.ENV.OPENAI_API_KEY : '';

// Servicio de chat con OpenAI
const openaiChatService = {
  // Enviar mensaje al chat de OpenAI
  async sendMessage(message, cloneType = 'general', conversationHistory = []) {
    try {
      // Verificar si la clave API está disponible
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-demo-openai-key-for-development-purposes-only') {
        console.warn('Usando clave API de OpenAI de prueba. Esto puede afectar la funcionalidad.');
      }
      
      // Definir el sistema según el tipo de clon
      let systemMessage = '';
      
      switch(cloneType) {
        case 'content':
          systemMessage = 'Eres GENIA Content, un asistente especializado en crear contenido para redes sociales y marketing digital. Tu objetivo es ayudar a generar ideas creativas, textos persuasivos y estrategias de contenido efectivas.';
          break;
        case 'ads':
          systemMessage = 'Eres GENIA Ads, un asistente especializado en publicidad digital. Tu objetivo es ayudar a crear anuncios efectivos, optimizar campañas y maximizar el retorno de inversión en publicidad.';
          break;
        case 'ceo':
          systemMessage = 'Eres GENIA CEO, un asistente ejecutivo especializado en estrategia de negocio. Tu objetivo es ayudar con decisiones estratégicas, análisis de mercado y planificación de crecimiento empresarial.';
          break;
        case 'voice':
          systemMessage = 'Eres GENIA Voice, un asistente especializado en comunicación verbal. Tu objetivo es ayudar a crear guiones para videos, podcasts y mensajes de voz efectivos.';
          break;
        default:
          systemMessage = 'Eres GENIA, un asistente de IA que ayuda a emprendedores y negocios a crecer utilizando inteligencia artificial. Tu objetivo es proporcionar respuestas útiles, precisas y orientadas a resultados.';
      }
      
      // Preparar los mensajes para la API de OpenAI
      const messages = [
        { role: 'system', content: systemMessage }
      ];
      
      // Añadir el historial de conversación si existe
      if (conversationHistory && conversationHistory.length > 0) {
        // Limitar el historial a las últimas 10 interacciones para evitar tokens excesivos
        const limitedHistory = conversationHistory.slice(-20);
        limitedHistory.forEach(item => {
          messages.push(item);
        });
      }
      
      // Añadir el mensaje actual del usuario si no está en el historial
      const lastMessage = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : null;
      if (!lastMessage || lastMessage.role !== 'user' || lastMessage.content !== message) {
        messages.push({ role: 'user', content: message });
      }
      
      // Implementar mecanismo de reintentos
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          // Realizar la solicitud a la API de OpenAI
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4-turbo',
              messages: messages,
              max_tokens: 1000,
              temperature: 0.7
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error en la API de OpenAI: ${errorData.error?.message || response.statusText}`);
          }
          
          const data = await response.json();
          return {
            success: true,
            message: data.choices[0].message.content,
            usage: data.usage
          };
        } catch (error) {
          lastError = error;
          console.warn(`Intento ${attempts + 1} fallido: ${error.message}`);
          attempts++;
          
          // Esperar antes de reintentar (backoff exponencial)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron
      throw lastError || new Error('Error desconocido al comunicarse con OpenAI');
    } catch (error) {
      console.error('Error al enviar mensaje a OpenAI:', error);
      return {
        success: false,
        message: `Error al procesar tu mensaje: ${error.message}`
      };
    }
  },
  
  // Generar contenido específico con OpenAI
  async generateContent(prompt, contentType, parameters = {}) {
    try {
      // Verificar si la clave API está disponible
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-demo-openai-key-for-development-purposes-only') {
        console.warn('Usando clave API de OpenAI de prueba. Esto puede afectar la funcionalidad.');
      }
      
      let systemMessage = '';
      
      switch(contentType) {
        case 'social_post':
          systemMessage = 'Genera un post para redes sociales que sea atractivo, persuasivo y optimizado para generar engagement.';
          break;
        case 'email':
          systemMessage = 'Genera un email de marketing que sea persuasivo, claro y con un llamado a la acción efectivo.';
          break;
        case 'ad_copy':
          systemMessage = 'Genera un texto publicitario conciso, persuasivo y orientado a conversiones.';
          break;
        case 'product_description':
          systemMessage = 'Genera una descripción de producto detallada, persuasiva y que destaque los beneficios principales.';
          break;
        default:
          systemMessage = 'Genera contenido de alta calidad basado en las siguientes instrucciones.';
      }
      
      // Añadir parámetros específicos al prompt
      let enhancedPrompt = prompt;
      if (parameters.tone) {
        enhancedPrompt += `\nTono: ${parameters.tone}`;
      }
      if (parameters.length) {
        enhancedPrompt += `\nLongitud aproximada: ${parameters.length} palabras`;
      }
      if (parameters.target_audience) {
        enhancedPrompt += `\nAudiencia objetivo: ${parameters.target_audience}`;
      }
      
      // Implementar mecanismo de reintentos
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          // Realizar la solicitud a la API de OpenAI
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4-turbo',
              messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: enhancedPrompt }
              ],
              max_tokens: 1500,
              temperature: 0.8
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error en la API de OpenAI: ${errorData.error?.message || response.statusText}`);
          }
          
          const data = await response.json();
          return {
            success: true,
            content: data.choices[0].message.content,
            usage: data.usage
          };
        } catch (error) {
          lastError = error;
          console.warn(`Intento ${attempts + 1} fallido: ${error.message}`);
          attempts++;
          
          // Esperar antes de reintentar (backoff exponencial)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron
      throw lastError || new Error('Error desconocido al comunicarse con OpenAI');
    } catch (error) {
      console.error('Error al generar contenido con OpenAI:', error);
      return {
        success: false,
        content: null,
        message: `Error al generar contenido: ${error.message}`
      };
    }
  },
  
  // Analizar texto con OpenAI
  async analyzeText(text, analysisType) {
    try {
      // Verificar si la clave API está disponible
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-demo-openai-key-for-development-purposes-only') {
        console.warn('Usando clave API de OpenAI de prueba. Esto puede afectar la funcionalidad.');
      }
      
      let systemMessage = '';
      let userPrompt = '';
      
      switch(analysisType) {
        case 'sentiment':
          systemMessage = 'Eres un experto en análisis de sentimiento. Analiza el siguiente texto y determina si el sentimiento es positivo, negativo o neutral. Proporciona una puntuación de -10 a 10 y explica brevemente tu análisis.';
          userPrompt = `Analiza el sentimiento del siguiente texto:\n\n${text}`;
          break;
        case 'keywords':
          systemMessage = 'Eres un experto en SEO y análisis de contenido. Extrae las palabras clave más relevantes del siguiente texto, ordenadas por importancia.';
          userPrompt = `Extrae las palabras clave más importantes del siguiente texto:\n\n${text}`;
          break;
        case 'readability':
          systemMessage = 'Eres un experto en análisis de legibilidad. Evalúa la facilidad de lectura del siguiente texto, identifica áreas de mejora y sugiere cambios para hacerlo más claro y accesible.';
          userPrompt = `Analiza la legibilidad del siguiente texto:\n\n${text}`;
          break;
        default:
          systemMessage = 'Analiza el siguiente texto y proporciona insights útiles sobre su contenido, estructura y efectividad.';
          userPrompt = `Analiza el siguiente texto:\n\n${text}`;
      }
      
      // Implementar mecanismo de reintentos
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;
      
      while (attempts < maxAttempts) {
        try {
          // Realizar la solicitud a la API de OpenAI
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4-turbo',
              messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: userPrompt }
              ],
              max_tokens: 1000,
              temperature: 0.3
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error en la API de OpenAI: ${errorData.error?.message || response.statusText}`);
          }
          
          const data = await response.json();
          return {
            success: true,
            analysis: data.choices[0].message.content,
            usage: data.usage
          };
        } catch (error) {
          lastError = error;
          console.warn(`Intento ${attempts + 1} fallido: ${error.message}`);
          attempts++;
          
          // Esperar antes de reintentar (backoff exponencial)
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
          }
        }
      }
      
      // Si llegamos aquí, todos los intentos fallaron
      throw lastError || new Error('Error desconocido al comunicarse con OpenAI');
    } catch (error) {
      console.error('Error al analizar texto con OpenAI:', error);
      return {
        success: false,
        analysis: null,
        message: `Error al analizar texto: ${error.message}`
      };
    }
  }
};

// Agregar el servicio de chat de OpenAI al objeto geniaApi
if (typeof geniaApi !== 'undefined') {
  geniaApi.openai = openaiChatService;
} else {
  console.error('Error: geniaApi no está definido. No se puede agregar el servicio de chat de OpenAI.');
}

// Exportar el servicio de chat de OpenAI
window.openaiChatService = openaiChatService;
