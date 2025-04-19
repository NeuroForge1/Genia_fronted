import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';

type ThemeMode = 'light' | 'dark' | 'system';
type ThemeColor = 'blue' | 'purple' | 'green' | 'orange' | 'red';
type FontSize = 'small' | 'medium' | 'large';
type AnimationLevel = 'none' | 'minimal' | 'full';

interface ThemeContextType {
  mode: ThemeMode;
  color: ThemeColor;
  fontSize: FontSize;
  animationLevel: AnimationLevel;
  highContrast: boolean;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  setFontSize: (size: FontSize) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  toggleHighContrast: () => void;
  resetToDefaults: () => void;
  isDarkMode: boolean;
  getThemeClass: () => string;
  getColorClass: (element: 'primary' | 'secondary' | 'accent' | 'border') => string;
}

const defaultTheme = {
  mode: 'system' as ThemeMode,
  color: 'blue' as ThemeColor,
  fontSize: 'medium' as FontSize,
  animationLevel: 'full' as AnimationLevel,
  highContrast: false
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [mode, setModeState] = useState<ThemeMode>(defaultTheme.mode);
  const [color, setColorState] = useState<ThemeColor>(defaultTheme.color);
  const [fontSize, setFontSizeState] = useState<FontSize>(defaultTheme.fontSize);
  const [animationLevel, setAnimationLevelState] = useState<AnimationLevel>(defaultTheme.animationLevel);
  const [highContrast, setHighContrast] = useState<boolean>(defaultTheme.highContrast);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar preferencias del usuario desde Supabase
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_preferences')
            .select('theme_mode, theme_color, font_size, animation_level, high_contrast')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.error('Error al cargar preferencias de tema:', error);
            return;
          }

          if (data) {
            setModeState(data.theme_mode || defaultTheme.mode);
            setColorState(data.theme_color || defaultTheme.color);
            setFontSizeState(data.font_size || defaultTheme.fontSize);
            setAnimationLevelState(data.animation_level || defaultTheme.animationLevel);
            setHighContrast(data.high_contrast || defaultTheme.highContrast);
          }
        } catch (error) {
          console.error('Error al cargar preferencias de tema:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Cargar desde localStorage si no hay usuario autenticado
        const savedMode = localStorage.getItem('theme_mode') as ThemeMode;
        const savedColor = localStorage.getItem('theme_color') as ThemeColor;
        const savedFontSize = localStorage.getItem('font_size') as FontSize;
        const savedAnimationLevel = localStorage.getItem('animation_level') as AnimationLevel;
        const savedHighContrast = localStorage.getItem('high_contrast') === 'true';

        if (savedMode) setModeState(savedMode);
        if (savedColor) setColorState(savedColor);
        if (savedFontSize) setFontSizeState(savedFontSize);
        if (savedAnimationLevel) setAnimationLevelState(savedAnimationLevel);
        if (savedHighContrast !== null) setHighContrast(savedHighContrast);
        
        setIsLoading(false);
      }
    };

    loadUserPreferences();
  }, [user]);

  // Detectar preferencia del sistema para modo oscuro
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (mode === 'system') {
        setIsDarkMode(mediaQuery.matches);
      }
    };

    // Configuración inicial
    if (mode === 'system') {
      setIsDarkMode(mediaQuery.matches);
    } else {
      setIsDarkMode(mode === 'dark');
    }

    // Escuchar cambios en la preferencia del sistema
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  // Aplicar clase de tema oscuro al documento
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Aplicar tamaño de fuente al documento
  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
  }, [fontSize]);

  // Aplicar nivel de animación al documento
  useEffect(() => {
    document.documentElement.dataset.animations = animationLevel;
  }, [animationLevel]);

  // Aplicar contraste alto al documento
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Guardar preferencias en Supabase o localStorage
  const savePreferences = async (
    newMode: ThemeMode,
    newColor: ThemeColor,
    newFontSize: FontSize,
    newAnimationLevel: AnimationLevel,
    newHighContrast: boolean
  ) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            theme_mode: newMode,
            theme_color: newColor,
            font_size: newFontSize,
            animation_level: newAnimationLevel,
            high_contrast: newHighContrast
          });

        if (error) {
          console.error('Error al guardar preferencias de tema:', error);
        }
      } catch (error) {
        console.error('Error al guardar preferencias de tema:', error);
      }
    } else {
      // Guardar en localStorage si no hay usuario autenticado
      localStorage.setItem('theme_mode', newMode);
      localStorage.setItem('theme_color', newColor);
      localStorage.setItem('font_size', newFontSize);
      localStorage.setItem('animation_level', newAnimationLevel);
      localStorage.setItem('high_contrast', newHighContrast.toString());
    }
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    savePreferences(newMode, color, fontSize, animationLevel, highContrast);
  };

  const setColor = (newColor: ThemeColor) => {
    setColorState(newColor);
    savePreferences(mode, newColor, fontSize, animationLevel, highContrast);
  };

  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
    savePreferences(mode, color, newSize, animationLevel, highContrast);
  };

  const setAnimationLevel = (newLevel: AnimationLevel) => {
    setAnimationLevelState(newLevel);
    savePreferences(mode, color, fontSize, newLevel, highContrast);
  };

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    savePreferences(mode, color, fontSize, animationLevel, newValue);
  };

  const resetToDefaults = () => {
    setModeState(defaultTheme.mode);
    setColorState(defaultTheme.color);
    setFontSizeState(defaultTheme.fontSize);
    setAnimationLevelState(defaultTheme.animationLevel);
    setHighContrast(defaultTheme.highContrast);
    savePreferences(
      defaultTheme.mode,
      defaultTheme.color,
      defaultTheme.fontSize,
      defaultTheme.animationLevel,
      defaultTheme.highContrast
    );
  };

  // Obtener clase de tema para componentes
  const getThemeClass = () => {
    return isDarkMode ? 'dark' : 'light';
  };

  // Obtener clase de color para diferentes elementos
  const getColorClass = (element: 'primary' | 'secondary' | 'accent' | 'border') => {
    const colorMap = {
      blue: {
        primary: 'bg-blue-500 dark:bg-blue-600',
        secondary: 'bg-blue-100 dark:bg-blue-800',
        accent: 'text-blue-500 dark:text-blue-400',
        border: 'border-blue-500 dark:border-blue-400'
      },
      purple: {
        primary: 'bg-purple-500 dark:bg-purple-600',
        secondary: 'bg-purple-100 dark:bg-purple-800',
        accent: 'text-purple-500 dark:text-purple-400',
        border: 'border-purple-500 dark:border-purple-400'
      },
      green: {
        primary: 'bg-green-500 dark:bg-green-600',
        secondary: 'bg-green-100 dark:bg-green-800',
        accent: 'text-green-500 dark:text-green-400',
        border: 'border-green-500 dark:border-green-400'
      },
      orange: {
        primary: 'bg-orange-500 dark:bg-orange-600',
        secondary: 'bg-orange-100 dark:bg-orange-800',
        accent: 'text-orange-500 dark:text-orange-400',
        border: 'border-orange-500 dark:border-orange-400'
      },
      red: {
        primary: 'bg-red-500 dark:bg-red-600',
        secondary: 'bg-red-100 dark:bg-red-800',
        accent: 'text-red-500 dark:text-red-400',
        border: 'border-red-500 dark:border-red-400'
      }
    };

    return colorMap[color][element];
  };

  const value = {
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
    isDarkMode,
    getThemeClass,
    getColorClass
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
