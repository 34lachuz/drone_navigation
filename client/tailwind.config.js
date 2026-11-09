/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aerospace: {
          dark: '#070b14',
          panel: '#0e1726',
          card: '#131f36',
          border: '#1f2d48',
          cyan: '#00e5ff',
          rocket: '#ff4d4d',
          orange: '#ff9800',
          green: '#00e676',
          amber: '#ffb300'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
