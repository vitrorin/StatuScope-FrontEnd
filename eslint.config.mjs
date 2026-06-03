import storybook from "eslint-plugin-storybook";
import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";

export default defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
