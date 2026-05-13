import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:          '#1C3A28',
        'primary-deeper': '#162E20',
        'primary-darkest':'#111E17',
        accent:           '#D4A843',
        'accent-dark':    '#B68A28',
        bg:               '#FDFAF4',
        'bg-music':       '#F5ECD7',
        'bg-dark':        '#F0E8D4',
        'text-on-green':  '#E8D8B0',
        'text-muted-green': '#B8CDB0',
        'text-muted-green-2': '#8AAA98',
        'text-dark':      '#1A1A0F',
        'text-secondary': '#7A7060',
        'text-faint':     '#9A8E7A',
        border:           '#E8DFC8',
        'green-border':   '#2A4A36',
        card:             '#FFFFFF',
      },
      fontFamily: {
        sans:    ['var(--font-inter)',     'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia',   'serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                                   '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' },    '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};

export default config;
