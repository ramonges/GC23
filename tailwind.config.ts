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
          ink: '#080909',
          charcoal: '#111313',
          soft: '#1B1E1C',
          paper: '#F1F0E8',
          muted: '#858981',
          grid: '#303431',
          signal: '#F36B21',
          bauxite: '#A9482C',
          copper: '#B86F42',
          aluminum: '#C6C8C1',
          ocean: '#536A72',
          vegetation: '#384531',
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
