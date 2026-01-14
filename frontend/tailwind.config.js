/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Data Center Theme Colors
        primary: {
          50: '#e6f4f9',
          100: '#cce9f3',
          200: '#99d3e7',
          300: '#66bddb',
          400: '#33a7cf',
          500: '#1a8fc4',
          600: '#0077b6',
          700: '#005f92',
          800: '#00476d',
          900: '#002f49',
          DEFAULT: '#0077b6',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          DEFAULT: '#0ea5e9',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          DEFAULT: '#f97316',
          hover: '#ea580c',
        },
        dark: {
          100: '#cdd5e0',
          200: '#9babc1',
          300: '#6981a2',
          400: '#455a7a',
          500: '#2d3e54',
          600: '#1e2d40',
          700: '#152232',
          800: '#0d1724',
          900: '#050b12',
          DEFAULT: '#1e2d40',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          DEFAULT: '#10b981',
          bg: '#d1fae5',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          DEFAULT: '#f59e0b',
          bg: '#fef3c7',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          DEFAULT: '#ef4444',
          bg: '#fee2e2',
        },
        info: {
          DEFAULT: '#0ea5e9',
          bg: '#e0f2fe',
        },
        body: '#f1f5f9', /* Slate 100 */
        surface: '#ffffff',
        sidebar: '#0f172a',
        border: '#e2e8f0',
        divider: '#f1f5f9',
        text: {
          main: '#1e293b', /* Slate 800 */
          muted: '#64748b', /* Slate 500 */
          light: '#94a3b8', /* Slate 400 */
          inverse: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        md: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        md: '0.75rem',
        lg: '1rem',
      }
    },
  },
  plugins: [],
}
