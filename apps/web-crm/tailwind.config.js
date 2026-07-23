/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0C0A07',
          secondary: '#15100A',
          card: '#1A140E',
        },
        gold: {
          DEFAULT: '#C9A45C',
          light: '#E9D6AE',
          hover: '#D4AF37',
        },
        accent: {
          DEFAULT: '#B08756',
          purple: '#6B46C1',
        },
        txt: {
          DEFAULT: '#FFFFFF',
          sec: '#B0A894',
          muted: '#897F6B',
        },
      },
    },
  },
  plugins: [],
};
