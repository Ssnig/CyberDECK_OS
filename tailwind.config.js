/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: 'var(--color-bg)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          primary: 'var(--color-primary)',
          primaryDim: 'var(--color-primary-dim)',
          secondary: 'var(--color-secondary)',
          text: 'var(--color-text)',
          muted: 'var(--color-muted)',
          accent: 'var(--color-accent)',
          danger: 'var(--color-danger)',
          warning: 'var(--color-warning)',
          success: 'var(--color-success)',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', '"JetBrains Mono"', 'Consolas', 'Monaco', '"Courier New"', 'monospace'],
        display: ['"Share Tech Mono"', '"VT323"', 'monospace']
      },
      boxShadow: {
        'glow-primary': '0 0 20px var(--glow-primary), 0 0 40px rgba(0, 0, 0, 0.3)',
        'glow-secondary': '0 0 20px var(--glow-secondary), 0 0 40px rgba(0, 0, 0, 0.3)',
        'glow-border': '0 0 15px var(--glow-primary), 0 0 30px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 0.15s infinite',
        'blink': 'blink 1s step-end infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.96' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': {
            textShadow: '0 0 10px var(--glow-primary), 0 0 20px var(--glow-primary)',
            opacity: '1'
          },
          '50%': {
            textShadow: '0 0 20px var(--glow-primary), 0 0 40px var(--glow-primary)',
            opacity: '1.05'
          }
        }
      }
    },
  },
  plugins: [],
}
