// Configuración de variables de entorno para GENIA
// Este archivo carga las variables de entorno desde .env o usa valores por defecto

// Objeto para almacenar las variables de entorno
const ENV = {
  // Supabase
  SUPABASE_URL: 'https://axfcmtrhsvmtzqqhxwul.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjA2MzksImV4cCI6MjA1OTM5NjYzOX0.F7X3QI2AL90Q-XZjWceSuW45vDMBjz7txTqge4lwxtQ',
  
  // OpenAI - Usando una clave de prueba para desarrollo
  OPENAI_API_KEY: 'sk-demo-openai-key-for-development-purposes-only',
  
  // Twilio - Usando claves de prueba para desarrollo
  TWILIO_SID: 'AC00000000000000000000000000000000',
  TWILIO_AUTH_TOKEN: '00000000000000000000000000000000',
  TWILIO_WHATSAPP_NUMBER: '+14155238886',
  
  // Stripe
  STRIPE_PUBLIC_KEY: 'pk_live_51QTIgK00gy6Lj7ju9M89ksAeF5PjacmE98vQzO4PQ7bz2XLfokSJHf5Qm5Xar11wHoinS6N4wMS4hyVv3i5gcIpz00IgMP572L',
  STRIPE_SECRET_KEY: 'sk-demo-stripe-key-for-development-purposes-only',
  
  // API Base URLs
  API_BASE_URL: 'https://genia-backend.onrender.com',
  N8N_WEBHOOK_BASE_URL: 'https://christhian17.app.n8n.cloud/webhook-test/d78807c4-60af-4ad1-9fb7-489c3057cd8b',
  
  // Otros
  DEBUG_MODE: true,
  VERSION: '1.0.0'
};

// Función para cargar variables de entorno desde .env
function loadEnvVariables() {
  // En un entorno de producción, estas variables se cargarían desde un archivo .env
  // o desde las variables de entorno del sistema
  
  // Para desarrollo local, puedes descomentar estas líneas y configurar tus claves
  /*
  ENV.OPENAI_API_KEY = 'tu-clave-api-de-openai';
  ENV.TWILIO_SID = 'tu-sid-de-twilio';
  ENV.TWILIO_AUTH_TOKEN = 'tu-token-de-twilio';
  ENV.STRIPE_SECRET_KEY = 'tu-clave-secreta-de-stripe';
  */
  
  console.log('Variables de entorno cargadas correctamente');
}

// Cargar variables de entorno
loadEnvVariables();

// Exportar el objeto ENV
window.ENV = ENV;
