import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useTheme } from '../../hooks/theme/useTheme';
import ThemeSettings from './ThemeSettings';

// Componentes de UI
const Card = ({ title, value, icon, colorClass }: { title: string, value: string | number, icon: string, colorClass: string }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-md p-6 border-l-4 ${colorClass} transition-colors duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`rounded-full p-3 ${colorClass.replace('border-', 'bg-').replace('-500', isDarkMode ? '-800' : '-100')}`}>
          <i className={`fas ${icon} text-xl ${colorClass.replace('border-', 'text-')}`}></i>
        </div>
      </div>
    </div>
  );
};

// Componente principal del Dashboard
const Dashboard = () => {
  const { user } = useAuth();
  const { isDarkMode, getColorClass } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    messagesCount: 0,
    creditsRemaining: 0,
    activeClones: 0,
    subscriptionStatus: 'Free'
  });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentClones, setRecentClones] = useState<any[]>([]);
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Obtener estadísticas del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      // Obtener conteo de mensajes
      const { count: messagesCount, error: messagesError } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (messagesError) throw messagesError;

      // Obtener créditos restantes
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', user?.id)
        .single();

      if (creditsError) throw creditsError;

      // Obtener clones activos
      const { data: clonesData, error: clonesError } = await supabase
        .from('clones')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (clonesError) throw clonesError;

      // Obtener suscripción activa
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      // Obtener mensajes recientes
      const { data: recentMessagesData, error: recentMessagesError } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentMessagesError) throw recentMessagesError;

      // Obtener clones recientes
      const { data: recentClonesData, error: recentClonesError } = await supabase
        .from('clones_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentClonesError) throw recentClonesError;

      // Actualizar estado
      setStats({
        messagesCount: messagesCount || 0,
        creditsRemaining: creditsData?.amount || 0,
        activeClones: clonesData?.length || 0,
        subscriptionStatus: subscriptionData?.plan || 'Free'
      });

      setRecentMessages(recentMessagesData || []);
      setRecentClones(recentClonesData || []);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${getColorClass('border')}`}></div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors duration-200`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button 
          onClick={() => setShowThemeSettings(!showThemeSettings)}
          className={`px-4 py-2 rounded-md ${getColorClass('primary')} text-white flex items-center`}
          aria-label="Configurar tema"
        >
          <i className="fas fa-palette mr-2"></i>
          Personalizar Tema
        </button>
      </div>
      
      {/* Panel de configuración de tema */}
      {showThemeSettings && (
        <div className="mb-8">
          <ThemeSettings />
        </div>
      )}
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          title="Mensajes Enviados" 
          value={stats.messagesCount} 
          icon="fa-comment" 
          colorClass="border-blue-500" 
        />
        <Card 
          title="Créditos Restantes" 
          value={stats.creditsRemaining} 
          icon="fa-coins" 
          colorClass="border-yellow-500" 
        />
        <Card 
          title="Clones Activos" 
          value={stats.activeClones} 
          icon="fa-robot" 
          colorClass="border-green-500" 
        />
        <Card 
          title="Plan Actual" 
          value={stats.subscriptionStatus} 
          icon="fa-crown" 
          colorClass="border-purple-500" 
        />
      </div>

      {/* Sección de mensajes recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Mensajes Recientes</h2>
            <Link href="/messages" className={`${getColorClass('accent')} hover:underline text-sm`}>
              Ver todos
            </Link>
          </div>
          
          {recentMessages.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentMessages.map((message, index) => (
                <div key={index} className="py-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{message.clone_type || 'Sistema'}</p>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mt-1 truncate`}>{message.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>No hay mensajes recientes</p>
          )}
        </div>

        {/* Sección de actividad de clones */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Actividad de Clones</h2>
            <Link href="/clones" className={`${getColorClass('accent')} hover:underline text-sm`}>
              Ver todos
            </Link>
          </div>
          
          {recentClones.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentClones.map((clone, index) => (
                <div key={index} className="py-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{clone.clone_type}</p>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(clone.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mt-1`}>{clone.action}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>No hay actividad reciente de clones</p>
          )}
        </div>
      </div>

      {/* Botón para actualizar plan */}
      {stats.subscriptionStatus === 'Free' && (
        <div className="mt-8 text-center">
          <Link href="/subscription" className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all`}>
            Actualiza tu plan para desbloquear más funciones
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
