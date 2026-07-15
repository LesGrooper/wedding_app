/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FFFDFB',
        rose: {
          DEFAULT: '#D8A7B1',
          dark: '#B8848F',
        },
        gold: {
          DEFAULT: '#D4AF37',
          soft: '#E8D4A0',
        },
        ink: '#3B3138',
        muted: '#8B7B82',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      containers: {
        // Matches theme.screens.md so @md: behaves exactly like md: did
        // when .invite-col's container width equals the viewport width
        // (below the 1024px split-layout breakpoint). Above 1024px the
        // column is pinned to --invite-col-w (430px) and @md: correctly
        // never fires, keeping the mobile layout regardless of window size.
        md: '768px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(184,132,143,0.15)',
        soft: '0 4px 20px rgba(184,132,143,0.08)',
      },
      animation: {
        // float: 'float 10s ease-in-out infinite alternate',
        float: 'float 8s ease-in-out infinite alternate',
        wiggle: 'wiggle 1s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateX(0) rotate(0deg)' },
          '10%': { transform: 'translateX(0) rotate(-0.3deg)' },
          '20%': { transform: 'translateX(0) rotate(-0.2deg)' },
          '30%': { transform: 'translateX(0) rotate(-0.1deg)' },
          '40%': { transform: 'translateX(0) rotate(-1deg)' },
          '100%': { transform: 'translateX(5px) rotate(1deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
