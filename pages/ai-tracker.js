import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import supabaseService from '../services/supabaseService';

export default function AITracker() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [metrics, setMetrics] = useState({
    funnelsGenerated: 4,
    contentsCreated: 17,
    campaignsActivated: 3,
    whatsappMessagesSent: 24,
    hoursSaved: 19.4
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await supabaseService.getCurrentUser();
        if (!user) {
          window.location.href = '/login';
          return;
        }
        
        setUserData(user);
        // Aquí se cargarían los datos reales desde la API
        // fetchMetrics();
        setLoading(false);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = '/login';
      }
    }
    
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size="large" text="Cargando tu progreso..." />
      </div>
    );
  }

  return (
    <div className="tracker-container">
      <Head>
        <title>GENIA | AI Tracker</title>
        <meta name="description" content="Seguimiento de tu progreso con GENIA" />
      </Head>

      <header className="tracker-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <Link href="/dashboard" className="logo">
                GENIA
              </Link>
            </div>
            
            <nav className="main-nav">
              <Link href="/dashboard" className="nav-item">
                Dashboard
              </Link>
              <Link href="/ai-tracker" className="nav-item active">
                AI Tracker
              </Link>
              <Link href="/marketplace" className="nav-item">
                Marketplace
              </Link>
              <Link href="/referrals" className="nav-item">
                Referidos
              </Link>
            </nav>
            
            <div className="user-section">
              <span className="user-name">{userData.user_metadata?.nombre || userData.email}</span>
              <Button variant="outline" size="small" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="tracker-main">
        <div className="container">
          <Card className="tracker-card">
            <h1>AI Tracker – Tu progreso con GENIA</h1>

            <div className="metrics-container">
              <div className="metric">
                <p>Embudos generados</p>
                <span>{metrics.funnelsGenerated}</span>
              </div>
              <div className="metric">
                <p>Contenidos creados</p>
                <span>{metrics.contentsCreated}</span>
              </div>
              <div className="metric">
                <p>Campañas activadas</p>
                <span>{metrics.campaignsActivated}</span>
              </div>
              <div className="metric">
                <p>Mensajes enviados por WhatsApp</p>
                <span>{metrics.whatsappMessagesSent}</span>
              </div>
              <div className="metric">
                <p>Horas ahorradas este mes</p>
                <span>{metrics.hoursSaved} h</span>
              </div>
            </div>

            <div className="tracker-actions">
              <Alert type="info">
                <strong>¡Consejo!</strong> Activa más clones de IA para aumentar tu productividad y ahorrar más tiempo.
              </Alert>
              <div className="buttons-row">
                <Button variant="primary">Ver detalles completos</Button>
                <Button variant="outline">Exportar informe</Button>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <footer className="tracker-footer">
        <div className="container">
          <p>© 2025 Genia AI. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style jsx>{`
        .tracker-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--color-bg-dark);
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: var(--color-bg-dark);
        }
        
        .tracker-header {
          background-color: var(--color-bg-light);
          border-bottom: 1px solid var(--color-border);
          padding: 15px 0;
          position: sticky;
          top: 0;
          z-index: var(--z-index-sticky);
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
          text-decoration: none;
        }
        
        .main-nav {
          display: flex;
          gap: 20px;
        }
        
        .nav-item {
          color: var(--color-text-secondary);
          text-decoration: none;
          padding: 5px 10px;
          border-radius: var(--border-radius-md);
          transition: all var(--transition-fast);
        }
        
        .nav-item:hover {
          color: var(--color-primary);
          background-color: rgba(103, 248, 192, 0.1);
        }
        
        .nav-item.active {
          color: var(--color-primary);
          background-color: rgba(103, 248, 192, 0.1);
        }
        
        .user-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .user-name {
          font-weight: var(--font-weight-medium);
        }
        
        .tracker-main {
          flex: 1;
          padding: 40px 0;
        }
        
        .tracker-card {
          max-width: 800px;
          margin: auto;
          padding: 30px;
        }
        
        .tracker-card h1 {
          text-align: center;
          color: var(--color-primary);
          margin-bottom: 30px;
        }
        
        .metrics-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .metric {
          background-color: var(--color-bg-dark);
          padding: 20px;
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .metric p {
          margin: 0;
          font-size: 1.1rem;
        }
        
        .metric span {
          font-size: 1.2rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
        }
        
        .tracker-actions {
          margin-top: 30px;
        }
        
        .buttons-row {
          display: flex;
          gap: 15px;
          margin-top: 20px;
          justify-content: center;
        }
        
        .tracker-footer {
          background-color: var(--color-bg-light);
          padding: 20px 0;
          text-align: center;
          color: var(--color-text-muted);
          margin-top: auto;
        }
        
        @media (max-width: 640px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
          }
          
          .main-nav {
            width: 100%;
            justify-content: space-between;
          }
          
          .buttons-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
