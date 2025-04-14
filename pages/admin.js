import Head from 'next/head';
import { useEffect, useState } from 'react';
import supabaseService from '../services/supabaseService';

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    activeUsers: 89,
    creditsUsed: 15400,
    funnelsGenerated: 127,
    contentsCreated: 412,
    campaignsLaunched: 51
  });
  
  const [users, setUsers] = useState([
    {
      name: 'Andrea Díaz',
      email: 'andrea@email.com',
      business: 'Cursos de Yoga',
      plan: 'Pro',
      activeClones: 'CEO, Funnel, Content'
    },
    {
      name: 'Daniel Ruiz',
      email: 'daniel@email.com',
      business: 'Consultoría Legal',
      plan: 'Starter',
      activeClones: 'CEO'
    }
  ]);
  
  const [alerts, setAlerts] = useState([
    '⚠️ Daniel Ruiz superó el 90% de sus créditos disponibles.',
    '✅ Se activó campaña Meta Ads para Andrea Díaz.',
    '⏳ Andrea tiene prueba gratuita con 2 días restantes.'
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
        // fetchStats();
        // fetchUsers();
        // fetchAlerts();
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
        <title>GENIA Admin Panel</title>
        <meta name="description" content="Panel de administración de GENIA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header>GENIA Admin Panel</header>

      <div className="dashboard">
        <div className="stats">
          <h2>Estadísticas del sistema</h2>
          <p>Total de usuarios activos: <span className="highlight">{stats.activeUsers}</span></p>
          <p>Créditos usados este mes: <span className="highlight">{stats.creditsUsed.toLocaleString()}</span></p>
          <p>Embudos generados: <span className="highlight">{stats.funnelsGenerated}</span></p>
          <p>Contenidos creados: <span className="highlight">{stats.contentsCreated}</span></p>
          <p>Campañas lanzadas: <span className="highlight">{stats.campaignsLaunched}</span></p>
        </div>

        <div className="users">
          <h2>Usuarios registrados</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Negocio</th>
                <th>Plan</th>
                <th>Clones Activos</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.business}</td>
                  <td>{user.plan}</td>
                  <td>{user.activeClones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="actions">
          <h2>Alertas recientes</h2>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      </div>

      <style jsx>{`
        body {
          margin: 0;
          font-family: sans-serif;
          background: #101010;
          color: #fff;
        }
        header {
          background: #1e1e1e;
          padding: 20px;
          text-align: center;
          font-size: 1.5rem;
          border-bottom: 2px solid #67f8c0;
        }
        .dashboard {
          max-width: 1000px;
          margin: 30px auto;
          padding: 20px;
        }
        .stats, .users, .actions {
          background: #1b1b1b;
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 12px;
        }
        h2 {
          color: #67f8c0;
          margin-top: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #333;
          text-align: left;
        }
        .highlight {
          color: #67f8c0;
          font-weight: bold;
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
          margin: 0;
          padding: 0;
          background: #101010;
          color: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
