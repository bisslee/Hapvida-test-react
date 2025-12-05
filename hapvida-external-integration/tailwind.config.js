/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#2C3850',
          black: '#000000',
          white: '#FFFFFF',
        },
        secondary: {
          blue: '#1565C0',
          light: '#E3F2ED',
        },
        support: {
          light: '#F5E0E0',
        },
        accent: {
          green: '#4CAF50',
          red: '#FF4336',
        },
      },
    },
  },
  plugins: [],
}
