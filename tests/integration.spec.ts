import { test, expect } from '@playwright/test';

// Pruebas de integración para el MCP y los clones
test.describe('Pruebas de integración del MCP', () => {
  // Configuración antes de cada prueba
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/login');
    
    // Iniciar sesión con credenciales de prueba
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Esperar a que se cargue el dashboard
    await page.waitForURL('/dashboard');
  });

  // Prueba de integración del MCP con el clon Content
  test('El MCP debe dirigir correctamente solicitudes de contenido al clon Content', async ({ page }) => {
    // Navegar a la página de chat
    await page.goto('/dashboard');
    
    // Enviar un mensaje relacionado con contenido
    const mensaje = 'Crea un artículo sobre marketing digital para mi blog';
    await page.fill('textarea[placeholder="Escribe tu mensaje..."]', mensaje);
    await page.click('button[type="submit"]');
    
    // Esperar la respuesta
    await page.waitForSelector('.response-message');
    
    // Verificar que la respuesta proviene del clon Content
    const cloneType = await page.textContent('.clone-type');
    expect(cloneType).toContain('content');
    
    // Verificar que la respuesta contiene elementos esperados para un artículo
    const responseText = await page.textContent('.response-message');
    expect(responseText).toContain('marketing digital');
  });

  // Prueba de integración del MCP con el clon Ads
  test('El MCP debe dirigir correctamente solicitudes de publicidad al clon Ads', async ({ page }) => {
    // Navegar a la página de chat
    await page.goto('/dashboard');
    
    // Enviar un mensaje relacionado con publicidad
    const mensaje = 'Crea una campaña de anuncios para Facebook';
    await page.fill('textarea[placeholder="Escribe tu mensaje..."]', mensaje);
    await page.click('button[type="submit"]');
    
    // Esperar la respuesta
    await page.waitForSelector('.response-message');
    
    // Verificar que la respuesta proviene del clon Ads
    const cloneType = await page.textContent('.clone-type');
    expect(cloneType).toContain('ads');
    
    // Verificar que la respuesta contiene elementos esperados para una campaña
    const responseText = await page.textContent('.response-message');
    expect(responseText).toContain('Facebook');
    expect(responseText).toContain('anuncio');
  });

  // Prueba de integración de comandos por voz
  test('Los comandos por voz deben procesarse correctamente a través del MCP', async ({ page }) => {
    // Navegar a la página de comandos por voz
    await page.goto('/voice-commands');
    
    // Simular el resultado de un comando por voz (ya que no podemos hablar realmente en la prueba)
    await page.evaluate(() => {
      // Crear un evento de reconocimiento de voz simulado
      const event = new CustomEvent('voiceResult', {
        detail: {
          transcript: 'Analiza el rendimiento de mi negocio',
          confidence: 0.9
        }
      });
      // Disparar el evento en el documento
      document.dispatchEvent(event);
    });
    
    // Esperar la respuesta
    await page.waitForSelector('.response-message', { timeout: 10000 });
    
    // Verificar que la respuesta proviene del clon CEO (ya que es una solicitud de análisis de negocio)
    const cloneType = await page.textContent('.clone-type');
    expect(cloneType).toContain('ceo');
  });

  // Prueba de integración con Stripe
  test('El sistema de suscripciones con Stripe debe funcionar correctamente', async ({ page }) => {
    // Navegar a la página de suscripciones
    await page.goto('/subscription');
    
    // Seleccionar un plan
    await page.click('button[data-plan="pro"]');
    
    // Verificar que se redirige a la página de checkout de Stripe
    await page.waitForURL(/checkout.stripe.com/);
  });

  // Prueba de integración con Supabase
  test('La autenticación con Supabase debe funcionar correctamente', async ({ page }) => {
    // Cerrar sesión primero
    await page.goto('/dashboard');
    await page.click('button.logout-button');
    
    // Esperar a que se redirija a la página de login
    await page.waitForURL('/login');
    
    // Iniciar sesión con credenciales de prueba
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Verificar que se redirige al dashboard después de iniciar sesión
    await page.waitForURL('/dashboard');
    
    // Verificar que el nombre de usuario aparece en la página
    const username = await page.textContent('.user-name');
    expect(username).toBeTruthy();
  });
});
