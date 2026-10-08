// Blue and white only. Tailwind's default blue scale matches config/theme.json.
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { fontFamily: { sans: ["Figtree", "Noto Sans Lao", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "ui-monospace", "monospace"] } } },
  plugins: [],
};
