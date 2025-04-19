import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { SocialPlatform } from '@/lib/connectors/social';
import { EmailPlatform } from '@/lib/connectors/email';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('social');
  const [socialCredentials, setSocialCredentials] = useState([]);
  const [emailCredentials, setEmailCredentials] = useState([]);
  const [executedTasks, setExecutedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch social credentials
      const { data: socialData, error: socialError } = await supabaseClient
        .from('social_credentials')
        .select('*');
      
      if (socialError) throw socialError;
      setSocialCredentials(socialData || []);

      // Fetch email credentials
      const { data: emailData, error: emailError } = await supabaseClient
        .from('email_credentials')
        .select('*');
      
      if (emailError) throw emailError;
      setEmailCredentials(emailData || []);

      // Fetch executed tasks
      const { data: tasksData, error: tasksError } = await supabaseClient
        .from('executed_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (tasksError) throw tasksError;
      setExecutedTasks(tasksData || []);

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCredential = async (id, type) => {
    try {
      const { error } = await supabaseClient
        .from(type === 'social' ? 'social_credentials' : 'email_credentials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error deleting credential:', err);
      setError('Error al eliminar la credencial. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración GENIA</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('social')}
              className={`mr-8 py-4 px-1 ${
                activeTab === 'social'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Redes Sociales
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`mr-8 py-4 px-1 ${
                activeTab === 'email'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Email Marketing
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tareas Ejecutadas
            </button>
          </nav>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {activeTab === 'social' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Credenciales de Redes Sociales</h2>
                <button
                  onClick={() => window.location.href = '/admin/social/new'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Añadir Nueva
                </button>
              </div>
              
              {socialCredentials.length === 0 ? (
                <p className="text-gray-500">No hay credenciales de redes sociales configuradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Usuario</th>
                        <th className="py-2 px-4 border-b">Plataforma</th>
                        <th className="py-2 px-4 border-b">ID de Usuario</th>
                        <th className="py-2 px-4 border-b">ID de Página</th>
                        <th className="py-2 px-4 border-b">Expira</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {socialCredentials.map((cred) => (
                        <tr key={cred.id}>
                          <td className="py-2 px-4 border-b">{cred.user_id}</td>
                          <td className="py-2 px-4 border-b">{cred.platform}</td>
                          <td className="py-2 px-4 border-b">{cred.platform_user_id || '-'}</td>
                          <td className="py-2 px-4 border-b">{cred.page_id || '-'}</td>
                          <td className="py-2 px-4 border-b">
                            {cred.expires_at ? new Date(cred.expires_at * 1000).toLocaleString() : 'No expira'}
                          </td>
                          <td className="py-2 px-4 border-b">
                            <button
                              onClick={() => handleDeleteCredential(cred.id, 'social')}
                              className="text-red-500 hover:text-red-700 mr-2"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => window.location.href = `/admin/social/edit/${cred.id}`}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'email' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Credenciales de Email Marketing</h2>
                <button
                  onClick={() => window.location.href = '/admin/email/new'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Añadir Nueva
                </button>
              </div>
              
              {emailCredentials.length === 0 ? (
                <p className="text-gray-500">No hay credenciales de email marketing configuradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Usuario</th>
                        <th className="py-2 px-4 border-b">Plataforma</th>
                        <th className="py-2 px-4 border-b">ID de Usuario</th>
                        <th className="py-2 px-4 border-b">Prefijo de Servidor</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailCredentials.map((cred) => (
                        <tr key={cred.id}>
                          <td className="py-2 px-4 border-b">{cred.user_id}</td>
                          <td className="py-2 px-4 border-b">{cred.platform}</td>
                          <td className="py-2 px-4 border-b">{cred.platform_user_id || '-'}</td>
                          <td className="py-2 px-4 border-b">{cred.server_prefix || '-'}</td>
                          <td className="py-2 px-4 border-b">
                            <button
                              onClick={() => handleDeleteCredential(cred.id, 'email')}
                              className="text-red-500 hover:text-red-700 mr-2"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => window.location.href = `/admin/email/edit/${cred.id}`}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'tasks' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Tareas Ejecutadas</h2>
              
              {executedTasks.length === 0 ? (
                <p className="text-gray-500">No hay tareas ejecutadas registradas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Usuario</th>
                        <th className="py-2 px-4 border-b">Tipo</th>
                        <th className="py-2 px-4 border-b">Estado</th>
                        <th className="py-2 px-4 border-b">Creado</th>
                        <th className="py-2 px-4 border-b">Actualizado</th>
                        <th className="py-2 px-4 border-b">Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {executedTasks.map((task) => (
                        <tr key={task.id}>
                          <td className="py-2 px-4 border-b">{task.id}</td>
                          <td className="py-2 px-4 border-b">{task.user_id}</td>
                          <td className="py-2 px-4 border-b">{task.task_type}</td>
                          <td className="py-2 px-4 border-b">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                task.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : task.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : task.status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">{new Date(task.created_at).toLocaleString()}</td>
                          <td className="py-2 px-4 border-b">{new Date(task.updated_at).toLocaleString()}</td>
                          <td className="py-2 px-4 border-b">
                            <button
                              onClick={() => window.location.href = `/admin/tasks/${task.id}`}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Ver Detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
