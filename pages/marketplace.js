import Head from 'next/head';
import { useEffect, useState } from 'react';
import supabaseService from '../services/supabaseService';

export default function Marketplace() {
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
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  const handlePurchase = (itemId) => {
    // Implementar lógica de compra
    console.log(`Comprando item ${itemId}`);
    alert(`Compra iniciada para el item ${itemId}. Esta funcionalidad estará disponible próximamente.`);
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div>
      <Head>
        <title>GENIA | Tienda de Automatizaciones</title>
        <meta name="description" content="Marketplace de automatizaciones de GENIA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="marketplace">
        <h1>GENIA Marketplace – Tienda de Automatizaciones</h1>

        {items.map((item) => (
          <div className="item" key={item.id}>
            <h2>{item.title}</h2>
            <p><strong>Precio:</strong> ${item.price}</p>
            <p><strong>Incluye:</strong> {item.description}</p>
            <button className="btn" onClick={() => handlePurchase(item.id)}>Comprar ahora</button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .marketplace {
          max-width: 1000px;
          margin: auto;
        }
        h1 {
          text-align: center;
          color: #67f8c0;
          margin-bottom: 40px;
        }
        .item {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .item h2 {
          color: #67f8c0;
          margin-top: 0;
        }
        .item p {
          margin: 8px 0;
        }
        .btn {
          background: #67f8c0;
          color: #0e0e0e;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.5rem;
          color: #67f8c0;
        }
      `}</style>

      <style jsx global>{`
        body {
          font-family: sans-serif;
          background: #0e0e0e;
          color: #fff;
          padding: 40px;
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
