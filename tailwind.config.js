module.exports = {
  purge: [
    './apps/photos/**/*.{js,ts,jsx,tsx}',
    './libs/ui-kit/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  mode: 'jit',

  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
