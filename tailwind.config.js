/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        hand: ['Caveat', 'ui-serif', 'cursive'],
        body: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Palette « Camp d'été » ──────────────────────────────
        camp: {
          pine: '#2f5d50',
          'pine-dark': '#1e3d34',
          'pine-light': '#3f7565',
          moss: '#6b8f71',
          cream: '#f7f0df',
          sand: '#efe2c4',
          'sand-dark': '#e6d4ab',
          ember: '#e07a3f',
          'ember-dark': '#c25e2a',
          lake: '#3b7a99',
          'lake-dark': '#2c5d76',
          bark: '#5c4326',
          sun: '#f2c14e',
          berry: '#b23a48',
          ink: '#2b2118',
        },
        // ── Tokens sémantiques (conservés pour compat shadcn) ───
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        badge: '0 10px 25px -8px rgba(43, 33, 24, 0.35)',
        sign: '4px 6px 0 0 rgba(92, 67, 38, 0.85)',
        'sign-sm': '3px 4px 0 0 rgba(92, 67, 38, 0.85)',
      },
      keyframes: {
        sway: {
          '0%, 100%': { transform: 'rotate(-2.5deg)' },
          '50%': { transform: 'rotate(2.5deg)' },
        },
        flicker: {
          '0%, 100%': { transform: 'scaleY(1) translateY(0)', opacity: '1' },
          '50%': { transform: 'scaleY(1.08) translateY(-2px)', opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'stamp-in': {
          '0%': { opacity: '0', transform: 'scale(1.4) rotate(-8deg)' },
          '60%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-3deg)' },
        },
      },
      animation: {
        sway: 'sway 4s ease-in-out infinite',
        flicker: 'flicker 1.6s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'rise-in': 'rise-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'stamp-in': 'stamp-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
