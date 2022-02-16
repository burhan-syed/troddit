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
        lightText: "#E7E5E4", //"#F1F5F9",
        lightBG: "#F1F5F9", //"#E5E7EB",
        lightPost: "#F8FAFC", //"#F1F5F9", //"#D4D4D8",
        lightPostHover: "white", // "#FAFAFA",
        lightHighlight: "#F3F4F6",
        lightBorder: "#D4D4D8",
        lightBorderHighlight: "#71717A",
        darkBG: "#1A1A1B", //"#171717",
        darkPostHover: "#262626",
        darkBorder: "#3F3F46",
        darkBorderHighlight: "#71717A",
        darkHighlight: "#262626",
        lightGreen: "#16A34A",
        darkGreen: "#7AFBD6",
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
