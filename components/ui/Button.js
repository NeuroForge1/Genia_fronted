import React from 'react';

/**
 * Componente Button reutilizable
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.variant='primary'] - Variante del botón (primary, secondary, outline, danger)
 * @param {string} [props.size='medium'] - Tamaño del botón (small, medium, large)
 * @param {boolean} [props.fullWidth=false] - Si el botón debe ocupar todo el ancho disponible
 * @param {boolean} [props.disabled=false] - Si el botón está deshabilitado
 * @param {Function} props.onClick - Función a ejecutar al hacer clic
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {string} [props.className] - Clases adicionales
 */
const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  disabled = false, 
  onClick, 
  children, 
  className = '',
  ...props 
}) => {
  // Mapeo de variantes a clases
  const variantClasses = {
    primary: 'bg-[#67f8c0] text-[#101010] hover:bg-[#4ad9a4]',
    secondary: 'bg-[#4a6cf7] text-white hover:bg-[#3a5ce7]',
    outline: 'bg-transparent border border-[#67f8c0] text-[#67f8c0] hover:bg-[#67f8c0] hover:bg-opacity-10',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  // Mapeo de tamaños a clases
  const sizeClasses = {
    small: 'py-1 px-3 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg',
  };

  // Construir clases
  const buttonClasses = `
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.medium}
    ${fullWidth ? 'w-full' : ''}
    rounded-md font-medium transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-[#67f8c0] focus:ring-opacity-50
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
