/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: "#090909",
        base: "#0E0E0E",
        raised: "#141414",
        interactive: "#1A1A1A",
        strong: "#242424",

        // Content
        primary: "#F6F6F6",
        secondary: "#838383",
        muted: "#616161",

        // Borders
        border: "#3A3A3A",

        // Brand
        accent: {
          DEFAULT: "#FF6347",
          warm: "#FF8A3D",
          deep: "#D94F2E",
          foreground: "#0E0E0E",
        },
      },
      fontFamily: {
        lexend: ["Lexend_400Regular"],
        "lexend-thin": ["Lexend_100Thin"],
        "lexend-extralight": ["Lexend_200ExtraLight"],
        "lexend-light": ["Lexend_300Light"],
        "lexend-regular": ["Lexend_400Regular"],
        "lexend-medium": ["Lexend_500Medium"],
        "lexend-semibold": ["Lexend_600SemiBold"],
        "lexend-bold": ["Lexend_700Bold"],
        "lexend-extrabold": ["Lexend_800ExtraBold"],
        "lexend-black": ["Lexend_900Black"],
      },
      fontSize: {
        // Display
        "display-xl": ["48px", { lineHeight: "102%", fontWeight: "400" }],
        "display-lg": ["30px", { lineHeight: "115%", fontWeight: "500" }],

        // Headings
        "heading-xl": ["28px", { lineHeight: "36px", fontWeight: "400" }],
        "heading-lg": ["24px", { lineHeight: "32px", fontWeight: "400" }],
        "heading-md": ["20px", { lineHeight: "28px", fontWeight: "500" }],
        "heading-sm": ["18px", { lineHeight: "24px", fontWeight: "500" }],

        // Body
        "body-lg": ["17px", { lineHeight: "26px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],

        // UI
        "label-lg": ["16px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],

        // Supporting text
        caption: [
          "12px",
          { lineHeight: "12px", fontWeight: "500", letterSpacing: "10%" },
        ],
      },
    },
  },
  plugins: [],
};
