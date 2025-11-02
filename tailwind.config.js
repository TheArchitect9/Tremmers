/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif']
      },
      fontSize: {
        '3xl': ['30px', { lineHeight: '36px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        'xl': ['20px', { lineHeight: '28px' }]
      },
      spacing: {
        // Add named spacing primitives used in design
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem'
      },
      borderRadius: {
        xl: '1rem'
      }
    }
  },
  plugins: []
}
