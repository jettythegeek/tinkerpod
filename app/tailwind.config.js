/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        teal: '#00BFAE',
        'button-teal': '#007A70',
        ink: '#0F172A',
        'kid-purple': '#7C3AED',
        'accent-amber': '#FFB700',
        'accent-coral': '#FF6B6B',
        'accent-blue': '#2563EB',
        success: '#63C132',
        bg: '#F8FAFC',
        'admin-navy': '#101B4D',
      },
      fontFamily: {
        nunito: ['Nunito_400Regular'],
        'nunito-semibold': ['Nunito_600SemiBold'],
        'nunito-bold': ['Nunito_700Bold'],
        'nunito-extrabold': ['Nunito_800ExtraBold'],
        'nunito-black': ['Nunito_900Black'],
      },
    },
  },
  plugins: [],
};
