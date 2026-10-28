/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kalam: ['Kalam', 'cursive'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        paper: '#F5F0E8',
        card: '#FEFCE8',
        'ink-dark': '#1C1917',
        'stamp-red': '#DC2626',
        'stamp-orange': '#EA580C',
        'stamp-blue': '#2563EB',
        marigold: '#F59E0B',
        muted: '#78716C',
      },
    },
  },
  plugins: [],
}
