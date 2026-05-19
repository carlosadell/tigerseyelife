/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        onyx: '#0B0B0C',
        charcoal: '#141416',
        'charcoal-2': '#1C1C1F',
        'tiger-gold': '#D4A02A',
        amber: '#B78219',
        'deep-green': '#1E5B45',
        steel: '#A8AFB8',
        bone: '#F5F2EA',
        line: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-bold': ['Inter_700Bold'],
        mono: ['Inter_500Medium'],
        diagnostic: ['VT323_400Regular'],
      },
    },
  },
  plugins: [],
};
