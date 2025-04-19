import React from 'react';
import { useTheme } from '../../hooks/theme/useTheme';

const ThemeSettings = () => {
  const { 
    mode, 
    color, 
    fontSize, 
    animationLevel, 
    highContrast,
    setMode,
    setColor,
    setFontSize,
    setAnimationLevel,
    toggleHighContrast,
    resetToDefaults,
    getColorClass
  } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Personalización de Tema</h2>
      
      {/* Modo de tema */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Modo de Tema</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setMode('light')}
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'light' 
                ? getColorClass('primary') + ' text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            aria-label="Activar modo claro"
          >
            <i className="fas fa-sun mr-2"></i>
            Claro
          </button>
          <button
            onClick={() => setMode('dark')}
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'dark' 
                ? getColorClass('primary') + ' text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            aria-label="Activar modo oscuro"
          >
            <i className="fas fa-moon mr-2"></i>
            Oscuro
          </button>
          <button
            onClick={() => setMode('system')}
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'system' 
                ? getColorClass('primary') + ' text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            aria-label="Usar preferencia del sistema"
          >
            <i className="fas fa-desktop mr-2"></i>
            Sistema
          </button>
        </div>
      </div>
      
      {/* Color del tema */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Color Principal</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setColor('blue')}
            className={`w-10 h-10 rounded-full bg-blue-500 border-2 ${
              color === 'blue' ? 'border-black dark:border-white' : 'border-transparent'
            }`}
            aria-label="Seleccionar color azul"
          ></button>
          <button
            onClick={() => setColor('purple')}
            className={`w-10 h-10 rounded-full bg-purple-500 border-2 ${
              color === 'purple' ? 'border-black dark:border-white' : 'border-transparent'
            }`}
            aria-label="Seleccionar color púrpura"
          ></button>
          <button
            onClick={() => setColor('green')}
            className={`w-10 h-10 rounded-full bg-green-500 border-2 ${
              color === 'green' ? 'border-black dark:border-white' : 'border-transparent'
            }`}
            aria-label="Seleccionar color verde"
          ></button>
          <button
            onClick={() => setColor('orange')}
            className={`w-10 h-10 rounded-full bg-orange-500 border-2 ${
              color === 'orange' ? 'border-black dark:border-white' : 'border-transparent'
            }`}
            aria-label="Seleccionar color naranja"
          ></button>
          <button
            onClick={() => setColor('red')}
            className={`w-10 h-10 rounded-full bg-red-500 border-2 ${
              color === 'red' ? 'border-black dark:border-white' : 'border-transparent'
            }`}
            aria-label="Seleccionar color rojo"
          ></button>
        </div>
      </div>
      
      {/* Tamaño de fuente */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Tamaño de Texto</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFontSize('small')}
            className={`px-4 py-2 rounded-md transition-colors ${
              fontSize === 'small' 
                ? getColorClass('primary') + ' text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            aria-label="Tamaño de texto pequeño"
          >
            <span className="text-sm">Pequeño</span>
          </button>
          <button
            onClick={() => setFontSize('medium')}
            className={`px-4 py-2 rounded-md transition-colors ${
              fontSize === 'medium' 
                ? getColorClass('primary') + ' text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            aria-label="Tamaño de texto mediano"
          >
            <span className="text-base">Mediano</span>
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`px-4 py-2 rounded-md transition-colors ${
              fontSize === 'large' 
                ? getColorClass('primary') + ' text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            aria-label="Tamaño de texto grande"
          >
            <span className="text-lg">Grande</span>
          </button>
        </div>
      </div>
      
      {/* Nivel de animación */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Animaciones</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setAnimationLevel('none')}
            className={`px-4 py-2 rounded-md transition-colors ${
              animationLevel === 'none' 
                ? getColorClass('primary') + ' text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            aria-label="Desactivar animaciones"
          >
            Ninguna
          </button>
          <button
            onClick={() => setAnimationLevel('minimal')}
            className={`px-4 py-2 rounded-md transition-colors ${
              animationLevel === 'minimal' 
                ? getColorClass('primary') + ' text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            aria-label="Animaciones mínimas"
          >
            Mínimas
          </button>
          <button
            onClick={() => setAnimationLevel('full')}
            className={`px-4 py-2 rounded-md transition-colors ${
              animationLevel === 'full' 
                ? getColorClass('primary') + ' text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
            }`}
            aria-label="Animaciones completas"
          >
            Completas
          </button>
        </div>
      </div>
      
      {/* Opciones de accesibilidad */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">Accesibilidad</h3>
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={highContrast}
              onChange={toggleHighContrast}
              className="sr-only peer"
              aria-label="Activar alto contraste"
            />
            <div className={`relative w-11 h-6 ${getColorClass('secondary')} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer ${
              highContrast ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            } peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
            <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Alto contraste
            </span>
          </label>
        </div>
      </div>
      
      {/* Botón para restablecer valores predeterminados */}
      <div className="mt-8">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          aria-label="Restablecer a valores predeterminados"
        >
          <i className="fas fa-undo mr-2"></i>
          Restablecer valores predeterminados
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;
