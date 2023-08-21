/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  theme: {
    g: ({ theme }) => theme('spacing'),
    extend: {
      colors: {
        lightPurple: '#6360EB',
        darkPurple: '#001448',
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          g: (value) => ({
            gap: value,
          }),
        },
        { values: theme('g') }
      );
    }),
  ],
};
