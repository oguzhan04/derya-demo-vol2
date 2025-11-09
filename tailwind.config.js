/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: ['w-64','w-[72px]','ml-64','ml-[72px]'],
  theme: {
    extend: {
      colors: {
        deepblue: '#0B1E3B',
        offwhite: '#F7F8FB',
        accent: '#2F5FE0',
        // New premium AI logistics palette
        primary: '#2563EB',
        'primary-dark': '#1D4ED8',
        success: '#16A34A',
        'success-dark': '#15803D',
        'bg-highlight': '#EFF6FF',
        'bg-highlight-dark': '#1E3A5F',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl2: '1rem',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
};
