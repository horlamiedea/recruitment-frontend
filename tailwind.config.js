// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Add this line
  ],
  darkMode: 'class', // We'll use this for the dark mode toggle
  theme: {
    extend: {},
  },
  plugins: [],
}