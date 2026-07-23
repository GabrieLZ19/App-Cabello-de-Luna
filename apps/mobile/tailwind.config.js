/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0C0A07',
          secondary: '#15100A',
          card: '#1A140E',
        },
        glass: {
          DEFAULT: 'rgba(33, 26, 18, 0.65)',
          border: 'rgba(255, 255, 255, 0.08)',
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
        status: {
          green: '#22c55e',
          red: '#f87171',
        }
      },
      fontFamily: {
        inter: ['Inter'],
      }
    },
  },
  plugins: [],
}
