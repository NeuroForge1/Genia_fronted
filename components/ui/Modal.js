import React, { useState, useEffect } from 'react';

/**
 * Componente Modal reutilizable
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función a ejecutar al cerrar el modal
 * @param {string} [props.title] - Título del modal
 * @param {boolean} [props.closeOnOverlayClick=true] - Si el modal se cierra al hacer clic en el overlay
 * @param {string} [props.size='medium'] - Tamaño del modal (small, medium, large)
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {React.ReactNode} [props.footer] - Contenido del pie del modal
 * @param {string} [props.className] - Clases adicionales
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  closeOnOverlayClick = true,
  size = 'medium',
  children,
  footer,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Manejar la apertura y cierre del modal con animación
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevenir scroll en el body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 300); // Tiempo de la animación
      document.body.style.overflow = 'auto';
    }

    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Si no está visible, no renderizar nada
  if (!isVisible) return null;

  // Mapeo de tamaños a clases
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    fullscreen: 'max-w-full h-full m-0 rounded-none'
  };

  // Manejar clic en el overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      {...props}
    >
      <div
        className={`
          bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl
          transform transition-all duration-300
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${sizeClasses[size] || sizeClasses.medium}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del modal */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-[#333]">
            <h3 className="text-lg font-medium text-[#67f8c0]">{title}</h3>
            <button
              type="button"
              className="text-gray-400 hover:text-white focus:outline-none"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}

        {/* Cuerpo del modal */}
        <div className="p-6">{children}</div>

        {/* Pie del modal (opcional) */}
        {footer && (
          <div className="p-4 border-t border-[#333] bg-[#1e1e1e]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
