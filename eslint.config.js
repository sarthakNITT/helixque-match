const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "commitlint.config.js",
    ],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // Add your custom rules here
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
