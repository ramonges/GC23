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
        vulcan: {
          ink: '#0B0B0D',
          panel: '#141417',
          signal: '#FF6A1A',
          rust: '#A8502D',
          ochre: '#C68A36',
          copper: '#C8794A',
          sand: '#D8C6A5',
          aluminum: '#A3A7AE',
        },
      },
      fontFamily: {
        grotesk: ['var(--font-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
