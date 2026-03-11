/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8',
        },
        neon: {
          green: '#39ff14',
          cyan: '#00ffff',
          purple: '#bc13fe',
          pink: '#ff10f0',
        },
        surface: {
          DEFAULT: '#0a0a1a',
          card: '#12122a',
          elevated: '#1a1a3e',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0a0a1a 0%, #12122a 50%, #1a0f3e 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)',
        'neon-gradient': 'linear-gradient(90deg, #6366f1, #8b5cf6, #bc13fe)',
      },
      boxShadow: {
        'neon-indigo': '0 0 20px rgba(99,102,241,0.4), 0 0 40px rgba(99,102,241,0.2)',
        'neon-purple': '0 0 20px rgba(188,19,254,0.4), 0 0 40px rgba(188,19,254,0.2)',
        'neon-cyan': '0 0 20px rgba(0,255,255,0.4), 0 0 40px rgba(0,255,255,0.2)',
        'neon-green': '0 0 20px rgba(57,255,20,0.4), 0 0 40px rgba(57,255,20,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
        'card-hover': '0 20px 60px rgba(99,102,241,0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99,102,241,0.7), 0 0 80px rgba(99,102,241,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
