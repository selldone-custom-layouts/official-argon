/*
 * Kalio — live preview of an uploaded Layout release.
 *
 * Serves the shop's real storefront HTML, fetched from Selldone on each
 * request, with one change: Selldone's layout loader (window.sdShopLayout)
 * is pointed at the release you name instead of the one the shop has
 * selected. Everything else — shop, theme, metas, the loader itself and its
 * redirect from selldone.com/cdn-storage-public to cdn.selldone.com — is
 * Selldone's own, so this is exactly what visitors will get once that
 * release is selected for the shop.
 *
 * Usage: node --use-system-ca scripts/kalio-live-preview.mjs <release-id> [port]
 *   <release-id> is the ULID in the deploy path layouts/23/releases/<ULID>/app
 *   (GET /developer/layouts/23/deploys). Without it the shop's own selection
 *   is served unchanged.
 *   http://localhost:<port>/            the shop as configured
 *   http://localhost:<port>/?home=shop  with Home set to the shop page
 *                                       (remembered in a cookie)
 */
import http from "node:http";

const SHOP = "https://molino.myselldone.com";
const RELEASE = /^[0-9A-Z]{26}$/i.test(process.argv[2] || "") ? process.argv[2] : null;
const PORT = Number(process.argv[RELEASE ? 3 : 2] || process.env.PORT || 9125);

/* In the loader's JSON: …\/layouts\/23\/releases\/<ULID>\/app\/shop.js */
const RELEASE_IN_LOADER = /(\\\/layouts\\\/\d+\\\/releases\\\/)[0-9A-Za-z]{26}(\\\/app\\\/shop\.(?:js|css))/g;

async function livePage() {
  const response = await fetch(`${SHOP}/?kalio-preview=${Date.now()}`, {
    headers: { Accept: "text/html" },
  });
  if (!response.ok) throw new Error(`${SHOP} answered ${response.status}`);
  return response.text();
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) {
      res.writeHead(404);
      return res.end();
    }

    const shopHome =
      url.searchParams.get("home") === "shop" || /(?:^|;\s*)kalio_home=shop/.test(req.headers.cookie || "");

    try {
      let html = await livePage();
      if (RELEASE) html = html.replace(RELEASE_IN_LOADER, `$1${RELEASE}$2`);
      if (shopHome) html = html.replace(/<meta name="custom-home" content="[^"]*"/, '<meta name="custom-home" content="shop"');
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        ...(url.searchParams.get("home") === "shop" ? { "set-cookie": "kalio_home=shop; path=/" } : {}),
      });
      res.end(html);
    } catch (error) {
      const cause = error.cause ? ` (${error.cause.code || error.cause.message})` : "";
      console.error(`live storefront unreachable: ${error.message}${cause}`);
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      res.end(`Could not read the live storefront: ${error.message}${cause}`);
    }
  })
  .listen(PORT, () =>
    console.log(
      `Kalio live preview on http://localhost:${PORT}` +
        (RELEASE ? ` — release ${RELEASE}` : " — the shop's own selection") +
        "  (Home=Shop: /?home=shop)",
    ),
  );
