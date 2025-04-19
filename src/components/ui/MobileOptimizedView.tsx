import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/theme/useTheme';

// Componente para mostrar una interfaz móvil optimizada
const MobileOptimizedView = ({ children }: { children: React.ReactNode }) => {
  const { isDarkMode, getColorClass } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Comprobar al cargar
    checkIfMobile();
    
    // Comprobar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Si no es móvil, mostrar el contenido normal
  if (!isMobile) {
    return <>{children}</>;
  }
  
  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors duration-200`}>
      {/* Barra superior para móvil */}
      <header className={`fixed top-0 left-0 right-0 z-30 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md transition-colors duration-200`}>
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mr-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-expanded={menuOpen}
              aria-label="Abrir menú principal"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <h1 className="text-xl font-bold">Genia</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Notificaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            <button
              className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Perfil de usuario"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Menú lateral para móvil */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMenuOpen(false)}></div>
        
        <div 
          className={`absolute top-0 left-0 bottom-0 w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl transform transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold">Menú</h2>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <a 
                  href="/dashboard" 
                  className={`block px-4 py-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <i className="fas fa-home mr-2"></i>
                  Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="/clones" 
                  className={`block px-4 py-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <i className="fas fa-robot mr-2"></i>
                  Mis Clones
                </a>
              </li>
              <li>
                <a 
                  href="/analytics" 
                  className={`block px-4 py-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <i className="fas fa-chart-line mr-2"></i>
                  Análisis
                </a>
              </li>
              <li>
                <a 
                  href="/integrations" 
                  className={`block px-4 py-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <i className="fas fa-plug mr-2"></i>
                  Integraciones
                </a>
              </li>
              <li>
                <a 
                  href="/subscription" 
                  className={`block px-4 py-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <i className="fas fa-crown mr-2"></i>
                  Suscripción
                </a>
              </li>
              <li>
                <a 
                  href="/settings" 
                  className={`block px-4 py-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <i className="fas fa-cog mr-2"></i>
                  Configuración
                </a>
              </li>
            </ul>
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              className={`w-full px-4 py-2 rounded-md ${getColorClass('primary')} text-white flex justify-center items-center`}
              onClick={() => setMenuOpen(false)}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenido principal con padding para la barra superior */}
      <main className="pt-16 pb-20">
        {children}
      </main>
      
      {/* Barra de navegación inferior para móvil */}
      <nav className={`fixed bottom-0 left-0 right-0 z-30 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-up transition-colors duration-200`}>
        <div className="flex justify-around items-center px-2 py-3">
          <a 
            href="/dashboard" 
            className="flex flex-col items-center p-2"
            aria-label="Dashboard"
          >
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Inicio</span>
          </a>
          
          <a 
            href="/clones" 
            className="flex flex-col items-center p-2"
            aria-label="Mis Clones"
          >
            <i className="fas fa-robot text-lg"></i>
            <span className="text-xs mt-1">Clones</span>
          </a>
          
          <a 
            href="/create" 
            className={`flex flex-col items-center p-2 -mt-5 rounded-full ${getColorClass('primary')} text-white`}
            aria-label="Crear nuevo clon"
          >
            <i className="fas fa-plus text-lg"></i>
            <span className="text-xs mt-1">Crear</span>
          </a>
          
          <a 
            href="/analytics" 
            className="flex flex-col items-center p-2"
            aria-label="Análisis"
          >
            <i className="fas fa-chart-line text-lg"></i>
            <span className="text-xs mt-1">Análisis</span>
          </a>
          
          <a 
            href="/settings" 
            className="flex flex-col items-center p-2"
            aria-label="Configuración"
          >
            <i className="fas fa-cog text-lg"></i>
            <span className="text-xs mt-1">Ajustes</span>
          </a>
        </div>
      </nav>
    </div>
  );
};

export default MobileOptimizedView;
