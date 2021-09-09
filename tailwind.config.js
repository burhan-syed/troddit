const colors = require('tailwindcss/colors');
module.exports = {
  mode: "jit",
  purge: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        blueGray : colors.blueGray,
        coolGray : colors.coolGray,
        trueGray: colors.trueGray

        // black: "#11151C",
        // darkgray: "#212D40",
        // gray: "#364156",
        // lightgray: "#D1D1D1",
        // blue: "#A1CFE3",
        // white: "#FAE8EB",
        //https://coolors.co/11151c-212d40-364156-d1d1d1-fae8eb
        //https://coolors.co/a7b8ac-45544a-1d1f19-162933-a1cfe3
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
