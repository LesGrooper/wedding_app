/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // Warna tema dari CSS variable (src/styles.css) supaya bisa berganti per
      // ?acara= tanpa build terpisah. Bentuk rgb(var(--rgb-x) / <alpha-value>)
      // WAJIB: dengan var(--color-x) biasa, Tailwind tak bisa mem-parse warnanya
      // dan semua kelas opacity (border-gold/40, bg-ink/80, ...) diam-diam hilang.
      colors: {
        ivory: 'rgb(var(--rgb-ivory) / <alpha-value>)',
        rose: {
          DEFAULT: 'rgb(var(--rgb-rose) / <alpha-value>)',
          dark: 'rgb(var(--rgb-rose-dark) / <alpha-value>)',
          // latar hover & toast danger — terpisah dari rose-dark (teks judul)
          hover: 'rgb(var(--rgb-rose-hover) / <alpha-value>)',
        },
        // teks di atas permukaan rose (tombol, pill, toast)
        'on-rose': 'rgb(var(--rgb-on-rose) / <alpha-value>)',
        gold: {
          DEFAULT: 'rgb(var(--rgb-gold) / <alpha-value>)',
          soft: 'rgb(var(--rgb-gold-soft) / <alpha-value>)',
        },
        ink: 'rgb(var(--rgb-ink) / <alpha-value>)',
        muted: 'rgb(var(--rgb-muted) / <alpha-value>)',
        // Overlay yang harus selalu gelap (lightbox). Jangan pakai ink:
        // di tema gelap ink = cream.
        scrim: 'rgb(var(--rgb-scrim) / <alpha-value>)',
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
        glass: '0 8px 32px rgb(var(--rgb-rose-dark) / 0.15)',
        soft: '0 4px 20px rgb(var(--rgb-rose-dark) / 0.08)',
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
