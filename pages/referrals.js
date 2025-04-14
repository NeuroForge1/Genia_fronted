import Head from 'next/head';
import { useEffect, useState } from 'react';
import supabaseService from '../services/supabaseService';

export default function Referrals() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [referralData, setReferralData] = useState({
    referralCode: 'christhian123',
    referralLink: 'https://genia.app?ref=christhian123',
    activeReferrals: 3,
    rewardsEarned: '+7 días Pro',
    nextReward: '5 referidos = Upgrade a GENIA Pro'
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
        // fetchReferralData();
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralData.referralLink)
      .then(() => {
        alert('Enlace copiado al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar enlace:', err);
        alert('No se pudo copiar el enlace');
      });
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div>
      <Head>
        <title>GENIA | Sistema de Referidos</title>
        <meta name="description" content="Invita y gana con GENIA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <h2>Invita y gana con GENIA</h2>
        <p>Comparte tu enlace único y gana contenido, embudos y upgrades automáticos.</p>

        <div className="refer-link">
          Tu enlace de referidos:<br />
          <code>{referralData.referralLink}</code>
          <button className="btn" onClick={copyReferralLink}>Copiar enlace</button>
        </div>

        <div className="stats">
          <h3>Tu progreso</h3>
          <p>Referidos activos: <strong>{referralData.activeReferrals}</strong></p>
          <p>Recompensas ganadas: <strong>{referralData.rewardsEarned}</strong></p>
          <p>Próxima recompensa: <strong>{referralData.nextReward}</strong></p>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: auto;
          background: #1a1a1a;
          padding: 30px;
          border-radius: 12px;
          border: 1px solid #67f8c0;
        }
        h2 {
          color: #67f8c0;
          margin-top: 0;
        }
        .refer-link {
          background: #101010;
          border: 1px solid #444;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          font-size: 0.95rem;
        }
        .btn {
          background: #67f8c0;
          color: #101010;
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: bold;
          margin-top: 10px;
        }
        .stats {
          background: #131313;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .stats p {
          margin: 8px 0;
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
          margin: 0;
          padding: 40px;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
