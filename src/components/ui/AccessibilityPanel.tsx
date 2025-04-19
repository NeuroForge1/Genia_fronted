import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/theme/useTheme';

// Componente para mejorar la accesibilidad de la aplicación
const AccessibilityPanel = () => {
  const { 
    fontSize, 
    setFontSize, 
    highContrast, 
    toggleHighContrast, 
    animationLevel, 
    setAnimationLevel,
    getColorClass
  } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const panel = document.getElementById('accessibility-panel');
      const button = document.getElementById('accessibility-button');
      
      if (panel && button && 
          !panel.contains(event.target as Node) && 
          !button.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative">
      {/* Botón flotante de accesibilidad */}
      <button
        id="accessibility-button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg ${getColorClass('primary')} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        aria-label="Opciones de accesibilidad"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="fixed bottom-16 right-4 z-50 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg">
          Accesibilidad
        </div>
      )}
      
      {/* Panel de accesibilidad */}
      {isOpen && (
        <div 
          id="accessibility-panel"
          className="fixed bottom-16 right-4 z-50 w-72 p-4 rounded-lg shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          role="dialog"
          aria-labelledby="accessibility-title"
        >
          <h3 id="accessibility-title" className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
            Opciones de accesibilidad
          </h3>
          
          {/* Tamaño de texto */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tamaño de texto
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFontSize('small')}
                className={`px-3 py-1 rounded-md text-sm ${
                  fontSize === 'small' 
                    ? getColorClass('primary') + ' text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
                aria-pressed={fontSize === 'small'}
              >
                A<span className="text-xs">-</span>
              </button>
              <button
                onClick={() => setFontSize('medium')}
                className={`px-3 py-1 rounded-md text-sm ${
                  fontSize === 'medium' 
                    ? getColorClass('primary') + ' text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
                aria-pressed={fontSize === 'medium'}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-3 py-1 rounded-md text-sm ${
                  fontSize === 'large' 
                    ? getColorClass('primary') + ' text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
                aria-pressed={fontSize === 'large'}
              >
                A<span className="text-xs">+</span>
              </button>
            </div>
          </div>
          
          {/* Alto contraste */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="high-contrast"
                type="checkbox"
                checked={highContrast}
                onChange={toggleHighContrast}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="high-contrast" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Alto contraste
              </label>
            </div>
          </div>
          
          {/* Nivel de animaciones */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Animaciones
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setAnimationLevel('none')}
                className={`px-3 py-1 rounded-md text-sm ${
                  animationLevel === 'none' 
                    ? getColorClass('primary') + ' text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
                aria-pressed={animationLevel === 'none'}
              >
                Ninguna
              </button>
              <button
                onClick={() => setAnimationLevel('minimal')}
                className={`px-3 py-1 rounded-md text-sm ${
                  animationLevel === 'minimal' 
                    ? getColorClass('primary') + ' text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
                aria-pressed={animationLevel === 'minimal'}
              >
                Reducidas
              </button>
              <button
                onClick={() => setAnimationLevel('full')}
                className={`px-3 py-1 rounded-md text-sm ${
                  animationLevel === 'full' 
                    ? getColorClass('primary') + ' text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
                aria-pressed={animationLevel === 'full'}
              >
                Completas
              </button>
            </div>
          </div>
          
          {/* Botón para cerrar */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;
