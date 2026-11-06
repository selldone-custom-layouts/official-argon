// Checks a Layout upload on Selldone's server: the newest deploys of a Layout,
// whether each finished extracting without an error, and whether its shop.js
// and shop.css are the same bytes as your local build.
//
// usage: node --use-system-ca scripts/kalio-verify-deploy.mjs <selldone-cli root> <layout id> [dist/app]
//
// It reuses the official selldone-cli's saved sign-in (~/.selldone-dev/.persist)
// and never prints the token. A release is good only when the newest line shows
// extracting:false, error:null, js_match:true and css_match:true.
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";

const [cliRoot, id, app = "dist/app"] = process.argv.slice(2);
if (!cliRoot || !id) {
  console.error("usage: node scripts/kalio-verify-deploy.mjs <selldone-cli root> <layout id> [dist/app]");
  process.exit(2);
}
const { Authentication } = await import(pathToFileURL(path.join(cliRoot, "src/authentication.mjs")).href);
const token = Authentication.getAccessToken();
if (!token) {
  console.error("The Selldone CLI is not signed in: run `selldone` and choose Login.");
  process.exit(2);
}
const r = await fetch(`https://api.selldone.com/developer/layouts/${id}/deploys`, {
  headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
});
const data = await r.json();
const list = data.deploys?.data || data.deploys || data.data || [];
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(path.join(app, f))).digest("hex");
const local = { "shop.js": sha("shop.js"), "shop.css": sha("shop.css") };
for (const d of list.slice(0, 2)) {
  const fm = d.file_manifest || {};
  const pick = (name) => {
    const e = Object.entries(fm).find(([k]) => k.endsWith("/" + name) || k === name);
    return e ? (typeof e[1] === "string" ? e[1] : e[1]?.sha256 || JSON.stringify(e[1])) : null;
  };
  console.log(
    JSON.stringify({
      id: d.id,
      version: d.version,
      extracting: d.extracting,
      error: d.error,
      path: d.path || d.deploy_path,
      js_match: pick("shop.js") === local["shop.js"],
      css_match: pick("shop.css") === local["shop.css"],
    }),
  );
}
