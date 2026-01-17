import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#000000',
        'secondary': '#ffffff',
        'accent': '#0066ff',
        'gray-light': '#f5f5f5',
        'gray-medium': '#e0e0e0',
        'gray-dark': '#666666',
      },
    },
  },
  plugins: [],
}
export default config
