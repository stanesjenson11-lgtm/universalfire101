import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Vendored fancycomponents.dev code (pnpm dlx shadcn add @fancy/...): its
  // hooks run in loops/conditions with fixed counts, which is safe here but
  // trips the React Compiler rules. Our own code stays fully linted.
  {
    files: ["components/fancy/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/static-components": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
