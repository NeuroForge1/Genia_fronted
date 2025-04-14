// Integración de optimizaciones de rendimiento en _app.js
import '../styles/theme.css';
import { ThemeProvider } from '../context/ThemeContext';
import Head from 'next/head';
import { useEffect } from 'react';
import { optimizeAppPerformance } from '../utils/performance';

function MyApp({ Component, pageProps }) {
  // Aplicar optimizaciones de rendimiento cuando la aplicación se monta
  useEffect(() => {
    optimizeAppPerformance({
      prefetchRoutes: true,
      lazyLoadImages: true,
      monitorPerformance: process.env.NODE_ENV === 'production',
      cacheAPIResponses: true
    });
  }, []);

  return (
    <ThemeProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>GENIA - Tu Sistema de Crecimiento con IA</title>
        <meta name="description" content="GENIA - Sistema SaaS con clones de inteligencia artificial especializados para potenciar tu negocio" />
        <meta name="theme-color" content="#0e0e0e" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Precargar fuentes críticas */}
        <link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        
        {/* Preconectar a dominios externos */}
        <link rel="preconnect" href="https://xyzcompany.supabase.co" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
