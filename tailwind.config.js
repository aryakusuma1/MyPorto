/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0d1117',
          alt: '#161b22',
          raised: '#21262d',
        },
        accent: {
          DEFAULT: '#c97b3a',
          light: '#e8955a',
          muted: '#7a4a22',
        },
        ink: {
          DEFAULT: '#e6edf3',
          muted: '#8b949e',
          subtle: '#484f58',
        },
        border: {
          DEFAULT: '#30363d',
          subtle: '#21262d',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
