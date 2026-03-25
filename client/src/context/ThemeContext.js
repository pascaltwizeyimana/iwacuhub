import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const themes = {
    light: {
      name: 'Light',
      bg: 'bg-gray-50',
      card: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-100',
    },
    dark: {
      name: 'Dark',
      bg: 'bg-gray-900',
      card: 'bg-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      border: 'border-gray-700',
      hover: 'hover:bg-gray-700',
    },
    blue: {
      name: 'Blue',
      bg: 'bg-blue-50',
      card: 'bg-blue-100',
      text: 'text-blue-900',
      textSecondary: 'text-blue-700',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-200',
    },
    red: {
      name: 'Red',
      bg: 'bg-red-50',
      card: 'bg-red-100',
      text: 'text-red-900',
      textSecondary: 'text-red-700',
      border: 'border-red-200',
      hover: 'hover:bg-red-200',
    },
    black: {
      name: 'Black',
      bg: 'bg-black',
      card: 'bg-gray-900',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      border: 'border-gray-800',
      hover: 'hover:bg-gray-800',
    },
  };

  const toggleTheme = () => {
    const themeOrder = ['light', 'dark', 'blue', 'red', 'black'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const currentTheme = themes[theme] || themes.light;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, currentTheme, themes }}>
      <div className={currentTheme.bg}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};