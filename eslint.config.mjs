import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextEslint from '@eslint/eslintrc';
import nextPlugin from 'eslint-config-next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.config(nextPlugin),
  {
    rules: {
      // Disable the no-explicit-any rule for Vercel deployment
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default eslintConfig;
