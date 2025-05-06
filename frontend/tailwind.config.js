/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // White-green-blue design as requested
        primary: {
          blue: '#1E40AF',
          light: '#DBEAFE',
        },
        accent: {
          green: '#10B981',
        }
      },
    },
  },
  plugins: [],
} 