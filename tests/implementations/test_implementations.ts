/**
 * Script de prueba para las implementaciones de GENIA
 * 
 * Este script prueba las funcionalidades implementadas:
 * - Generación de imágenes con OpenAI
 * - Integración con Stripe para pagos
 * - Integración con Twilio para WhatsApp
 * - Análisis mejorado de intenciones en el MCP
 */

import { ImageConnector } from '../lib/connectors/image';
import openAIService from '../lib/services/openai';
import stripeService, { SubscriptionPlan } from '../lib/services/stripe';
import twilioService from '../lib/services/twilio';

// Configuración de prueba
const TEST_USER_ID = 'test-user-123';
const TEST_CUSTOMER_EMAIL = 'test@example.com';
const TEST_PHONE_NUMBER = '+1234567890'; // Número de prueba

// Interfaces para resultados de pruebas
interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'SIMULATED' | 'ERROR';
  details: string;
}

interface TestStats {
  total: number;
  pass: number;
  partial: number;
  fail: number;
  simulated: number;
  error: number;
}

interface TestSummary {
  results: TestResult[];
  stats: TestStats;
}

// Función principal de prueba
export async function runTests(): Promise<TestSummary> {
  console.log('=== INICIANDO PRUEBAS DE IMPLEMENTACIONES DE GENIA ===');
  
  // Crear instancias de los servicios
  const imageConnector = new ImageConnector();
  
  // Array para almacenar resultados de las pruebas
  const testResults: TestResult[] = [];
  
  // 1. Probar generación de imágenes
  console.log('\n--- Prueba de Generación de Imágenes ---');
  try {
    console.log('Generando imagen con OpenAI...');
    const imagePrompt = 'Un logo moderno para una empresa de marketing digital llamada GENIA, con colores azul y morado';
    
    const imageResult = await imageConnector.generateImage(imagePrompt, {
      model: 'dall-e-2', // Usar DALL-E 2 para pruebas (más económico)
      size: '256x256'    // Tamaño pequeño para pruebas
    });
    
    if (imageResult.success) {
      console.log('✅ Imagen generada exitosamente');
      console.log(`URL de la imagen: ${imageResult.urls?.[0]}`);
      testResults.push({
        test: 'Generación de Imágenes',
        status: 'PASS',
        details: 'Imagen generada correctamente'
      });
    } else {
      console.log('❌ Error al generar imagen:', imageResult.error);
      testResults.push({
        test: 'Generación de Imágenes',
        status: 'FAIL',
        details: `Error: ${imageResult.error}`
      });
    }
  } catch (error: any) {
    console.log('❌ Error en prueba de generación de imágenes:', error.message);
    testResults.push({
      test: 'Generación de Imágenes',
      status: 'ERROR',
      details: error.message
    });
  }
  
  // 2. Probar análisis de intenciones
  console.log('\n--- Prueba de Análisis de Intenciones ---');
  try {
    console.log('Analizando intención con OpenAI...');
    const testMessages = [
      'Necesito crear contenido para mi blog sobre marketing digital',
      'Quiero lanzar una campaña publicitaria en Facebook para mi tienda online',
      'Ayúdame a desarrollar una estrategia de crecimiento para mi startup'
    ];
    
    for (const message of testMessages) {
      console.log(`\nMensaje: "${message}"`);
      const intentResult = await openAIService.analyzeIntent(message);
      
      if (intentResult.success) {
        console.log('✅ Intención analizada exitosamente');
        console.log(`Intención primaria: ${intentResult.primaryIntent}`);
        console.log(`Intención secundaria: ${intentResult.secondaryIntent || 'N/A'}`);
        console.log(`Confianza: ${intentResult.confidence}`);
        console.log('Entidades:', intentResult.entities);
        
        testResults.push({
          test: `Análisis de Intención: "${message.substring(0, 30)}..."`,
          status: 'PASS',
          details: `Intención: ${intentResult.primaryIntent}, Confianza: ${intentResult.confidence}`
        });
      } else {
        console.log('❌ Error al analizar intención:', intentResult.error);
        
        // Verificar si hay un análisis de fallback
        if (intentResult.fallbackIntent) {
          console.log('Usando análisis de fallback:');
          console.log(`Intención: ${intentResult.fallbackIntent.primaryIntent}`);
          console.log(`Confianza: ${intentResult.fallbackIntent.confidence}`);
          
          testResults.push({
            test: `Análisis de Intención: "${message.substring(0, 30)}..."`,
            status: 'PARTIAL',
            details: `Fallback usado. Intención: ${intentResult.fallbackIntent.primaryIntent}`
          });
        } else {
          testResults.push({
            test: `Análisis de Intención: "${message.substring(0, 30)}..."`,
            status: 'FAIL',
            details: `Error: ${intentResult.error}`
          });
        }
      }
    }
  } catch (error: any) {
    console.log('❌ Error en prueba de análisis de intenciones:', error.message);
    testResults.push({
      test: 'Análisis de Intenciones',
      status: 'ERROR',
      details: error.message
    });
  }
  
  // 3. Probar integración con Stripe (simulación)
  console.log('\n--- Prueba de Integración con Stripe (Simulación) ---');
  try {
    console.log('Simulando creación de cliente en Stripe...');
    
    // Simulación de creación de cliente
    const customerData = {
      email: TEST_CUSTOMER_EMAIL,
      name: 'Usuario de Prueba',
      metadata: {
        userId: TEST_USER_ID
      }
    };
    
    console.log('✅ Simulación de cliente creado exitosamente');
    console.log('Datos del cliente:', customerData);
    
    // Simulación de creación de sesión de checkout
    console.log('\nSimulando creación de sesión de checkout para suscripción...');
    
    const checkoutOptions = {
      customerId: 'cus_simulated123',
      plan: SubscriptionPlan.PRO,
      successUrl: 'https://genia-fronted.vercel.app/success',
      cancelUrl: 'https://genia-fronted.vercel.app/cancel',
      metadata: {
        userId: TEST_USER_ID
      }
    };
    
    console.log('✅ Simulación de sesión de checkout creada exitosamente');
    console.log('Opciones de checkout:', checkoutOptions);
    
    testResults.push({
      test: 'Integración con Stripe',
      status: 'SIMULATED',
      details: 'Simulación de creación de cliente y sesión de checkout completada'
    });
  } catch (error: any) {
    console.log('❌ Error en prueba de integración con Stripe:', error.message);
    testResults.push({
      test: 'Integración con Stripe',
      status: 'ERROR',
      details: error.message
    });
  }
  
  // 4. Probar integración con Twilio (simulación)
  console.log('\n--- Prueba de Integración con Twilio (Simulación) ---');
  try {
    console.log('Simulando envío de mensaje de WhatsApp...');
    
    const messageData = {
      to: TEST_PHONE_NUMBER,
      body: 'Hola, este es un mensaje de prueba de GENIA',
      userId: TEST_USER_ID
    };
    
    console.log('✅ Simulación de mensaje enviado exitosamente');
    console.log('Datos del mensaje:', messageData);
    
    testResults.push({
      test: 'Integración con Twilio',
      status: 'SIMULATED',
      details: 'Simulación de envío de mensaje de WhatsApp completada'
    });
  } catch (error: any) {
    console.log('❌ Error en prueba de integración con Twilio:', error.message);
    testResults.push({
      test: 'Integración con Twilio',
      status: 'ERROR',
      details: error.message
    });
  }
  
  // Mostrar resumen de resultados
  console.log('\n=== RESUMEN DE RESULTADOS DE PRUEBAS ===');
  console.table(testResults);
  
  // Calcular estadísticas
  const stats: TestStats = {
    total: testResults.length,
    pass: testResults.filter(r => r.status === 'PASS').length,
    partial: testResults.filter(r => r.status === 'PARTIAL').length,
    fail: testResults.filter(r => r.status === 'FAIL').length,
    simulated: testResults.filter(r => r.status === 'SIMULATED').length,
    error: testResults.filter(r => r.status === 'ERROR').length
  };
  
  console.log('\nEstadísticas:');
  console.log(`Total de pruebas: ${stats.total}`);
  console.log(`Exitosas: ${stats.pass}`);
  console.log(`Parciales: ${stats.partial}`);
  console.log(`Fallidas: ${stats.fail}`);
  console.log(`Simuladas: ${stats.simulated}`);
  console.log(`Errores: ${stats.error}`);
  
  return {
    results: testResults,
    stats
  };
}

// Ejecutar las pruebas si este archivo se ejecuta directamente
if (typeof window === 'undefined') {
  runTests()
    .then(() => {
      console.log('\nPruebas completadas.');
    })
    .catch(error => {
      console.error('Error al ejecutar pruebas:', error);
    });
}

export default runTests;
