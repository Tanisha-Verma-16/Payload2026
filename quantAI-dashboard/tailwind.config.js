/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base - Darker Blue
        'deep-space': '#050b1f',
        'midnight': '#0a1128',
        'slate-dark': '#0f1936',
        
        // Accent colors
        'electric-blue': '#00d4ff',
        'cyber-cyan': '#00fff5',
        'neon-purple': '#b24bf3',
        'gold-accent': '#ffd700',
        'warning-orange': '#ff8c42',
        
        // Status colors
        'profit-green': '#00ff88',
        'loss-red': '#ff3366',
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 212, 255, 0.5)',
        'neon-strong': '0 0 30px rgba(0, 212, 255, 0.8)',
        'gold': '0 0 20px rgba(255, 215, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}
