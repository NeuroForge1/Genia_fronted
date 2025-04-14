import React from 'react';

/**
 * Componente Loader reutilizable
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.size='medium'] - Tamaño del loader (small, medium, large)
 * @param {string} [props.color='primary'] - Color del loader (primary, secondary, white)
 * @param {string} [props.type='spinner'] - Tipo de loader (spinner, dots, pulse)
 * @param {string} [props.text] - Texto opcional para mostrar junto al loader
 * @param {string} [props.className] - Clases adicionales
 */
const Loader = ({
  size = 'medium',
  color = 'primary',
  type = 'spinner',
  text,
  className = '',
  ...props
}) => {
  // Mapeo de tamaños a clases
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  // Mapeo de colores a clases
  const colorClasses = {
    primary: 'text-[#67f8c0]',
    secondary: 'text-[#4a6cf7]',
    white: 'text-white',
  };

  // Obtener las clases correspondientes
  const sizeClass = sizeClasses[size] || sizeClasses.medium;
  const colorClass = colorClasses[color] || colorClasses.primary;

  // Renderizar el tipo de loader correspondiente
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`flex space-x-2 ${colorClass}`}>
            <div className={`animate-bounce ${sizeClass} rounded-full bg-current`}></div>
            <div className={`animate-bounce delay-75 ${sizeClass} rounded-full bg-current`}></div>
            <div className={`animate-bounce delay-150 ${sizeClass} rounded-full bg-current`}></div>
          </div>
        );
      case 'pulse':
        return (
          <div className={`${sizeClass} ${colorClass}`}>
            <div className="w-full h-full rounded-full bg-current opacity-75 animate-ping"></div>
          </div>
        );
      case 'spinner':
      default:
        return (
          <svg 
            className={`animate-spin ${sizeClass} ${colorClass}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      {renderLoader()}
      {text && <span className={`ml-3 ${colorClass}`}>{text}</span>}
    </div>
  );
};

export default Loader;
