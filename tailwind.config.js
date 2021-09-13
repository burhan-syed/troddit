const colors = require("tailwindcss/colors");
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
        lightBG: "#E5E7EB",
        lightHighlight: "#F3F4F6",
        lightBorder: "#D4D4D8",
        lightBorderHighlight: "#71717A",
        darkBG: "#171717",
        darkBorder: "#3F3F46",
        darkBorderHighlight: "#71717A",
        darkHighlight: "#262626",
        blueGray: colors.blueGray,
        coolGray: colors.coolGray,
        trueGray: colors.trueGray,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
