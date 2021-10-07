module.exports = {
  purge: [
    './apps/photos/**/*.{js,ts,jsx,tsx}',
    './libs/image/**/*.{js,ts,jsx,tsx}',
    './libs/ui-kit/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false, // or 'media' or 'class'
  mode: 'jit',

  theme: {
    extend: {
      zIndex: {
         '-10': '-10',
        }
    },
  },
  variants: {
    extend: {
     display: ['hover', 'focus'],
    }
  },
  plugins: [],
}
