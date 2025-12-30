import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        neutral: '#6B7280',
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
