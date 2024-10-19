import type { Config } from 'tailwindcss'

export default {
  content: [
    "./presets/**/*.{js,vue,ts}",       // presets folder path
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-primeui')],
} satisfies Config