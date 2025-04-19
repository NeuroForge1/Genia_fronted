import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { EmailPlatform } from '@/lib/connectors/email';

export default function EmailCredentialForm({ credential = null }) {
  const [formData, setFormData] = useState({
    platform: credential?.platform || 'mailchimp',
    apiKey: credential?.api_key || '',
    serverPrefix: credential?.server_prefix || '',
    userId: credential?.platform_user_id || '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const userId = await getCurrentUserId();
      
      if (!userId) {
        throw new Error('No se pudo obtener el ID de usuario');
      }

      const data = {
        user_id: userId,
        platform: formData.platform,
        api_key: formData.apiKey,
        server_prefix: formData.serverPrefix || null,
        platform_user_id: formData.userId || null,
      };

      let response;
      
      if (credential) {
        // Update existing credential
        response = await supabaseClient
          .from('email_credentials')
          .update(data)
          .eq('id', credential.id);
      } else {
        // Insert new credential
        response = await supabaseClient
          .from('email_credentials')
          .insert([data]);
      }

      if (response.error) {
        throw response.error;
      }

      setSuccess(true);
      
      // Redirect to admin page after 2 seconds
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
    } catch (err) {
      console.error('Error saving credential:', err);
      setError(err.message || 'Error al guardar la credencial');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUserId = async () => {
    const { data } = await supabaseClient.auth.getUser();
    return data?.user?.id;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {credential ? 'Editar' : 'Añadir'} Credencial de Email Marketing
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Credencial guardada exitosamente. Redirigiendo...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="platform">
            Plataforma
          </label>
          <select
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="mailchimp">Mailchimp</option>
            <option value="sendgrid">SendGrid</option>
            <option value="convertkit">ConvertKit</option>
            <option value="mailerlite">MailerLite</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="apiKey">
            API Key
          </label>
          <input
            id="apiKey"
            name="apiKey"
            type="text"
            value={formData.apiKey}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serverPrefix">
            Prefijo de Servidor (solo para Mailchimp)
          </label>
          <input
            id="serverPrefix"
            name="serverPrefix"
            type="text"
            value={formData.serverPrefix}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Ej: us1, us2, etc."
          />
          <p className="text-gray-600 text-xs italic mt-1">
            Para Mailchimp, es el prefijo en la URL de la API (ej: us1, us2, etc.)
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userId">
            ID de Usuario en la Plataforma (opcional)
          </label>
          <input
            id="userId"
            name="userId"
            type="text"
            value={formData.userId}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/admin'}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
