/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf8ec',
          100: '#f9edca',
          200: '#f2d98a',
          400: '#C9A84C',
          600: '#a07c2a',
          800: '#6b5118',
        },
        surface: {
          DEFAULT: '#111111',
          raised: '#1a1a1a',
          hover:  '#222222',
          border: '#2a2a2a',
          subtle: '#333333',
        },
        base: '#0a0a0a',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease forwards',
        'slide-up':   'slideUp 0.35s ease forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGold: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
}
