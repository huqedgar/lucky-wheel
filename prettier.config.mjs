/** @type {import("prettier").Config & import("@ianvs/prettier-plugin-sort-imports").PluginConfig & import("prettier-plugin-tailwindcss").PluginOptions} */
const config = {
  // ==================== CORE FORMATTING ====================
  // Only non-default values — reduces maintenance, auto-benefits from Prettier updates
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  endOfLine: "lf",

  // ==================== IMPORT SORTING ====================
  // Only patterns actually used in this project
  importOrder: [
    // Node builtins & directives
    "^node:",
    "^server-only$",
    "^client-only$",

    // React & Next.js
    "^react$",
    "^react-dom(/.*)?$",
    "^react/(.*)$",
    "^next$",
    "^next/(.*)$",
    "^next-intl(/.*)?$",

    // Third-party (catch-all for everything not matched)
    "<THIRD_PARTY_MODULES>",

    // Internal — UI layer
    "^@/components/ui/(.*)$",
    "^@/components/(.*)$",

    // Internal — logic & data
    "^@/hooks/(.*)$",
    "^@/lib/(.*)$",
    "^@/actions/(.*)$",
    "^@/supabase/(.*)$",
    "^@/queries/(.*)$",
    "^@/validations/(.*)$",

    // Internal — config & types
    "^@/config/(.*)$",
    "^@/i18n/(.*)$",
    "^@/types/(.*)$",

    // Relative imports
    "^[./]",
  ],
  importOrderTypeScriptVersion: "5.9.3",

  // ==================== TAILWIND CONFIG ====================
  tailwindStylesheet: "./src/app/[locale]/globals.css",
  tailwindFunctions: ["clsx", "cva", "cn"],

  // ==================== PLUGINS ====================
  // Order matters: sort-imports must be before tailwindcss
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
};

export default config;
