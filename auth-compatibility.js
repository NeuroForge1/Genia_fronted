// Solución alternativa para la autenticación en el Proyecto GENIA
// Este archivo debe ser incluido directamente en las páginas HTML antes de cualquier otro script

// Configuración de Supabase
const SUPABASE_URL = "https://axfcmtrhsvmtzqqhxwul.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZmNtdHJoc3ZtdHpxcWh4d3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjA2MzksImV4cCI6MjA1OTM5NjYzOX0.F7X3QI2AL90Q-XZjWceSuW45vDMBjz7txTqge4lwxtQ";

// Función para cargar Supabase de forma asíncrona
async function loadSupabase() {
    return new Promise((resolve, reject) => {
        // Verificar si Supabase ya está cargado
        if (window.supabase) {
            console.log('Supabase ya está cargado');
            resolve(window.supabase);
            return;
        }

        // Cargar el script de Supabase
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.async = true;
        script.onload = () => {
            console.log('Script de Supabase cargado correctamente');
            // Crear cliente de Supabase
            window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            resolve(window.supabase);
        };
        script.onerror = (error) => {
            console.error('Error al cargar el script de Supabase:', error);
            reject(error);
        };
        document.head.appendChild(script);
    });
}

// Implementación del cliente API para compatibilidad con páginas HTML tradicionales
window.apiClient = {
    /**
     * Realiza una solicitud POST
     * @param {string} endpoint - Ruta del endpoint
     * @param {Object} data - Datos a enviar en el cuerpo de la solicitud
     * @returns {Promise} - Promesa con la respuesta
     */
    post: async function(endpoint, data) {
        console.log('apiClient.post llamado con endpoint:', endpoint);
        
        try {
            // Asegurarse de que Supabase esté cargado
            const supabaseClient = await loadSupabase();
            
            // Manejar autenticación
            if (endpoint === '/auth/login') {
                try {
                    const { data: authData, error } = await supabaseClient.auth.signInWithPassword({
                        email: data.email,
                        password: data.password
                    });
                    
                    console.log('Resultado de login con Supabase:', authData);
                    
                    if (error) throw error;
                    
                    if (authData.session) {
                        // Guardar token en localStorage
                        localStorage.setItem('genia_token', authData.session.access_token);
                        localStorage.setItem('genia_user', JSON.stringify(authData.user));
                        
                        // Redirigir al dashboard después de login exitoso
                        window.location.href = '/dashboard';
                        return {
                            token: authData.session.access_token,
                            user: authData.user
                        };
                    } else {
                        throw new Error('Error de autenticación');
                    }
                } catch (error) {
                    console.error('Error en login con Supabase:', error);
                    throw error;
                }
            } 
            // Manejar registro
            else if (endpoint === '/api/users/register') {
                try {
                    const { data: authData, error } = await supabaseClient.auth.signUp({
                        email: data.email,
                        password: data.password,
                        options: {
                            data: {
                                nombre: data.nombre,
                                negocio: data.negocio,
                                telefono: data.telefono
                            }
                        }
                    });
                    
                    console.log('Resultado de registro con Supabase:', authData);
                    
                    if (error) {
                        if (error.message.includes('already registered')) {
                            throw {
                                status: 400,
                                data: { detail: 'El email ya está registrado' }
                            };
                        }
                        throw error;
                    }
                    
                    // Redirigir al dashboard o página de confirmación después de registro exitoso
                    window.location.href = '/dashboard';
                    return { status: 'success' };
                } catch (error) {
                    console.error('Error en registro con Supabase:', error);
                    throw error;
                }
            }
            
            // Para otros endpoints, implementar según sea necesario
            console.error('Endpoint no implementado:', endpoint);
            return Promise.reject(new Error('Endpoint no implementado'));
        } catch (error) {
            console.error('Error en apiClient.post:', error);
            throw error;
        }
    },
    
    /**
     * Realiza una solicitud GET
     * @param {string} endpoint - Ruta del endpoint
     * @returns {Promise} - Promesa con la respuesta
     */
    get: async function(endpoint) {
        console.log('apiClient.get llamado con endpoint:', endpoint);
        
        try {
            // Asegurarse de que Supabase esté cargado
            const supabaseClient = await loadSupabase();
            
            // Implementar según sea necesario
            console.error('Endpoint GET no implementado:', endpoint);
            return Promise.reject(new Error('Endpoint GET no implementado'));
        } catch (error) {
            console.error('Error en apiClient.get:', error);
            throw error;
        }
    }
};

// Inicializar Supabase al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando Supabase...');
    loadSupabase()
        .then(supabaseClient => {
            console.log('Supabase inicializado correctamente');
        })
        .catch(error => {
            console.error('Error al inicializar Supabase:', error);
        });
});

console.log('Script de compatibilidad apiClient cargado correctamente');
