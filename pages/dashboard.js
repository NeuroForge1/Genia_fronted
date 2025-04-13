import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import supabaseService from '../services/supabaseService';
import connectionService from '../services/connectionService';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    checking: false,
    results: null
  });

  useEffect(() => {
    // Verificar autenticación al cargar la página
    const checkAuth = async () => {
      try {
        const currentUser = await supabaseService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Redirigir a login si no hay usuario autenticado
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setError('Error al verificar autenticación. Por favor, inicia sesión nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error al cerrar sesión. Por favor, intenta nuevamente.');
    }
  };

  const checkConnections = async () => {
    setConnectionStatus({ checking: true, results: null });
    try {
      const results = await connectionService.checkAllConnections();
      setConnectionStatus({ checking: false, results });
    } catch (error) {
      console.error('Error al verificar conexiones:', error);
      setConnectionStatus({ 
        checking: false, 
        results: { 
          status: 'error', 
          message: 'Error al verificar conexiones', 
          error 
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #4a6cf7;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Dashboard - GENIA</title>
        <meta name="description" content="Panel de control de GENIA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>GENIA</h2>
          </div>
          <nav className="sidebar-nav">
            <ul>
              <li className="active">
                <Link href="/dashboard">
                  <span className="icon">📊</span> Dashboard
                </Link>
              </li>
              <li>
                <Link href="/clones">
                  <span className="icon">🤖</span> Clones Inteligentes
                </Link>
              </li>
              <li>
                <Link href="/embudos">
                  <span className="icon">🔄</span> Embudos
                </Link>
              </li>
              <li>
                <Link href="/contenido">
                  <span className="icon">📝</span> Contenido
                </Link>
              </li>
              <li>
                <Link href="/whatsapp">
                  <span className="icon">💬</span> WhatsApp
                </Link>
              </li>
              <li>
                <Link href="/ai-tracker">
                  <span className="icon">📈</span> AI Tracker
                </Link>
              </li>
              <li>
                <Link href="/marketplace">
                  <span className="icon">🛒</span> Marketplace
                </Link>
              </li>
              <li>
                <Link href="/referidos">
                  <span className="icon">👥</span> Referidos
                </Link>
              </li>
              <li>
                <Link href="/configuracion">
                  <span className="icon">⚙️</span> Configuración
                </Link>
              </li>
            </ul>
          </nav>
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">
              <span className="icon">🚪</span> Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="main-content">
          <header className="dashboard-header">
            <div className="header-title">
              <h1>Dashboard</h1>
              <p>Bienvenido, {user?.user_metadata?.nombre || user?.email}</p>
            </div>
            <div className="user-menu">
              <div className="user-info">
                <span className="user-avatar">{user?.email?.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user?.email}</span>
              </div>
            </div>
          </header>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="dashboard-content">
            <div className="welcome-card">
              <h2>¡Bienvenido a GENIA!</h2>
              <p>Tu plataforma SaaS basada en IA para crear clones inteligentes, generar embudos, contenido y automatizaciones desde WhatsApp.</p>
              <div className="action-buttons">
                <Link href="/clones" className="btn btn-primary">
                  Crear Clone Inteligente
                </Link>
                <Link href="/embudos" className="btn btn-secondary">
                  Generar Embudo
                </Link>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Clones Activos</h3>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card">
                <h3>Embudos Creados</h3>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card">
                <h3>Mensajes Enviados</h3>
                <p className="stat-value">0</p>
              </div>
              <div className="stat-card">
                <h3>Contenidos Generados</h3>
                <p className="stat-value">0</p>
              </div>
            </div>

            <div className="connection-status-card">
              <h3>Estado de Conexiones</h3>
              <button 
                onClick={checkConnections} 
                className="btn btn-primary"
                disabled={connectionStatus.checking}
              >
                {connectionStatus.checking ? 'Verificando...' : 'Verificar Conexiones'}
              </button>
              
              {connectionStatus.results && (
                <div className={`connection-results ${connectionStatus.results.status}`}>
                  <h4>{connectionStatus.results.message}</h4>
                  {connectionStatus.results.results && (
                    <ul>
                      {Object.entries(connectionStatus.results.results).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value.status === 'success' ? '✅' : '❌'} {value.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
        }
        .sidebar {
          width: 260px;
          background-color: #1a1f36;
          color: white;
          display: flex;
          flex-direction: column;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-header h2 {
          margin: 0;
          font-size: 24px;
        }
        .sidebar-nav {
          flex: 1;
          padding: 20px 0;
        }
        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .sidebar-nav li {
          margin-bottom: 5px;
        }
        .sidebar-nav li a {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          transition: all 0.3s;
        }
        .sidebar-nav li.active a,
        .sidebar-nav li a:hover {
          background-color: rgba(255,255,255,0.1);
          color: white;
        }
        .icon {
          margin-right: 10px;
          font-size: 18px;
        }
        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px;
          background: none;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.3s;
        }
        .logout-btn:hover {
          background-color: rgba(255,255,255,0.1);
          color: white;
        }
        .main-content {
          flex: 1;
          background-color: #f5f7fb;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .header-title h1 {
          margin: 0;
          font-size: 24px;
          color: #1a1f36;
        }
        .header-title p {
          margin: 5px 0 0;
          color: #6b7280;
        }
        .user-menu {
          display: flex;
          align-items: center;
        }
        .user-info {
          display: flex;
          align-items: center;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #4a6cf7;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 10px;
        }
        .user-name {
          color: #1a1f36;
          font-weight: 500;
        }
        .dashboard-content {
          padding: 30px;
        }
        .error-message {
          background-color: #ffebee;
          color: #c62828;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .welcome-card {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .welcome-card h2 {
          margin-top: 0;
          color: #1a1f36;
        }
        .action-buttons {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        .btn {
          padding: 12px 20px;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }
        .btn-primary {
          background-color: #4a6cf7;
          color: white;
        }
        .btn-primary:hover {
          background-color: #3a5ce5;
        }
        .btn-primary:disabled {
          background-color: #a5b4fc;
          cursor: not-allowed;
        }
        .btn-secondary {
          background-color: #f3f4f6;
          color: #1a1f36;
        }
        .btn-secondary:hover {
          background-color: #e5e7eb;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .stat-card h3 {
          margin-top: 0;
          color: #6b7280;
          font-size: 16px;
          font-weight: 500;
        }
        .stat-value {
          font-size: 36px;
          font-weight: bold;
          color: #1a1f36;
          margin: 10px 0 0;
        }
        .connection-status-card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .connection-status-card h3 {
          margin-top: 0;
          color: #1a1f36;
        }
        .connection-results {
          margin-top: 20px;
          padding: 15px;
          border-radius: 4px;
        }
        .connection-results.success {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        .connection-results.error {
          background-color: #ffebee;
          color: #c62828;
        }
        .connection-results ul {
          margin-top: 10px;
          padding-left: 20px;
        }
        .connection-results li {
          margin-bottom: 5px;
        }
      `}</style>

      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f7fb;
          color: #333;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
