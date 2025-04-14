import Head from 'next/head';
import { useEffect, useState } from 'react';
import supabaseService from '../services/supabaseService';

export default function AITracker() {
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
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div>
      <Head>
        <title>GENIA | AI Tracker</title>
        <meta name="description" content="Seguimiento de tu progreso con GENIA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="tracker">
        <h1>AI Tracker – Tu progreso con GENIA</h1>

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

      <style jsx>{`
        .tracker {
          max-width: 800px;
          margin: auto;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 30px;
        }
        h1 {
          text-align: center;
          color: #67f8c0;
        }
        .metric {
          background: #101010;
          padding: 20px;
          border-radius: 10px;
          margin: 15px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .metric span {
          font-size: 1.2rem;
          font-weight: bold;
          color: #67f8c0;
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
          background: #0e0e0e;
          font-family: sans-serif;
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
