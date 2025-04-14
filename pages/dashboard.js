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

export default function Dashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    creditsUsed: 0,
    creditsTotal: 100,
    activeClones: 0,
    funnelsGenerated: 0,
    contentsCreated: 0
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const user = await supabaseService.getCurrentUser();
        if (!user) {
          window.location.href = '/login';
          return;
        }
        
        setUserData(user);
        
        // Simulación de datos para demostración
        setStats({
          creditsUsed: 42,
          creditsTotal: 100,
          activeClones: 3,
          funnelsGenerated: 2,
          contentsCreated: 15
        });
        
        setNotifications([
          { id: 1, type: 'success', message: 'Tu embudo de ventas fue generado exitosamente.' },
          { id: 2, type: 'info', message: 'Tienes 58 créditos disponibles para este mes.' },
          { id: 3, type: 'warning', message: 'Tu prueba gratuita termina en 3 días.' }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        window.location.href = '/login';
      }
    }
    
    fetchUserData();
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
        <Loader size="large" text="Cargando tu dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Head>
        <title>Dashboard - GENIA</title>
        <meta name="description" content="Panel de control de GENIA" />
      </Head>

      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <Link href="/dashboard" className="logo">
                GENIA
              </Link>
            </div>
            
            <nav className="main-nav">
              <Link href="/dashboard" className="nav-item active">
                Dashboard
              </Link>
              <Link href="/ai-tracker" className="nav-item">
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

      <main className="dashboard-main">
        <div className="container">
          <div className="welcome-section">
            <h1>Bienvenido, {userData.user_metadata?.nombre || 'Usuario'}</h1>
            <p>Este es tu centro de control para gestionar tus clones de IA y automatizaciones.</p>
          </div>
          
          <div className="stats-grid">
            <Card className="stat-card">
              <h3>Créditos</h3>
              <div className="stat-value">
                <span className="current">{stats.creditsUsed}</span>
                <span className="separator">/</span>
                <span className="total">{stats.creditsTotal}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(stats.creditsUsed / stats.creditsTotal) * 100}%` }}
                ></div>
              </div>
              <p className="stat-description">Créditos utilizados este mes</p>
            </Card>
            
            <Card className="stat-card">
              <h3>Clones Activos</h3>
              <div className="stat-value">{stats.activeClones}</div>
              <p className="stat-description">Clones de IA trabajando para ti</p>
              <Button variant="outline" size="small" className="stat-action">
                Gestionar clones
              </Button>
            </Card>
            
            <Card className="stat-card">
              <h3>Embudos</h3>
              <div className="stat-value">{stats.funnelsGenerated}</div>
              <p className="stat-description">Embudos de ventas generados</p>
              <Button variant="outline" size="small" className="stat-action">
                Crear nuevo
              </Button>
            </Card>
            
            <Card className="stat-card">
              <h3>Contenidos</h3>
              <div className="stat-value">{stats.contentsCreated}</div>
              <p className="stat-description">Piezas de contenido creadas</p>
              <Button variant="outline" size="small" className="stat-action">
                Crear contenido
              </Button>
            </Card>
          </div>
          
          <div className="dashboard-sections">
            <div className="section-left">
              <Card className="clones-section">
                <h2>Tus Clones de IA</h2>
                <div className="clones-list">
                  <div className="clone-item">
                    <div className="clone-icon ceo">CEO</div>
                    <div className="clone-details">
                      <h4>GENIA CEO</h4>
                      <p>Estrategia y crecimiento de negocio</p>
                    </div>
                    <Button variant="primary" size="small">Activar</Button>
                  </div>
                  
                  <div className="clone-item">
                    <div className="clone-icon content">Content</div>
                    <div className="clone-details">
                      <h4>GENIA Content</h4>
                      <p>Creación de contenido para redes</p>
                    </div>
                    <Button variant="primary" size="small">Activar</Button>
                  </div>
                  
                  <div className="clone-item">
                    <div className="clone-icon funnel">Funnel</div>
                    <div className="clone-details">
                      <h4>GENIA Funnel</h4>
                      <p>Embudos de venta y conversión</p>
                    </div>
                    <Button variant="primary" size="small">Activar</Button>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="section-right">
              <Card className="notifications-section">
                <h2>Notificaciones</h2>
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <Alert 
                      key={notification.id}
                      type={notification.type}
                      dismissible={true}
                      className="notification-item"
                    >
                      {notification.message}
                    </Alert>
                  ))}
                </div>
              </Card>
              
              <Card className="quick-actions">
                <h2>Acciones Rápidas</h2>
                <div className="actions-grid">
                  <Button variant="secondary" className="action-button">
                    Generar Embudo
                  </Button>
                  <Button variant="secondary" className="action-button">
                    Crear Contenido
                  </Button>
                  <Button variant="secondary" className="action-button">
                    Invitar Amigo
                  </Button>
                  <Button variant="secondary" className="action-button">
                    Soporte
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <div className="container">
          <p>© 2025 Genia AI. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: var(--color-bg-dark);
        }
        
        .dashboard-header {
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
        
        .dashboard-main {
          flex: 1;
          padding: 40px 0;
        }
        
        .welcome-section {
          margin-bottom: 30px;
        }
        
        .welcome-section h1 {
          color: var(--color-primary);
          margin-bottom: 10px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          padding: 20px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
          margin: 10px 0;
          display: flex;
          justify-content: center;
          align-items: baseline;
        }
        
        .stat-value .separator {
          margin: 0 5px;
          color: var(--color-text-muted);
        }
        
        .stat-value .total {
          color: var(--color-text-muted);
          font-size: 1.5rem;
        }
        
        .progress-bar {
          height: 8px;
          background-color: var(--color-bg-dark);
          border-radius: 4px;
          margin: 10px 0;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background-color: var(--color-primary);
          border-radius: 4px;
        }
        
        .stat-description {
          color: var(--color-text-secondary);
          margin-bottom: 15px;
        }
        
        .stat-action {
          margin-top: auto;
        }
        
        .dashboard-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .clones-section, .notifications-section, .quick-actions {
          margin-bottom: 20px;
        }
        
        .clones-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .clone-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background-color: var(--color-bg-dark);
          border-radius: var(--border-radius-md);
        }
        
        .clone-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: var(--font-weight-bold);
          font-size: 0.8rem;
        }
        
        .clone-icon.ceo {
          background-color: var(--color-secondary);
        }
        
        .clone-icon.content {
          background-color: var(--color-success);
        }
        
        .clone-icon.funnel {
          background-color: var(--color-warning);
        }
        
        .clone-details {
          flex: 1;
        }
        
        .clone-details h4 {
          margin: 0 0 5px 0;
        }
        
        .clone-details p {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }
        
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .notification-item {
          margin: 0;
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        
        .action-button {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60px;
        }
        
        .dashboard-footer {
          background-color: var(--color-bg-light);
          padding: 20px 0;
          text-align: center;
          color: var(--color-text-muted);
          margin-top: auto;
        }
        
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .dashboard-sections {
            grid-template-columns: 1fr;
          }
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
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
