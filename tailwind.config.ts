import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        primary: 'var(--primary)',
        'primary-fg': 'var(--primary-fg)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        muted: 'var(--muted-text)',
        body: 'var(--body)',
        heading: 'var(--heading)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'serif'],
        fraunces: ['var(--font-fraunces)', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
