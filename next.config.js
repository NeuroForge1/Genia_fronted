// Configuración de variables de entorno para Next.js
module.exports = {
  env: {
    // Configuración de Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    
    // Configuración de API
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.genia.app',
    
    // Configuración de integraciones
    WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || 'https://whatsapp.genia.app/api',
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY || 'pk_test_...',
    N8N_BASE_URL: process.env.N8N_BASE_URL || 'https://n8n.genia.app',
    
    // Configuración de la aplicación
    APP_NAME: 'GENIA',
    APP_VERSION: '1.0.0',
    APP_ENVIRONMENT: process.env.NODE_ENV || 'development',
    DEBUG_MODE: process.env.DEBUG_MODE === 'true' || false,
    
    // Configuración de análisis y monitoreo
    ANALYTICS_ID: process.env.ANALYTICS_ID || '',
    ERROR_REPORTING_DSN: process.env.ERROR_REPORTING_DSN || '',
  },
  
  // Configuración de imágenes
  images: {
    domains: ['genia.app', 'assets.genia.app', 'supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin-panel',
        permanent: false,
      },
    ];
  },
  
  // Configuración de encabezados HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Configuración de webpack para optimización
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones solo para producción
    if (!dev) {
      // Optimización de CSS
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            styles: {
              name: 'styles',
              test: /\.(css|scss)$/,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }
    
    return config;
  },
};
