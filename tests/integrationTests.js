// Pruebas para las integraciones externas
import whatsappService from './services/whatsappService';
import stripeService from './services/stripeService';
import n8nService from './services/n8nService';

/**
 * Función para probar la integración con WhatsApp
 */
async function testWhatsappIntegration() {
  console.log('=== PRUEBA DE INTEGRACIÓN CON WHATSAPP ===');
  
  try {
    // Probar obtención de estado de conexión
    console.log('Probando obtención de estado de conexión...');
    const connectionStatus = await whatsappService.getConnectionStatus();
    console.log('Estado de conexión:', connectionStatus);
    
    // Probar envío de mensaje
    console.log('\nProbando envío de mensaje...');
    const messageResult = await whatsappService.sendMessage(
      '+34600000000',
      'Este es un mensaje de prueba desde GENIA'
    );
    console.log('Resultado del envío:', messageResult);
    
    // Probar obtención de historial de mensajes
    console.log('\nProbando obtención de historial de mensajes...');
    const messageHistory = await whatsappService.getMessageHistory(3);
    console.log('Historial de mensajes:', messageHistory);
    
    console.log('\n✅ Prueba de integración con WhatsApp completada con éxito');
    return true;
  } catch (error) {
    console.error('\n❌ Error en la prueba de integración con WhatsApp:', error);
    return false;
  }
}

/**
 * Función para probar la integración con Stripe
 */
async function testStripeIntegration() {
  console.log('\n=== PRUEBA DE INTEGRACIÓN CON STRIPE ===');
  
  try {
    // Probar obtención de información de cuenta
    console.log('Probando obtención de información de cuenta...');
    const accountInfo = await stripeService.getAccountInfo();
    console.log('Información de cuenta:', accountInfo);
    
    // Probar creación de enlace de pago
    console.log('\nProbando creación de enlace de pago...');
    const paymentLinkResult = await stripeService.createPaymentLink({
      amount: 19.99,
      currency: 'EUR',
      description: 'Plan GENIA Pro - Prueba',
      metadata: {
        test: true
      }
    });
    console.log('Resultado de creación de enlace:', paymentLinkResult);
    
    // Probar obtención de historial de transacciones
    console.log('\nProbando obtención de historial de transacciones...');
    const transactionHistory = await stripeService.getTransactionHistory(3);
    console.log('Historial de transacciones:', transactionHistory);
    
    console.log('\n✅ Prueba de integración con Stripe completada con éxito');
    return true;
  } catch (error) {
    console.error('\n❌ Error en la prueba de integración con Stripe:', error);
    return false;
  }
}

/**
 * Función para probar la integración con N8N
 */
async function testN8NIntegration() {
  console.log('\n=== PRUEBA DE INTEGRACIÓN CON N8N ===');
  
  try {
    // Probar obtención de estado de conexión
    console.log('Probando obtención de estado de conexión...');
    const connectionStatus = await n8nService.getConnectionStatus();
    console.log('Estado de conexión:', connectionStatus);
    
    // Probar obtención de workflows
    console.log('\nProbando obtención de workflows...');
    const workflows = await n8nService.getWorkflows();
    console.log('Workflows disponibles:', workflows);
    
    // Probar ejecución de workflow
    if (workflows.length > 0) {
      const workflowId = workflows[0].id;
      console.log(`\nProbando ejecución de workflow ${workflowId}...`);
      const executionResult = await n8nService.executeWorkflow(workflowId, {
        testData: 'Datos de prueba',
        timestamp: new Date().toISOString()
      });
      console.log('Resultado de ejecución:', executionResult);
      
      // Probar obtención de historial de ejecuciones
      console.log(`\nProbando obtención de historial de ejecuciones para workflow ${workflowId}...`);
      const executionHistory = await n8nService.getExecutionHistory(workflowId, 3);
      console.log('Historial de ejecuciones:', executionHistory);
    }
    
    console.log('\n✅ Prueba de integración con N8N completada con éxito');
    return true;
  } catch (error) {
    console.error('\n❌ Error en la prueba de integración con N8N:', error);
    return false;
  }
}

/**
 * Función principal para ejecutar todas las pruebas
 */
async function runIntegrationTests() {
  console.log('INICIANDO PRUEBAS DE INTEGRACIONES EXTERNAS');
  console.log('==========================================');
  
  const results = {
    whatsapp: await testWhatsappIntegration(),
    stripe: await testStripeIntegration(),
    n8n: await testN8NIntegration()
  };
  
  console.log('\n==========================================');
  console.log('RESUMEN DE PRUEBAS DE INTEGRACIONES:');
  console.log(`WhatsApp: ${results.whatsapp ? '✅ ÉXITO' : '❌ FALLO'}`);
  console.log(`Stripe: ${results.stripe ? '✅ ÉXITO' : '❌ FALLO'}`);
  console.log(`N8N: ${results.n8n ? '✅ ÉXITO' : '❌ FALLO'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  console.log('\nRESULTADO FINAL:', allPassed ? '✅ TODAS LAS PRUEBAS PASARON' : '❌ ALGUNAS PRUEBAS FALLARON');
  
  return allPassed;
}

// Exportar funciones para uso en otros archivos
export {
  testWhatsappIntegration,
  testStripeIntegration,
  testN8NIntegration,
  runIntegrationTests
};

// Si este archivo se ejecuta directamente, ejecutar todas las pruebas
if (typeof window !== 'undefined' && window.location.pathname.includes('test-integrations')) {
  runIntegrationTests()
    .then(result => {
      console.log('Pruebas completadas con resultado:', result);
    })
    .catch(error => {
      console.error('Error al ejecutar pruebas:', error);
    });
}
