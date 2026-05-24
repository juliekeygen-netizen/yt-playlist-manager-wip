import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/renderer/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        shell: {
          950: '#07101c',
          900: '#0a1320',
          850: '#0d1826',
          800: '#111e2f',
          700: '#1a2a40',
        },
        mist: {
          50: '#eef6ff',
          200: '#c5d3e7',
          400: '#8192aa',
          500: '#657790',
        },
      },
      boxShadow: {
        panel: '0 20px 60px rgba(0, 0, 0, 0.35)',
        glow: '0 0 0 1px rgba(255, 255, 255, 0.06), 0 20px 42px rgba(0, 0, 0, 0.28)',
      },
      fontFamily: {
        display: ['Aptos', 'SF Pro Display', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
