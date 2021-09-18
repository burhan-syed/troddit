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
        upvote: "#F97316",
        downvote: "#60A5FA",
        blueGray: colors.blueGray,
        coolGray: colors.coolGray,
        trueGray: colors.trueGray,
      },
    },
  },
  variants: {
    extend: {},
    scrollbar: ["dark", "rounded"],
  },
  plugins: [require("tailwind-scrollbar")],
};
