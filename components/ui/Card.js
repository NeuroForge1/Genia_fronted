import React from 'react';

/**
 * Componente Card reutilizable
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.variant='default'] - Variante de la tarjeta (default, outlined, elevated)
 * @param {boolean} [props.withHeader=false] - Si la tarjeta tiene encabezado
 * @param {React.ReactNode} [props.header] - Contenido del encabezado
 * @param {React.ReactNode} props.children - Contenido principal de la tarjeta
 * @param {string} [props.className] - Clases adicionales
 * @param {string} [props.headerClassName] - Clases adicionales para el encabezado
 * @param {string} [props.bodyClassName] - Clases adicionales para el cuerpo
 */
const Card = ({ 
  variant = 'default', 
  withHeader = false,
  header,
  children, 
  className = '',
  headerClassName = '',
  bodyClassName = '',
  ...props 
}) => {
  // Mapeo de variantes a clases
  const variantClasses = {
    default: 'bg-[#1a1a1a] border border-[#333]',
    outlined: 'bg-transparent border border-[#67f8c0]',
    elevated: 'bg-[#1a1a1a] shadow-lg',
  };

  // Construir clases
  const cardClasses = `
    ${variantClasses[variant] || variantClasses.default}
    rounded-lg overflow-hidden
    ${className}
  `;

  const headerClasses = `
    ${withHeader ? 'bg-[#4a6cf7] text-white p-4' : ''}
    ${headerClassName}
  `;

  const bodyClasses = `
    p-5
    ${bodyClassName}
  `;

  return (
    <div className={cardClasses} {...props}>
      {withHeader && header && (
        <div className={headerClasses}>
          {header}
        </div>
      )}
      <div className={bodyClasses}>
        {children}
      </div>
    </div>
  );
};

export default Card;
