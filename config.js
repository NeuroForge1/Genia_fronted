// Configuración de GENIA
const GENIA_CONFIG = {
  // Credenciales de Supabase
  supabase: {
    url: "https://axfcmtrhsvmtzqqhxwul.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjA2MzksImV4cCI6MjA1OTM5NjYzOX0.F7X3QI2AL90Q-XZjWceSuW45vDMBjz7txTqge4lwxtQ"
  },
  // Credenciales de Stripe
  stripe: {
    publicKey: "pk_test_51RD4kcP2wTWdv7Tv2X0rZJa2Fzed1nrcuyVezfIi4PNgMN5kYUu9ZHpnzjaOV1vKv6yHoYEZaF4K343JurZIGFBC009ilwKo87"
  },
  // Configuración del MCP (Motor Central de Procesamiento)
  mcp: {
    apiEndpoint: "/api/mcp",
    voiceCommandEndpoint: "/api/mcp/voice-command",
    actionsEndpoint: "/api/mcp/actions"
  }
};//
