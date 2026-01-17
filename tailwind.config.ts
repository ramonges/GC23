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
        'dark-blue': '#0A1628',
        'brand-blue': '#1E3A5F',
        'brand-green': '#10B981',
        'light-green': '#34D399',
      },
    },
  },
  plugins: [],
}
export default config
