// Builds the static preview into ./out. API routes can't be exported, so they are moved aside during the build.
const fs = require("fs");
const { execSync } = require("child_process");
const api = "app/api", tmp = ".api-aside";
fs.renameSync(api, tmp);
try {
  execSync("npx next build", { stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_PREVIEW: "1" } });
  fs.writeFileSync("out/.nojekyll", "");
} finally {
  fs.renameSync(tmp, api);
}
