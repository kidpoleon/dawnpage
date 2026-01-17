import { defineConfig } from "eslint/config";

const eslintConfig = defineConfig([
  {
    ignores: [
      "dist/**",
      "build/**",
      "out/**",
      "node_modules/**",
      ".next/**",
    ],
  },
]);

export default eslintConfig;
