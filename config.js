// Configuración de GENIA
const GENIA_CONFIG = {
  // Credenciales de Supabase
  supabase: {
    url: "https://axfcmtrhsvmtzqqhxwul.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjA2MzksImV4cCI6MjA1OTM5NjYzOX0.F7X3QI2AL90Q-XZjWceSuW45vDMBjz7txTqge4lwxtQ"
  },
  
  // Credenciales de Stripe
  stripe: {
    publicKey: "pk_live_51QTIgK00gy6Lj7ju9M89ksAeF5PjacmE98vQzO4PQ7bz2XLfokSJHf5Qm5Xar11wHoinS6N4wMS4hyVv3i5gcIpz00IgMP572L"
  },
  
  // URLs de Make
  make: {
    onboardingWebhook: "https://hook.make.com/genia_onboarding_webhook",
    referidosWebhook: "https://hook.make.com/genia_referidos_webhook",
    marketplaceWebhook: "https://hook.make.com/genia_marketplace_webhook",
    aiTrackerWebhook: "https://hook.make.com/genia_ai_tracker_webhook"
  }
};
