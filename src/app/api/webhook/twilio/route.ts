import { NextRequest, NextResponse } from 'next/server';
import { createTwilioService } from '@/lib/twilio';
import { supabase } from '@/lib/supabase';

// Manejador para recibir webhooks de Twilio
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extraer datos del mensaje recibido
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    
    // Limpiar el número de teléfono (quitar el prefijo "whatsapp:")
    const cleanPhoneNumber = from.replace('whatsapp:', '');
    
    // Registrar el mensaje recibido en la base de datos
    const { error: dbError } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_sid: messageSid,
        from_number: cleanPhoneNumber,
        to_number: to.replace('whatsapp:', ''),
        body: body,
        direction: 'inbound',
        status: 'received'
      });
    
    if (dbError) {
      console.error('Error al guardar mensaje en la base de datos:', dbError);
    }
    
    // Buscar al usuario asociado con este número de teléfono
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('user_id, plan')
      .eq('phone_number', cleanPhoneNumber)
      .single();
    
    if (userError || !userData) {
      // Usuario no encontrado, enviar mensaje de bienvenida/registro
      await sendWelcomeMessage(cleanPhoneNumber);
      return NextResponse.json({ success: true, action: 'welcome_sent' });
    }
    
    // Procesar el mensaje según el plan del usuario
    const response = await processMessage(body, userData.user_id, userData.plan, cleanPhoneNumber);
    
    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error al procesar webhook de Twilio:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar webhook' },
      { status: 500 }
    );
  }
}

// Función para enviar mensaje de bienvenida a usuarios no registrados
async function sendWelcomeMessage(phoneNumber: string) {
  try {
    const twilioService = createTwilioService();
    
    const welcomeMessage = 
      '¡Hola! Gracias por contactar a Genia. ' +
      'Para utilizar nuestros servicios, necesitas registrarte en nuestra plataforma: ' +
      'https://genia.app/register\n\n' +
      'Una vez registrado, podrás vincular este número de WhatsApp a tu cuenta ' +
      'y comenzar a utilizar nuestros clones de IA.';
    
    await twilioService.sendWhatsAppMessage({
      to: phoneNumber,
      body: welcomeMessage
    });
    
    // Registrar mensaje enviado en la base de datos
    await supabase
      .from('whatsapp_messages')
      .insert({
        from_number: process.env.TWILIO_WHATSAPP_NUMBER || '',
        to_number: phoneNumber,
        body: welcomeMessage,
        direction: 'outbound',
        status: 'sent'
      });
      
  } catch (error) {
    console.error('Error al enviar mensaje de bienvenida:', error);
  }
}

// Función para procesar mensajes según el plan del usuario
async function processMessage(message: string, userId: string, plan: string, phoneNumber: string) {
  try {
    // Verificar límites según el plan
    const { data: usageData, error: usageError } = await supabase
      .from('user_actions')
      .select('count')
      .eq('user_id', userId)
      .eq('action_type', 'whatsapp_message')
      .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString())
      .single();
    
    // Determinar límite según el plan
    let messageLimit = 0;
    switch (plan) {
      case 'free':
        messageLimit = 10;
        break;
      case 'basic':
        messageLimit = 100;
        break;
      case 'pro':
        messageLimit = 500;
        break;
      case 'enterprise':
        messageLimit = 999999; // Prácticamente ilimitado
        break;
      default:
        messageLimit = 5; // Plan por defecto/desconocido
    }
    
    const currentUsage = usageData?.count || 0;
    
    if (currentUsage >= messageLimit) {
      // Usuario ha excedido su límite
      await sendLimitExceededMessage(phoneNumber, plan, messageLimit);
      return { status: 'limit_exceeded', plan, limit: messageLimit };
    }
    
    // Determinar qué clon debe procesar el mensaje
    // Esto es simplificado, en una implementación real se usaría NLP o palabras clave
    let cloneType = 'content'; // Por defecto
    
    if (message.toLowerCase().includes('anuncio') || message.toLowerCase().includes('publicidad')) {
      cloneType = 'ads';
    } else if (message.toLowerCase().includes('estrategia') || message.toLowerCase().includes('negocio')) {
      cloneType = 'ceo';
    } else if (message.toLowerCase().includes('presentación') || message.toLowerCase().includes('hablar')) {
      cloneType = 'voice';
    } else if (message.toLowerCase().includes('ventas') || message.toLowerCase().includes('embudo')) {
      cloneType = 'funnel';
    } else if (message.toLowerCase().includes('agenda') || message.toLowerCase().includes('tiempo')) {
      cloneType = 'calendar';
    }
    
    // Aquí se integraría con OpenAI para procesar el mensaje con el prompt adecuado
    // Por ahora, simulamos una respuesta
    const response = `[Clon ${cloneType}] Gracias por tu mensaje. En una implementación completa, este mensaje sería procesado por nuestro clon de IA especializado en ${cloneType}.`;
    
    // Enviar respuesta al usuario
    const twilioService = createTwilioService();
    await twilioService.sendWhatsAppMessage({
      to: phoneNumber,
      body: response
    });
    
    // Registrar mensaje enviado en la base de datos
    await supabase
      .from('whatsapp_messages')
      .insert({
        from_number: process.env.TWILIO_WHATSAPP_NUMBER || '',
        to_number: phoneNumber,
        body: response,
        direction: 'outbound',
        status: 'sent',
        clone_type: cloneType
      });
    
    // Incrementar contador de uso
    await supabase
      .from('user_actions')
      .insert({
        user_id: userId,
        action_type: 'whatsapp_message',
        clone_type: cloneType
      });
    
    return { status: 'processed', clone: cloneType };
  } catch (error) {
    console.error('Error al procesar mensaje:', error);
    return { status: 'error', error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

// Función para enviar mensaje de límite excedido
async function sendLimitExceededMessage(phoneNumber: string, plan: string, limit: number) {
  try {
    const twilioService = createTwilioService();
    
    const limitMessage = 
      `Has alcanzado el límite de ${limit} mensajes para tu plan ${plan} en este mes. ` +
      'Para continuar utilizando nuestros servicios, considera actualizar tu plan: ' +
      'https://genia.app/subscription';
    
    await twilioService.sendWhatsAppMessage({
      to: phoneNumber,
      body: limitMessage
    });
    
    // Registrar mensaje enviado en la base de datos
    await supabase
      .from('whatsapp_messages')
      .insert({
        from_number: process.env.TWILIO_WHATSAPP_NUMBER || '',
        to_number: phoneNumber,
        body: limitMessage,
        direction: 'outbound',
        status: 'sent'
      });
      
  } catch (error) {
    console.error('Error al enviar mensaje de límite excedido:', error);
  }
}
