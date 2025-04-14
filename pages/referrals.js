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

export default function Referrals() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [referralData, setReferralData] = useState({
    referralCode: 'christhian123',
    referralLink: 'https://genia.app?ref=christhian123',
    activeReferrals: 3,
    rewardsEarned: '+7 días Pro',
    nextReward: '5 referidos = Upgrade a GENIA Pro'
  });
  const [copySuccess, setCopySuccess] = useState(false);

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
        // fetchReferralData();
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

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralData.referralLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(err => {
        console.error('Error al copiar enlace:', err);
        alert('No se pudo copiar el enlace');
      });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size="large" text="Cargando programa de referidos..." />
      </div>
    );
  }

  return (
    <div className="referrals-container">
      <Head>
        <title>GENIA | Sistema de Referidos</title>
        <meta name="description" content="Invita y gana con GENIA" />
      </Head>

      <header className="referrals-header">
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
              <Link href="/ai-tracker" className="nav-item">
                AI Tracker
              </Link>
              <Link href="/marketplace" className="nav-item">
                Marketplace
              </Link>
              <Link href="/referrals" className="nav-item active">
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

      <main className="referrals-main">
        <div className="container">
          <Card className="referrals-card">
            <h1>Invita y gana con GENIA</h1>
            <p className="referrals-subtitle">Comparte tu enlace único y gana contenido, embudos y upgrades automáticos.</p>

            {copySuccess && (
              <Alert type="success" className="copy-alert">
                ¡Enlace copiado al portapapeles!
              </Alert>
            )}

            <div className="refer-link-container">
              <h3>Tu enlace de referidos:</h3>
              <div className="refer-link">
                <code>{referralData.referralLink}</code>
                <Button 
                  variant="primary" 
                  onClick={copyReferralLink}
                  className="copy-button"
                >
                  Copiar enlace
                </Button>
              </div>
            </div>

            <div className="stats-container">
              <h3>Tu progreso</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Referidos activos:</span>
                  <span className="stat-value">{referralData.activeReferrals}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Recompensas ganadas:</span>
                  <span className="stat-value">{referralData.rewardsEarned}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Próxima recompensa:</span>
                  <span className="stat-value">{referralData.nextReward}</span>
                </div>
              </div>
            </div>

            <div className="referrals-actions">
              <Button variant="secondary" className="share-button">
                Compartir en redes sociales
              </Button>
              <Button variant="outline" className="faq-button">
                Ver preguntas frecuentes
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <footer className="referrals-footer">
        <div className="container">
          <p>© 2025 Genia AI. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style jsx>{`
        .referrals-container {
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
        
        .referrals-header {
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
        
        .referrals-main {
          flex: 1;
          padding: 40px 0;
        }
        
        .referrals-card {
          max-width: 700px;
          margin: auto;
          padding: 30px;
          border: 1px solid var(--color-primary);
        }
        
        .referrals-card h1 {
          text-align: center;
          color: var(--color-primary);
          margin-bottom: 10px;
        }
        
        .referrals-subtitle {
          text-align: center;
          color: var(--color-text-secondary);
          margin-bottom: 30px;
        }
        
        .copy-alert {
          margin-bottom: 20px;
        }
        
        .refer-link-container {
          margin-bottom: 30px;
        }
        
        .refer-link-container h3 {
          margin-bottom: 10px;
          color: var(--color-text-primary);
        }
        
        .refer-link {
          background-color: var(--color-bg-dark);
          border: 1px solid var(--color-border);
          padding: 15px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .refer-link code {
          font-family: var(--font-mono);
          color: var(--color-text-primary);
          word-break: break-all;
        }
        
        .copy-button {
          flex-shrink: 0;
        }
        
        .stats-container {
          background-color: var(--color-bg-dark);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .stats-container h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: var(--color-text-primary);
        }
        
        .stats-grid {
          display: grid;
          gap: 15px;
        }
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .stat-label {
          color: var(--color-text-secondary);
        }
        
        .stat-value {
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
        }
        
        .referrals-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .referrals-footer {
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
          
          .refer-link {
            flex-direction: column;
            align-items: stretch;
          }
          
          .copy-button {
            width: 100%;
          }
          
          .referrals-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
