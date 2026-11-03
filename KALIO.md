# Kalio Market Hall — Selldone Layout

The official `selldone/storefront` app, customized for **Kalio** (shop 15645,
`kalio-qz8Yoltw`), a grocery marketplace, and published as the Layout package
**`kalio-market-hall`** (layout id 23).

## What is Kalio's

| Area | Where |
| --- | --- |
| Market front (banner, aisles, promises, rails, sellers) | `components/kalio/KalioMarketFront.vue` |
| Aisle sign on category pages | `components/kalio/KalioAisleHeader.vue` |
| Seller hero + seller rails on vendor pages | `components/kalio/KalioSellerHero.vue`, `KalioSellerShelf.vue` |
| Product rails with the platform quick-buy sheet | `components/kalio/KalioRail.vue` |
| Catalogue page hosting all three states | `pages/products/StorefrontPageProducts.vue` |
| Empty basket, 404 | `pages/basket/cart/StorefrontPageBasketCart.vue`, `pages/errors/404/` |
| Tokens + Kalio sections | `style/storefront.scss` |
| Skin for Selldone's own components | `style/kalio-platform.scss` |

Commerce markup and state are untouched: cards, quick-buy, basket, checkout,
variants and vendor offers are Selldone's components, re-skinned.

## Release

The official build and `selldone-cli` 1.0.16 do not pass the current upload
endpoint. The steps below are what does. Never re-upload a version: a version
may be registered even when the client reports an error.

```bash
# 1. bump "version" in manifest.json (never reuse one)
npm run build-production
rm dist/index.html                        # every ZIP member must be under app/
node scripts/kalio-svg-flatten.mjs dist/app
file -b --mime-type dist/app/js/*.js | sort | uniq -c   # no text/x-java allowed
python <selldone-cli>/.agents/skills/package-selldone-storefront-layout/scripts/package_layout.py dist dist.zip --manifest manifest.json
node scripts/kalio-deploy.mjs "$(npm root -g)/selldone-cli"
```

`kalio-deploy.mjs` reuses the official CLI's saved login, 2FA check and version
check, and sends the manifest as JSON text of the six contract keys.

Then confirm on the server, not by exit code: `GET
https://api.selldone.com/developer/layouts/23/deploys` must show the version
with `extracting: false`, `error: null`, and `file_manifest` hashes equal to
`dist/app/shop.js` and `dist/app/shop.css`.

### Why each step exists (found by probing the endpoint, 2 November 2026)

- **`app/` output, relative base** (`vite.config.ts`). The extractor wants
  `app/shop.js` + `app/shop.css`. Releases are stored at
  `layouts/<id>/releases/<ULID>/app`, so every chunk and asset reference is
  relative to where `shop.js` is served.
- **Safe file names** (`safeName` in `vite.config.ts`). A space or bracket in
  any member name rejects the archive.
- **Passive SVG** (`scripts/kalio-svg-flatten.mjs`). The scanner whitelists SVG
  attributes; `style`, `<style>`, `xml:space`, `enable-background`, `fx/fy`,
  `display`, character references in values and more are refused. The script
  turns CSS into plain attributes and drops what has no equivalent; every
  rewrite was pixel-compared against the original.
- **Every chunk reads as JavaScript** (`sniffAsJavaScript` in
  `vite.config.ts`). The service stores each file with the MIME type libmagic
  reads from its content; a chunk opening with `import{…}` reads as Java, and
  browsers refuse a module served as `text/x-java`. 40 of 0.1.4's chunks were
  served that way; from 0.1.5 every JS file opens with `"use strict";`.
- **Fewer files** (`assetsInlineLimit`, `cssCodeSplit: false`,
  `experimentalMinChunkSize`, flags from jsDelivr). The endpoint processes the
  archive inside the request, behind Cloudflare's ~100 s read limit; at 714
  files it was cut mid-extraction. At 363 it completes.

## Live

**Known Selldone bug (3 November 2026).** With the Layout attached, the shop
page loads `https://layouts.selldone.com/<deploy.path>/app/shop.js`. For
uploads made through the current endpoint `deploy.path` is
`layouts/23/releases/<ULID>/app` and the files are served from
`https://cdn.selldone.com/public/<deploy.path>/shop.js`, so the page asks for
`…/app/app/shop.js` on the wrong host, gets a 404 and stays blank. Older
uploads (path `<package>/<version>`, e.g. Kario's) are unaffected. Until
Selldone fixes the address, attaching this Layout blanks the shop. The 404s
are cached by Cloudflare for a year (`max-age=31536000`), so copying files to
that address would also need a cache purge.

To check a release as visitors will get it, serve the live page's HTML with
that one base replaced by the `cdn.selldone.com/public/…` one: 0.1.5 was
checked this way on home, aisle, product, seller, basket, 404 and 375 px.

Uploading creates a **beta** version; it does not change any shop. To put it on
Kalio: shop dashboard → Domains → **Layout** tab → choose *Kalio Market Hall*.
The designed home is the catalogue root, so set the shop's **Home** to the
**Shop** page; it currently points at a Page Builder template landing page.
