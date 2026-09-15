/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0B0D10',
          surface: '#14171C',
          elevated: '#1B1F26',
        },
        border: {
          subtle: '#262B33',
          hover: '#3A4149',
        },
        text: {
          primary: '#E8EAED',
          secondary: '#9AA1AC',
          muted: '#5C6470',
        },
        amber: {
          accent: '#F5A623',
          hover: '#E0961A',
          light: '#FFB84D',
        },
        risk: {
          block: '#E5484D',
          challenge: '#F0B429',
          allow: '#2DD4A7',
          info: '#4C9AFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
        input: '6px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'live-pulse': 'livePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        livePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        }
      }
    },
  },
  plugins: [],
}

