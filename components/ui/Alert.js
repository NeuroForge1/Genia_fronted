import React from 'react';

/**
 * Componente Alert reutilizable
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.type='info'] - Tipo de alerta (info, success, warning, error)
 * @param {string} [props.title] - Título opcional de la alerta
 * @param {boolean} [props.dismissible=false] - Si la alerta puede ser cerrada
 * @param {Function} [props.onDismiss] - Función a ejecutar al cerrar la alerta
 * @param {React.ReactNode} props.children - Contenido de la alerta
 * @param {string} [props.className] - Clases adicionales
 */
const Alert = ({ 
  type = 'info', 
  title,
  dismissible = false,
  onDismiss,
  children, 
  className = '',
  ...props 
}) => {
  // Mapeo de tipos a clases y iconos
  const typeConfig = {
    info: {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    },
    success: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    error: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  // Construir clases
  const alertClasses = `
    ${config.bgColor} ${config.textColor} ${config.borderColor}
    border rounded-md p-4 mb-4
    flex items-start
    ${className}
  `;

  return (
    <div className={alertClasses} role="alert" {...props}>
      <div className="flex-shrink-0 mr-3">
        {config.icon}
      </div>
      <div className="flex-1">
        {title && <h3 className="font-medium mb-1">{title}</h3>}
        <div className="text-sm">{children}</div>
      </div>
      {dismissible && (
        <button 
          type="button" 
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-opacity-25 hover:bg-gray-500"
          onClick={onDismiss}
          aria-label="Cerrar"
        >
          <span className="sr-only">Cerrar</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
