/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', '"Courier New"', 'monospace']
      },
      colors: {
        cyber: {
          bg: '#05070a',
          panel: '#0b0f14',
          surface: '#11161d',
          green: '#00ff41',
          cyan: '#00e5ff',
          red: '#ff2a2a'
        }
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-6px)' },
          '80%': { transform: 'translateX(6px)' }
        },
        securedFlash: {
          '0%': { opacity: '0.95', backgroundColor: '#ffffff' },
          '35%': { opacity: '0.65', backgroundColor: '#00ff41' },
          '100%': { opacity: '0', backgroundColor: '#00ff41' }
        },
        crtFlicker: {
          '0%, 100%': { opacity: '0.98' },
          '50%': { opacity: '0.94' }
        }
      },
      animation: {
        shake: 'shake 0.35s ease-in-out',
        securedFlash: 'securedFlash 1.5s ease-out forwards',
        crtFlicker: 'crtFlicker 3.5s infinite'
      }
    }
  },
  plugins: []
}

