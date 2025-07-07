import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      // Generated Prisma files
      "src/generated/**",
      "**/generated/**",
      "**/prisma/runtime/**",
      "**/prisma/client.js",
      "**/prisma/edge.js",
      "**/prisma/wasm.js",
      "**/prisma/index.js",
      "**/prisma/index-browser.js",
      "**/prisma/package.json",
      "**/prisma/*.d.ts",
      "**/prisma/*.so.node",
      "**/prisma/schema.prisma",
      
      // Build outputs
      "**/node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      
      // Generated/minified files
      "**/*.generated.*",
      "**/*.min.js",
      "**/*.bundle.js",
      "**/*.chunk.js",
      "**/*.runtime.js",
      "**/*.wasm.js",
      "**/*.edge.js",
      
      // Test outputs
      "test-results/**",
      "playwright-report/**",
      "coverage/**",
      "*.lcov",
      
      // Environment and config files
      ".env*",
      "!.env.example",
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript")
];

export default eslintConfig;
