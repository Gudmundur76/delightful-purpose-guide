import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./content/**/*.mdx"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
