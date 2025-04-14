import React from 'react';

/**
 * Componente Form reutilizable
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSubmit - Función a ejecutar al enviar el formulario
 * @param {boolean} [props.loading=false] - Si el formulario está en estado de carga
 * @param {React.ReactNode} props.children - Contenido del formulario
 * @param {string} [props.className] - Clases adicionales
 */
const Form = ({
  onSubmit,
  loading = false,
  children,
  className = '',
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading && onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${className}`}
      {...props}
    >
      {loading ? (
        <div className="opacity-70 pointer-events-none">
          {children}
        </div>
      ) : (
        children
      )}
    </form>
  );
};

/**
 * Componente FormGroup para agrupar elementos del formulario
 */
export const FormGroup = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Componente FormLabel para etiquetas de formulario
 */
export const FormLabel = ({ children, htmlFor, required = false, className = '', ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block mb-2 font-medium text-white ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

/**
 * Componente FormInput para campos de entrada
 */
export const FormInput = ({
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-2 bg-[#101010] border ${error ? 'border-red-500' : 'border-[#333]'}
          rounded-md focus:outline-none focus:ring-2 focus:ring-[#67f8c0] focus:border-transparent
          text-white placeholder-gray-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </>
  );
};

/**
 * Componente FormTextarea para áreas de texto
 */
export const FormTextarea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-2 bg-[#101010] border ${error ? 'border-red-500' : 'border-[#333]'}
          rounded-md focus:outline-none focus:ring-2 focus:ring-[#67f8c0] focus:border-transparent
          text-white placeholder-gray-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </>
  );
};

/**
 * Componente FormSelect para selección
 */
export const FormSelect = ({
  id,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-2 bg-[#101010] border ${error ? 'border-red-500' : 'border-[#333]'}
          rounded-md focus:outline-none focus:ring-2 focus:ring-[#67f8c0] focus:border-transparent
          text-white
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </>
  );
};

/**
 * Componente FormCheckbox para casillas de verificación
 */
export const FormCheckbox = ({
  id,
  name,
  checked,
  onChange,
  label,
  disabled = false,
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-4 h-4 text-[#67f8c0] bg-[#101010] border-[#333] rounded
          focus:ring-[#67f8c0] focus:ring-opacity-25
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      />
      {label && (
        <label
          htmlFor={id}
          className={`ml-2 text-sm font-medium text-white ${disabled ? 'opacity-50' : ''}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export { FormGroup, FormLabel, FormInput, FormTextarea, FormSelect, FormCheckbox };
export default Form;
