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
        'glow-primary': '0 0 15px var(--glow-primary)',
        'glow-secondary': '0 0 15px var(--glow-secondary)',
        'glow-border': '0 0 10px var(--color-border)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 0.15s infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.96' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
