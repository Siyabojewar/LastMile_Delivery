/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors - professional blue system
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Professional neutral system for backgrounds, text, borders
        neutral: {
          0:   '#ffffff',
          50:  '#fafafa',
          100: '#f4f4f5', 
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1f1f23',
          900: '#18181b',
          925: '#121215',
          950: '#09090b',
        },
        
        // Semantic status colors - professional and accessible
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0', 
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d', 
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626', 
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Surface colors for layered interfaces
        surface: {
          // Light mode surfaces
          primary: '#ffffff',
          secondary: '#fafafa', 
          tertiary: '#f4f4f5',
          // Dark mode surfaces  
          'dark-primary': '#18181b',
          'dark-secondary': '#27272a',
          'dark-tertiary': '#3f3f46',
        },
        
        // Border colors
        border: {
          light: '#e4e4e7',
          'light-strong': '#d4d4d8',
          dark: '#3f3f46',
          'dark-strong': '#52525b',
        },
        
        // Text colors with proper contrast
        text: {
          primary: '#18181b',
          secondary: '#52525b', 
          tertiary: '#71717a',
          disabled: '#a1a1aa',
          'dark-primary': '#fafafa',
          'dark-secondary': '#d4d4d8',
          'dark-tertiary': '#a1a1aa',
          'dark-disabled': '#71717a',
        }
      },
      boxShadow: {
        'card':    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'card-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        // Dark mode shadows - more subtle
        'dark-card': '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
        'dark-card-md': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        'dark-card-lg': '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
      },
      fontFamily: {
        sans: [
          'Inter', 'ui-sans-serif', 'system-ui', '-apple-system',
          'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif',
        ],
        mono: [
          'JetBrains Mono', 'ui-monospace', 'SFMono-Regular',
          'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace',
        ],
      },
      backgroundImage: {
        // Light mode gradients
        'page-gradient': 'linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f4f4f5 100%)',
        'hero-gradient': 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
        // Dark mode gradients  
        'dark-page-gradient': 'linear-gradient(135deg, #18181b 0%, #27272a 30%, #18181b 100%)',
        'dark-hero-gradient': 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #1d4ed8 100%)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { 
          from: { opacity: '0' }, 
          to: { opacity: '1' } 
        },
        slideUp: { 
          from: { opacity: '0', transform: 'translateY(10px)' }, 
          to: { opacity: '1', transform: 'translateY(0)' } 
        },
        slideDown: { 
          from: { opacity: '0', transform: 'translateY(-10px)' }, 
          to: { opacity: '1', transform: 'translateY(0)' } 
        },
        scaleIn: { 
          from: { opacity: '0', transform: 'scale(0.95)' }, 
          to: { opacity: '1', transform: 'scale(1)' } 
        },
      },
    },
  },
  plugins: [],
};
