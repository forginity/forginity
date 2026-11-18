import expoConfig from "eslint-config-expo/flat.js";

export default [
  ...expoConfig,
  {
    rules: {
      "react-hooks/immutability": "off",
      "import/no-named-as-default": "off",
    },
  },
  {
    ignores: [".expo/**", "node_modules/**", "dist/**", "android/**", "ios/**"],
  },
];
