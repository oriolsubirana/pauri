import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F6F2EC',
        olive: {
          DEFAULT: '#5E6B3C',
          light: '#7a8a50',
          dark: '#49542e',
        },
        sand: {
          DEFAULT: '#E8DFC9',
          light: '#F0E9D8',
          dark: '#d4c9aa',
        },
        terracotta: {
          DEFAULT: '#C4714A',
          light: '#d48a63',
          dark: '#a85c3a',
        },
        stone: '#A89880',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        container: '1100px',
      },
      boxShadow: {
        soft: '0 2px 20px rgba(94, 107, 60, 0.08)',
        'soft-lg': '0 8px 40px rgba(94, 107, 60, 0.12)',
        card: '0 1px 8px rgba(168, 152, 128, 0.15)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'countdown-tick': 'countdownTick 0.3s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        countdownTick: {
          '0%': { transform: 'scale(1.05)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
