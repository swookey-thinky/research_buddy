import type { Config } from 'tailwindcss';
import scrollbar from 'tailwind-scrollbar';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxHeight: {
        '280px': '280px',
        '400px': '400px',
      },
    },
  },
  plugins: [
    scrollbar({ nocompatible: true }),
  ],
};

export default config;