// Script para integrar los servicios API con el frontend de GENIA
document.addEventListener('DOMContentLoaded', function() {
  // Cargar configuración
  const supabaseUrl = GENIA_CONFIG.supabase.url;
  const supabaseKey = GENIA_CONFIG.supabase.anonKey;
  const stripeKey = GENIA_CONFIG.stripe.publicKey;
  
  console.log('GENIA inicializada con API backend:', geniaApi);
  
  // Inicializar formularios
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Obtener datos del formulario
      const formData = new FormData(form);
      const formDataObj = {};
      formData.forEach((value, key) => {
        formDataObj[key] = value;
      });
      
      // Determinar la acción basada en el ID o clase del formulario
      if (form.id === 'login-form' || form.classList.contains('login-form')) {
        try {
          const result = await geniaApi.auth.login(formDataObj.email, formDataObj.password);
          if (result.success) {
            window.location.href = '/admin.html';
          } else {
            showError('Error de inicio de sesión: ' + result.message);
          }
        } catch (error) {
          showError('Error al iniciar sesión: ' + error.message);
        }
      } else if (form.id === 'register-form' || form.classList.contains('register-form')) {
        try {
          const result = await geniaApi.auth.register(formDataObj);
          if (result.success) {
            showSuccess('Registro exitoso. Por favor, inicia sesión.');
            setTimeout(() => {
              window.location.href = '/login.html';
            }, 2000);
          } else {
            showError('Error de registro: ' + result.message);
          }
        } catch (error) {
          showError('Error al registrar: ' + error.message);
        }
      } else {
        // Para otros formularios, enviar a la ruta correspondiente
        console.log('Formulario enviado:', formDataObj);
        // Implementar lógica específica para otros formularios
      }
    });
  });
  
  // Inicializar elementos de la interfaz basados en el estado de autenticación
  initializeUI();
  
  // Cargar datos reales del backend si el usuario está autenticado
  if (geniaApi.auth.isAuthenticated()) {
    loadUserData();
    
    // Si estamos en el panel de administración, cargar datos adicionales
    if (window.location.pathname.includes('admin')) {
      loadAdminData();
    }
    
    // Si estamos en la página de marketplace
    if (window.location.pathname.includes('marketplace')) {
      loadMarketplaceData();
    }
    
    // Si estamos en la página de referidos
    if (window.location.pathname.includes('referidos')) {
      loadReferidosData();
    }
  }
});

// Función para inicializar la interfaz de usuario
function initializeUI() {
  const isAuthenticated = geniaApi.auth.isAuthenticated();
  const currentUser = geniaApi.auth.getCurrentUser();
  
  // Elementos que deben mostrarse solo cuando el usuario está autenticado
  const authElements = document.querySelectorAll('.auth-only');
  // Elementos que deben mostrarse solo cuando el usuario NO está autenticado
  const guestElements = document.querySelectorAll('.guest-only');
  // Elementos que deben mostrarse solo para administradores
  const adminElements = document.querySelectorAll('.admin-only');
  
  authElements.forEach(el => {
    el.style.display = isAuthenticated ? 'block' : 'none';
  });
  
  guestElements.forEach(el => {
    el.style.display = isAuthenticated ? 'none' : 'block';
  });
  
  adminElements.forEach(el => {
    el.style.display = (isAuthenticated && currentUser && currentUser.role === 'admin') ? 'block' : 'none';
  });
  
  // Mostrar nombre de usuario si está disponible
  const userNameElements = document.querySelectorAll('.user-name');
  if (currentUser && userNameElements) {
    userNameElements.forEach(el => {
      el.textContent = currentUser.name || currentUser.email;
    });
  }
  
  // Configurar botones de logout
  const logoutButtons = document.querySelectorAll('.logout-btn');
  logoutButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      geniaApi.auth.logout();
    });
  });
}

// Función para cargar datos del usuario
async function loadUserData() {
  try {
    const currentUser = geniaApi.auth.getCurrentUser();
    if (!currentUser) return;
    
    // Cargar datos del perfil del usuario
    const userData = await geniaApi.users.getById(currentUser.id);
    
    // Actualizar elementos de la interfaz con los datos del usuario
    const profileElements = document.querySelectorAll('.user-profile');
    profileElements.forEach(el => {
      // Actualizar campos específicos con los datos del usuario
      const fields = el.querySelectorAll('[data-field]');
      fields.forEach(field => {
        const fieldName = field.getAttribute('data-field');
        if (userData[fieldName]) {
          if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
            field.value = userData[fieldName];
          } else {
            field.textContent = userData[fieldName];
          }
        }
      });
    });
    
    // Cargar integraciones del usuario
    const integrationsContainer = document.querySelector('#user-integrations');
    if (integrationsContainer) {
      const integrations = await geniaApi.integrations.getUserIntegrations(currentUser.id);
      
      if (integrations && integrations.length > 0) {
        let html = '';
        integrations.forEach(integration => {
          html += `
            <div class="integration-card ${integration.connected ? 'connected' : ''}">
              <img src="/images/${integration.platform}.png" alt="${integration.platform}">
              <h3>${integration.platform}</h3>
              <p>${integration.connected ? 'Conectado' : 'No conectado'}</p>
              <button class="btn ${integration.connected ? 'disconnect-btn' : 'connect-btn'}" 
                      data-platform="${integration.platform}">
                ${integration.connected ? 'Desconectar' : 'Conectar'}
              </button>
            </div>
          `;
        });
        integrationsContainer.innerHTML = html;
        
        // Agregar event listeners a los botones de conexión/desconexión
        document.querySelectorAll('.connect-btn').forEach(btn => {
          btn.addEventListener('click', async function() {
            const platform = this.getAttribute('data-platform');
            // Implementar lógica de conexión específica para cada plataforma
            // Por ejemplo, abrir ventana de autenticación OAuth
          });
        });
        
        document.querySelectorAll('.disconnect-btn').forEach(btn => {
          btn.addEventListener('click', async function() {
            const platform = this.getAttribute('data-platform');
            try {
              await geniaApi.integrations.disconnect(currentUser.id, platform);
              showSuccess(`Desconectado de ${platform}`);
              loadUserData(); // Recargar datos
            } catch (error) {
              showError(`Error al desconectar de ${platform}: ${error.message}`);
            }
          });
        });
      } else {
        integrationsContainer.innerHTML = '<p>No hay integraciones disponibles</p>';
      }
    }
  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    showError('Error al cargar datos del usuario');
  }
}

// Función para cargar datos del panel de administración
async function loadAdminData() {
  try {
    // Cargar estadísticas
    const statsContainer = document.querySelector('#admin-stats');
    if (statsContainer) {
      const stats = await geniaApi.users.getStats();
      
      if (stats) {
        // Actualizar estadísticas en la interfaz
        const statsElements = statsContainer.querySelectorAll('[data-stat]');
        statsElements.forEach(el => {
          const statName = el.getAttribute('data-stat');
          if (stats[statName] !== undefined) {
            el.textContent = stats[statName];
          }
        });
      }
    }
    
    // Cargar usuarios pendientes
    const pendingUsersContainer = document.querySelector('#pending-users');
    if (pendingUsersContainer) {
      const pendingUsers = await geniaApi.users.getPending();
      
      if (pendingUsers && pendingUsers.length > 0) {
        let html = '<table class="users-table"><thead><tr><th>Nombre</th><th>Email</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>';
        pendingUsers.forEach(user => {
          html += `
            <tr>
              <td>${user.name || 'N/A'}</td>
              <td>${user.email}</td>
              <td>${new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <button class="approve-btn" data-id="${user.id}">Aprobar</button>
                <button class="reject-btn" data-id="${user.id}">Rechazar</button>
              </td>
            </tr>
          `;
        });
        html += '</tbody></table>';
        pendingUsersContainer.innerHTML = html;
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.approve-btn').forEach(btn => {
          btn.addEventListener('click', async function() {
            const userId = this.getAttribute('data-id');
            try {
              await geniaApi.users.approve(userId);
              showSuccess('Usuario aprobado');
              loadAdminData(); // Recargar datos
            } catch (error) {
              showError('Error al aprobar usuario: ' + error.message);
            }
          });
        });
        
        document.querySelectorAll('.reject-btn').forEach(btn => {
          btn.addEventListener('click', async function() {
            const userId = this.getAttribute('data-id');
            try {
              await geniaApi.users.reject(userId);
              showSuccess('Usuario rechazado');
              loadAdminData(); // Recargar datos
            } catch (error) {
              showError('Error al rechazar usuario: ' + error.message);
            }
          });
        });
      } else {
        pendingUsersContainer.innerHTML = '<p>No hay usuarios pendientes de aprobación</p>';
      }
    }
    
    // Cargar todos los usuarios
    const allUsersContainer = document.querySelector('#all-users');
    if (allUsersContainer) {
      const users = await geniaApi.users.getAll();
      
      if (users && users.length > 0) {
        let html = '<table class="users-table"><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
        users.forEach(user => {
          html += `
            <tr>
              <td>${user.name || 'N/A'}</td>
              <td>${user.email}</td>
              <td>${user.role || 'usuario'}</td>
              <td>${user.status || 'activo'}</td>
              <td>
                <button class="view-user-btn" data-id="${user.id}">Ver</button>
              </td>
            </tr>
          `;
        });
        html += '</tbody></table>';
        allUsersContainer.innerHTML = html;
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.view-user-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            // Implementar visualización detallada del usuario
          });
        });
      } else {
        allUsersContainer.innerHTML = '<p>No hay usuarios registrados</p>';
      }
    }
  } catch (error) {
    console.error('Error al cargar datos de administración:', error);
    showError('Error al cargar datos de administración');
  }
}

// Función para cargar datos del marketplace
async function loadMarketplaceData() {
  try {
    const marketplaceContainer = document.querySelector('#marketplace-apps');
    if (!marketplaceContainer) return;
    
    // Implementar llamada a la API para obtener aplicaciones del marketplace
    // Esta es una implementación de ejemplo, deberá adaptarse a la API real
    const apps = await geniaApi.get('/api/marketplace/apps');
    
    if (apps && apps.length > 0) {
      let html = '';
      apps.forEach(app => {
        html += `
          <div class="app-card">
            <img src="${app.image}" alt="${app.name}">
            <h3>${app.name}</h3>
            <p>${app.description}</p>
            <div class="app-price">${app.price > 0 ? `$${app.price}` : 'Gratis'}</div>
            <button class="btn install-app-btn" data-id="${app.id}">Instalar</button>
          </div>
        `;
      });
      marketplaceContainer.innerHTML = html;
      
      // Agregar event listeners a los botones de instalación
      document.querySelectorAll('.install-app-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          const appId = this.getAttribute('data-id');
          try {
            const currentUser = geniaApi.auth.getCurrentUser();
            if (!currentUser) {
              window.location.href = '/login.html';
              return;
            }
            
            // Implementar lógica de instalación/compra
            const result = await geniaApi.post('/api/marketplace/install', {
              appId,
              userId: currentUser.id
            });
            
            if (result.success) {
              showSuccess('Aplicación instalada correctamente');
            } else {
              showError('Error al instalar la aplicación: ' + result.message);
            }
          } catch (error) {
            showError('Error al instalar la aplicación: ' + error.message);
          }
        });
      });
    } else {
      marketplaceContainer.innerHTML = '<p>No hay aplicaciones disponibles en el marketplace</p>';
    }
  } catch (error) {
    console.error('Error al cargar datos del marketplace:', error);
    showError('Error al cargar datos del marketplace');
  }
}

// Función para cargar datos de referidos
async function loadReferidosData() {
  try {
    const referidosContainer = document.querySelector('#referidos-list');
    if (!referidosContainer) return;
    
    const currentUser = geniaApi.auth.getCurrentUser();
    if (!currentUser) return;
    
    // Implementar llamada a la API para obtener referidos del usuario
    const referidos = await geniaApi.get(`/api/users/${currentUser.id}/referrals`);
    
    if (referidos && referidos.length > 0) {
      let html = '<table class="referidos-table"><thead><tr><th>Nombre</th><th>Email</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>';
      referidos.forEach(referido => {
        html += `
          <tr>
            <td>${referido.name || 'N/A'}</td>
            <td>${referido.email}</td>
            <td>${referido.status}</td>
            <td>${new Date(referido.created_at).toLocaleDateString()}</td>
          </tr>
        `;
      });
      html += '</tbody></table>';
      
      // Mostrar también el enlace de referido
      const referralLink = `${window.location.origin}/register?ref=${currentUser.referral_code}`;
      html += `
        <div class="referral-link-container">
          <h3>Tu enlace de referido:</h3>
          <div class="referral-link">
            <input type="text" value="${referralLink}" readonly id="referral-link-input">
            <button class="copy-btn" data-clipboard-target="#referral-link-input">Copiar</button>
          </div>
        </div>
      `;
      
      referidosContainer.innerHTML = html;
      
      // Inicializar botón de copiar
      const copyBtn = document.querySelector('.copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          const linkInput = document.getElementById('referral-link-input');
          linkInput.select();
          document.execCommand('copy');
          showSuccess('Enlace copiado al portapapeles');
        });
      }
    } else {
      // Mostrar mensaje y enlace de referido aunque no haya referidos
      const referralLink = `${window.location.origin}/register?ref=${currentUser.referral_code}`;
      let html = `
        <p>Aún no tienes referidos. Comparte tu enlace para comenzar a ganar recompensas.</p>
        <div class="referral-link-container">
          <h3>Tu enlace de referido:</h3>
          <div class="referral-link">
            <input type="text" value="${referralLink}" readonly id="referral-link-input">
            <button class="copy-btn" data-clipboard-target="#referral-link-input">Copiar</button>
          </div>
        </div>
      `;
      referidosContainer.innerHTML = html;
      
      // Inicializar botón de copiar
      const copyBtn = document.querySelector('.copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          const linkInput = document.getElementById('referral-link-input');
          linkInput.select();
          document.execCommand('copy');
          showSuccess('Enlace copiado al portapapeles');
        });
      }
    }
  } catch (error) {
    console.error('Error al cargar datos de referidos:', error);
    showError('Error al cargar datos de referidos');
  }
}

// Funciones de utilidad para mostrar mensajes
function showSuccess(message) {
  // Implementar lógica para mostrar mensajes de éxito
  if (window.Toastify) {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "#4CAF50"
    }).showToast();
  } else {
    alert(message);
  }
}

function showError(message) {
  // Implementar lógica para mostrar mensajes de error
  if (window.Toastify) {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: "#F44336"
    }).showToast();
  } else {
    alert('Error: ' + message);
  }
}

// Función para verificar el estado del usuario
async function checkUserStatus(email) {
  try {
    // Implementar lógica real para verificar el estado del usuario
    const response = await geniaApi.post('/api/auth/check-status', { email });
    return response.status;
  } catch (error) {
    console.error('Error al verificar estado del usuario:', error);
    return 'error';
  }
}
