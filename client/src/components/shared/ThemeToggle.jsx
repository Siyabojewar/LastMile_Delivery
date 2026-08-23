import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-2.5 rounded-xl bg-surface-secondary/50 dark:bg-surface-dark-secondary/50 
                 hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary
                 ring-1 ring-border-light dark:ring-border-dark
                 hover:ring-border-light-strong dark:hover:ring-border-dark-strong
                 text-text-secondary dark:text-text-dark-secondary
                 hover:text-text-primary dark:hover:text-text-dark-primary
                 transition-all duration-200 hover:scale-105"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        {theme === 'light' ? (
          // Moon icon for dark mode
          <svg 
            className="w-5 h-5 transition-transform duration-200 group-hover:rotate-12" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
            />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg 
            className="w-5 h-5 transition-transform duration-200 group-hover:rotate-45" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
        )}
      </div>
      
      {/* Subtle indicator dot */}
      <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full transition-colors duration-200 ${
        theme === 'light' 
          ? 'bg-amber-400 dark:bg-amber-500' 
          : 'bg-blue-400 dark:bg-blue-500'
      }`} />
    </button>
  );
}