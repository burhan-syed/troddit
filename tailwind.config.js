const colors = require("tailwindcss/colors");
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        lightText: "#E7E5E4",
        lightBG: "#F1F5F9",
        lightPost: "#F8FAFC",
        lightPostHover: "#FFFFFF",
        lightHighlight: "#F3F4F6",
        lightBorder: "#D4D4D8",
        lightBorderHighlight: "#71717A",
        darkBG: "#1A1A1B",
        darkPostHover: "#262626",
        darkBorder: "#3F3F46",
        darkBorderHighlight: "#71717A",
        darkHighlight: "#262626",
        lightGreen: "#16A34A",
        darkGreen: "#7AFBD6",
        upvote: "#F97316",
        downvote: "#60A5FA",
        lightScroll: "#60A5FA",
        darkScroll: "#991B1B",
        blueGray: colors.slate,
        gray: colors.gray,
        trueGray: colors.neutral,
      },
      scale: {
        101: "1.01",
      },
      transitionProperty: {
        height: "height",
      },
    },
  },
  variants: {
    extend: {},
    scrollbar: ["dark", "rounded"],
  },
  plugins: [require("tailwind-scrollbar"), require("@tailwindcss/typography")],
};
