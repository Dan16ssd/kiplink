// NEXT_PUBLIC_PREVIEW=1 builds the static GitHub Pages preview (no server, no chain).
const preview = process.env.NEXT_PUBLIC_PREVIEW === "1";
module.exports = preview
  ? { reactStrictMode: true, output: "export", basePath: "/kiplink", trailingSlash: true, images: { unoptimized: true } }
  : { reactStrictMode: true };
