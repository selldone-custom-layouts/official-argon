/*
 * Kalio Layout upload — a thin wrapper around the official selldone-cli 1.0.16.
 *
 * Why it exists: the official CLI posts manifest.json as a single JSON text
 * field, and api.selldone.com/developer/layouts/deploy currently rejects that
 * with "The manifest must be an array." This wrapper changes only that one
 * thing — the manifest goes up as manifest[key] fields, which the server parses
 * into an array — and otherwise reuses the CLI's own modules: its saved login
 * (~/.selldone-dev/.persist, never read or printed here), its 2FA/account
 * check, its version check and its endpoint URLs.
 *
 * Usage (from the Layout project root, after dist.zip is built and validated):
 *   node kalio-deploy.mjs <path-to-global-selldone-cli>
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const cliRoot = process.argv[2];
if (!cliRoot) {
  console.error("usage: node kalio-deploy.mjs <selldone-cli root>");
  process.exit(2);
}
const mod = (p) => import(pathToFileURL(path.join(cliRoot, p)).href);

const { Authentication } = await mod("src/authentication.mjs");
const { default: Config } = await mod("src/config.mjs");
const { Api } = await mod("src/api.mjs");

const MANIFEST = JSON.parse(fs.readFileSync(Config.MANIFEST_PATH, "utf8"));
const ZIP = Config.BUILD_ZIP_PATH;

if (!fs.existsSync(ZIP)) {
  console.error(`missing ${ZIP}; build and validate it first`);
  process.exit(2);
}
if (!Authentication.getAccessToken()) {
  console.error("No saved Selldone CLI login. Run the official CLI login first.");
  process.exit(2);
}

await new Promise((resolve) =>
  Authentication.check2FAStatus(async () => resolve()),
);
if (!Authentication.USER) {
  console.error("Login could not be confirmed; stopping before upload.");
  process.exit(2);
}
console.log(`account: ${Authentication.USER.email}`);

await Api.checkVersion(MANIFEST.package, MANIFEST.version);
console.log(`package ${MANIFEST.package} @ ${MANIFEST.version}`);

/* Laravel's boolean rule accepts "1"/"0", not the strings "true"/"false". */
const field = (v) =>
  v === true ? "1" : v === false ? "0" : v === null || v === undefined ? "" : String(v);

const form = new FormData();
form.append(
  "file",
  new Blob([fs.readFileSync(ZIP)], { type: "application/zip" }),
  "dist.zip",
);
/* Mode "safe-json" (default): the manifest as JSON text, as the official CLI
   sends it, but restricted to the six fields of the artifact contract's
   "safe storefront shape" — deploy_server and deploy_path are build-time
   settings for vite.config.ts, not deployment metadata. Mode "fields":
   manifest[key] form fields. */
const MODE = process.argv[3] || "safe-json";
const SAFE = ["package", "version", "name", "description", "storefront", "backoffice"];
if (MODE === "fields") {
  for (const [key, value] of Object.entries(MANIFEST)) form.append(`manifest[${key}]`, field(value));
} else {
  const safe = Object.fromEntries(SAFE.map((k) => [k, MANIFEST[k] ?? null]));
  form.append("manifest", JSON.stringify(safe));
}
console.log(`manifest mode: ${MODE}`);

/* A passing upload is processed while the request is still open (archive
   scan, extraction). Version 0.1.0 lost its connection mid-way: the version
   was registered but its files never reached the CDN, and the only trace was
   a socket error. So the outcome is always reported — status, body, elapsed
   time, or the transport error — and never retried automatically: a version
   that may exist is checked on the CDN, not uploaded twice. */
const started = Date.now();
const elapsed = () => `${((Date.now() - started) / 1000).toFixed(1)}s`;
let response;
try {
  response = await fetch(Config.SELLDONE_API_UPLOAD_URL, {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${Authentication.ACCESS_TOKEN}`,
      Accept: "application/json",
    },
  });
} catch (error) {
  const cause = error?.cause;
  console.log(`TRANSPORT ERROR after ${elapsed()}: ${error.message}; cause=${cause?.code || cause?.message || "?"}`);
  console.log("The version may still have been registered. Verify on the CDN before any retry.");
  process.exit(3);
}
console.log(`response after ${elapsed()}: HTTP ${response.status}`);
for (const h of ["content-type", "content-length", "transfer-encoding", "cf-ray", "server"]) {
  if (response.headers.get(h)) console.log(`  ${h}: ${response.headers.get(h)}`);
}

let text = "";
try {
  text = await response.text();
} catch (error) {
  console.log(`BODY CUT OFF after ${elapsed()}: ${error.cause?.code || error.message}`);
  console.log("The server answered and then closed mid-body. Verify on the CDN before any retry.");
  process.exit(3);
}
let data = null;
try {
  data = JSON.parse(text);
} catch {
  /* not JSON */
}
console.log(`HTTP ${response.status}`);
if (response.ok && data && !data.error) {
  console.log("UPLOAD ACCEPTED:", data.message || "");
  if (data.deploy) {
    const { layout_id, id, version, status } = data.deploy;
    console.log("deploy:", JSON.stringify({ layout_id, id, version, status }));
    console.log(`panel: ${Config.SELLDONE_SERVICE_URL}/developer/layouts/${layout_id}`);
  }
  process.exit(0);
}
console.log("UPLOAD REJECTED:", data ? JSON.stringify(data).slice(0, 600) : text.slice(0, 600));
process.exit(1);
