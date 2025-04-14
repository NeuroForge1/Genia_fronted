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

export default function Marketplace() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Embudo personalizado express',
      price: 9,
      description: 'Copy + estructura + HTML'
    },
    {
      id: 2,
      title: 'Pitch de ventas para reunión',
      price: 7,
      description: 'Guión + manejo de objeciones'
    },
    {
      id: 3,
      title: 'Pack de 5 contenidos',
      price: 15,
      description: 'Carruseles + Reels (solo texto)'
    },
    {
      id: 4,
      title: 'Campaña Meta Ads avanzada',
      price: 25,
      description: 'Copy + creativo + estructura de campaña'
    }
  ]);

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
        // fetchMarketplaceItems();
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

  const handlePurchase = (itemId) => {
    // Implementar lógica de compra
    console.log(`Comprando item ${itemId}`);
    alert(`Compra iniciada para el item ${itemId}. Esta funcionalidad estará disponible próximamente.`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader size="large" text="Cargando marketplace..." />
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <Head>
        <title>GENIA | Tienda de Automatizaciones</title>
        <meta name="description" content="Marketplace de automatizaciones de GENIA" />
      </Head>

      <header className="marketplace-header">
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
              <Link href="/marketplace" className="nav-item active">
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

      <main className="marketplace-main">
        <div className="container">
          <div className="marketplace-header-section">
            <h1>GENIA Marketplace – Tienda de Automatizaciones</h1>
            <Alert type="info" className="marketplace-info">
              Usa tus créditos o compra elementos adicionales para potenciar tu negocio.
            </Alert>
          </div>

          <div className="marketplace-items">
            {items.map((item) => (
              <Card className="marketplace-item" key={item.id}>
                <h2>{item.title}</h2>
                <div className="item-price">${item.price}</div>
                <p className="item-description"><strong>Incluye:</strong> {item.description}</p>
                <Button 
                  variant="primary" 
                  onClick={() => handlePurchase(item.id)}
                  className="item-button"
                >
                  Comprar ahora
                </Button>
              </Card>
            ))}
          </div>
          
          <div className="marketplace-footer-section">
            <Card className="marketplace-help">
              <h3>¿Necesitas algo personalizado?</h3>
              <p>Contacta con nuestro equipo para solicitar automatizaciones a medida para tu negocio.</p>
              <Button variant="secondary">Solicitar personalización</Button>
            </Card>
          </div>
        </div>
      </main>

      <footer className="marketplace-footer">
        <div className="container">
          <p>© 2025 Genia AI. Todos los derechos reservados.</p>
        </div>
      </footer>

      <style jsx>{`
        .marketplace-container {
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
        
        .marketplace-header {
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
        
        .marketplace-main {
          flex: 1;
          padding: 40px 0;
        }
        
        .marketplace-header-section {
          margin-bottom: 30px;
        }
        
        .marketplace-header-section h1 {
          text-align: center;
          color: var(--color-primary);
          margin-bottom: 20px;
        }
        
        .marketplace-info {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .marketplace-items {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .marketplace-item {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .marketplace-item h2 {
          color: var(--color-primary);
          margin-top: 0;
          font-size: 1.3rem;
        }
        
        .item-price {
          font-size: 2rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
          margin: 10px 0;
        }
        
        .item-description {
          margin-bottom: 20px;
          flex-grow: 1;
        }
        
        .item-button {
          margin-top: auto;
        }
        
        .marketplace-footer-section {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .marketplace-help {
          text-align: center;
          padding: 30px;
        }
        
        .marketplace-help h3 {
          color: var(--color-primary);
          margin-top: 0;
        }
        
        .marketplace-footer {
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
          
          .marketplace-items {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
