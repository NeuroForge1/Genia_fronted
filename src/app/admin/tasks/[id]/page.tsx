import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';

export default function TaskDetailPage({ params }) {
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params?.id) {
      fetchTaskDetails(params.id);
    }
  }, [params?.id]);

  const fetchTaskDetails = async (taskId) => {
    try {
      const { data, error } = await supabaseClient
        .from('executed_tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      
      if (error) throw error;
      setTask(data);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Error al cargar los detalles de la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'No se encontró la tarea solicitada'}
        </div>
        <button
          onClick={() => window.location.href = '/admin'}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Volver al Panel de Administración
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalles de la Tarea</h1>
        <button
          onClick={() => window.location.href = '/admin'}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Volver
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-700"><span className="font-bold">ID:</span> {task.id}</p>
              <p className="text-gray-700"><span className="font-bold">Usuario:</span> {task.user_id}</p>
              <p className="text-gray-700"><span className="font-bold">Tipo:</span> {task.task_type}</p>
              <p className="text-gray-700">
                <span className="font-bold">Estado:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-xs ${
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
              </p>
            </div>
            <div>
              <p className="text-gray-700"><span className="font-bold">Creado:</span> {new Date(task.created_at).toLocaleString()}</p>
              <p className="text-gray-700"><span className="font-bold">Actualizado:</span> {new Date(task.updated_at).toLocaleString()}</p>
              {task.completed_at && (
                <p className="text-gray-700"><span className="font-bold">Completado:</span> {new Date(task.completed_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Parámetros</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <pre className="text-sm">{JSON.stringify(task.parameters, null, 2)}</pre>
          </div>
        </div>
        
        {task.result && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Resultado</h2>
            <div className="bg-gray-100 p-4 rounded overflow-auto">
              <pre className="text-sm">{JSON.stringify(task.result, null, 2)}</pre>
            </div>
          </div>
        )}
        
        {task.error && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <div className="bg-red-50 p-4 rounded overflow-auto">
              <pre className="text-sm text-red-700">{task.error}</pre>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Acciones</h2>
          <div className="flex space-x-4">
            {task.status === 'failed' && (
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => {/* Implementar lógica para reintentar */}}
              >
                Reintentar Tarea
              </button>
            )}
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => {/* Implementar lógica para eliminar */}}
            >
              Eliminar Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
