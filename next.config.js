/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      // Redirecciones para mantener compatibilidad con URLs antiguas
      {
        source: '/genia_admin_panel.html',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/genia_ai_tracker.html',
        destination: '/ai-tracker',
        permanent: true,
      },
      {
        source: '/genia_marketplace.html',
        destination: '/marketplace',
        permanent: true,
      },
      {
        source: '/genia_referidos_panel.html',
        destination: '/referrals',
        permanent: true,
      },
      // Redirecciones para rutas simplificadas
      {
        source: '/referidos',
        destination: '/referrals',
        permanent: true,
      },
      {
        source: '/admin-panel',
        destination: '/admin',
        permanent: true,
      }
    ]
  },
  // Configuración para optimización de imágenes
  images: {
    domains: ['axfcmtrhsvmtzqqhxwul.supabase.co'],
  },
  // Configuración para entorno de desarrollo
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://axfcmtrhsvmtzqqhxwul.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjA2MzksImV4cCI6MjA1OTM5NjYzOX0.F7X3QI2AL90Q-XZjWceSuW45vDMBjz7txTqge4lwxtQ',
  }
}

module.exports = nextConfig
