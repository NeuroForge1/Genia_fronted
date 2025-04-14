import { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto del tema
const ThemeContext = createContext();

// Proveedor del tema que envuelve la aplicación
export function ThemeProvider({ children }) {
  // Estado para controlar el tema actual
  const [theme, setTheme] = useState({
    // Colores principales
    primary: '#67f8c0',
    secondary: '#4a6cf7',
    
    // Colores de fondo
    bgDark: '#0e0e0e',
    bgMedium: '#1a1a1a',
    bgLight: '#1e1e1e',
    
    // Colores de texto
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#999999',
    
    // Colores de estado
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  });

  // Función para actualizar el tema
  const updateTheme = (newTheme) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newTheme
    }));
  };

  // Aplicar variables CSS al documento
  useEffect(() => {
    // Actualizar variables CSS cuando cambie el tema
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-secondary', theme.secondary);
    document.documentElement.style.setProperty('--color-bg-dark', theme.bgDark);
    document.documentElement.style.setProperty('--color-bg-medium', theme.bgMedium);
    document.documentElement.style.setProperty('--color-bg-light', theme.bgLight);
    document.documentElement.style.setProperty('--color-text-primary', theme.textPrimary);
    document.documentElement.style.setProperty('--color-text-secondary', theme.textSecondary);
    document.documentElement.style.setProperty('--color-text-muted', theme.textMuted);
    document.documentElement.style.setProperty('--color-success', theme.success);
    document.documentElement.style.setProperty('--color-warning', theme.warning);
    document.documentElement.style.setProperty('--color-error', theme.error);
    document.documentElement.style.setProperty('--color-info', theme.info);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado para usar el tema
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
}
