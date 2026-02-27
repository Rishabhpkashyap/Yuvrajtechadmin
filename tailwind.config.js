/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
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
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
          950: '#0c1220',
        },
        accent: {
          cyan: '#0ea5e9',
          teal: '#0284c7',
          red: '#ef4444',
          orange: '#f97316',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0c1220 0%, #1e293b 50%, #334155 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(2, 132, 199, 0.05) 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(12, 18, 32, 0.95) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-sm': '0 0 10px rgba(14, 165, 233, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(14, 165, 233, 0.1)',
      }
    },
  },
  plugins: [],
}