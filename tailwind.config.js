// tailwind.config.js
/** @type {import('tailwindcss').Config} */
import twColors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/index.css",
  ],
  theme: {
    colors: { // Note: not theme.extend.colors, but theme.colors
      transparent: 'transparent',
      current: 'currentColor',
      white: twColors.white,
      black: twColors.black,
      slate: twColors.slate, // <--- Add slate
      gray: twColors.gray,
      red: twColors.red,
      green: twColors.green,
      blue: twColors.blue,
      indigo: twColors.indigo,
      purple: twColors.purple,
    },
    extend: {
      // other extensions
    },
  },
  plugins: [],
}