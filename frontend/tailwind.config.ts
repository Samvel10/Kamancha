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
        primary:        '#194027',
        'primary-light':'#2A5C3A',
        accent:         '#C8860A',
        'accent-dark':  '#A66E08',
        bg:             '#FDFAF4',
        'bg-dark':      '#F0E8D4',
        'text-dark':    '#1A1A0F',
        'text-secondary':'#4A4A3A',
        border:         '#E8DFC8',
        card:           '#FFFFFF',
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
