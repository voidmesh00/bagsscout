/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0b',
        surface: '#111113',
        surface2: '#18181c',
        accent: '#c8f04a',
        accent2: '#4af0b8',
        accent3: '#f0a44a',
        danger: '#f04a4a',
        muted: '#6b6a6f',
        border: 'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        mono: ['DM Mono', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
