/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Catppuccin Mocha inspired palette
        primary: {
          DEFAULT: '#cba6f7', // Mauve
          light: '#f5c2e7',   // Pink
          dark: '#b4befe',    // Lavender
        },
        accent: {
          DEFAULT: '#89b4fa', // Blue
          light: '#74c7ec',   // Sapphire
        },
        // Background (Catppuccin Mocha base)
        bg: {
          primary: '#1e1e2e',   // Base
          secondary: '#181825', // Mantle
          card: '#313244',      // Surface0
          elevated: '#45475a',  // Surface1
        },
        // Text (Catppuccin Mocha text)
        text: {
          primary: '#cdd6f4',   // Text
          secondary: '#a6adc8', // Subtext1
          muted: '#6c7086',     // Overlay1
        },
        // Status colors (Catppuccin)
        success: '#a6e3a1', // Green
        warning: '#f9e2af', // Yellow
        error: '#f38ba8',   // Red
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(203, 166, 247, 0.3)',
        'glow-lg': '0 0 40px rgba(203, 166, 247, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
