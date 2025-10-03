/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.{js,jsx,ts,tsx}'],
  safelist: ['w-64','w-[72px]','ml-64','ml-[72px]'],
  theme: {
    extend: {
      colors: {
        deepblue: '#0B1E3B',
        offwhite: '#F7F8FB',
        accent: '#2F5FE0',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
};
