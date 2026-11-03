# Kalio — Selldone Layout

The official `selldone/storefront` app, customized for **Kalio** (shop 15645,
renamed **molino** on 3 November 2026; formerly `kalio-qz8Yoltw`), a grocery
marketplace, and published as the Layout package
**`kalio-market-hall`** (layout id 23). The package name is permanent; the
design it carries changed in 0.2.0.

## The design (0.2.0 onwards)

Built like a big grocery front — banner, aisles, rows of products — in
Kalio's own dress: white floor, deep green for every commerce action, coral
for a saving, Fraunces headings over DM Sans, and each aisle's products on a
pale tint of their own. The approved mockup is in
`../kalio-design/home-mockup/`.

| Area | Where |
| --- | --- |
| Home page: deals counter, aisles, rows, mosaic, sellers, shelf | `components/kalio/KalioHome.vue` and the components it composes |
| Deals counter (the hero): the week's offer beside a rail of deals | `components/kalio/KalioHero.vue` |
| Aisle row (two rows of round pictures) | `components/kalio/KalioAisleRibbon.vue` |
| Product rows with the platform quick-buy sheet | `components/kalio/KalioRail.vue`, `KalioSellerLine.vue` |
| Aisle mosaic, seller cards, market shelf | `components/kalio/KalioMosaic.vue`, `KalioSellerCards.vue`, `KalioShelf.vue` |
| Quick-buy sheet for every "+" (the product page's Kalio overview inside); the catalogue's "+" is routed to it | `components/kalio/KalioQuickBuy.vue`, `kalio-listing-quick-buy.ts` |
| Product page: breadcrumb, highlights, sections, aisle index | `pages/product/StorefrontPageProduct.vue`, `components/kalio/KalioAisleIndex.vue` |
| Product overview (packshot panel, buy column) — Selldone's SProductOverview logic via `extends`, Kalio markup | `components/kalio/product/KalioProductOverview.vue` |
| Seller offer cards — SSmartSelectVendor logic via `extends` | `components/kalio/product/KalioSellerOffers.vue` |
| Product page styles | `style/kalio-product.scss` |
| Shelf head (design A) for every shop page that lists products: crumbs, title, count, a row of aisle words | `components/kalio/KalioShelfHead.vue` |
| Aisle page head | `components/kalio/KalioAisleHeader.vue` |
| Seller storefront: shelf head with their mark and aisles; offers and one row per aisle | `components/kalio/KalioSellerHero.vue`, `KalioSellerShelf.vue` |
| Header: wordmark, Aisles menu, search, account, basket pill, aisle strip; basket and phone-menu drawers | `components/kalio/shell/KalioHeader.vue` |
| Footer: a band with the shop's counts, aisles, sellers, shop links (the merchant's footer menu), account | `components/kalio/shell/KalioFooter.vue` |
| Sign-in sheet (Selldone's SShopLogin inside) | `components/kalio/shell/KalioSignIn.vue` |
| Catalogue header: "All products", a search or the deals, with the count | `components/kalio/KalioCatalogueHeader.vue` |
| Header, footer, drawers, sign-in, catalogue toolbar, filter panel | `style/kalio-shell.scss` |
| Shared reads: aisles, sellers, who sells what, tints | `components/kalio/kalio-catalog.ts` |
| Typefaces (loaded by the app) | `components/kalio/kalio-fonts.ts` |
| Shop page choosing home / aisle / seller / catalogue | `pages/products/StorefrontPageProducts.vue` |
| Empty basket, 404 | `pages/basket/cart/StorefrontPageBasketCart.vue`, `pages/errors/404/` |
| Tokens and shared pieces | `style/kalio-tokens.scss` |
| Skin for Selldone's own components | `style/kalio-platform.scss` |
| Kalio's own sections | `style/kalio-sections.scss` |

The shop pages (aisles, the catalogue, search, deals, sellers) follow
design A of three drawn on 3 November 2026 in `../kalio-design/aisle-options/`:
named in type rather than painted, every packshot on one stone well
(`--k-well`), the saving as coral type, a quiet filter sidebar, and the sort
as one menu. The aisle tints stay on the home page.

The home's top and middle (0.2.4) come from three options drawn in
`../kalio-design/hero-options/` on 3 November 2026: the deals counter was
chosen for the top, the aisle mosaic and the market shelf for the middle.

Commerce markup and state are untouched: cards, quick-buy, basket, checkout,
variants and vendor offers are Selldone's components, re-skinned. Kalio adds
the aisle tint, the unit and the seller line around the platform card.

A merchant's custom header or footer code still wins over Kalio's
(`layouts/StorefrontLayout.vue`).

The filter panel is Selldone's (`SCategoryFilter`), restyled: on desktop it
sits inside the catalogue column beside the grid and is only as tall as its
filters; the aisle sign and the seller storefront above it stay full width.
On a phone it is a sheet over the page, and the header and bottom bar step
aside while it is open.

The catalogue starts on the normal grid even where the shop's theme names
Insta as a device's default (`StorefrontPageProducts.vue`): Insta hides a
card's name until hover and drops the "+" below a laptop. A shopper who
picks Insta from the toolbar keeps it; Kalio draws it as a denser grid with
the name and price shown.

The shop page shows the home sections only when it has no query. Search,
filters, sorts, "See all deals" and "Browse every product" all add a query,
and then Selldone's listing shows instead.

Facts that shape the code:

- **Fonts load from the app, not `index.html`.** In production the Layout
  runs inside Selldone's own HTML; `index.html` never reaches a visitor.
- **Image sizes.** Category icons resize to any size. Seller and product
  images exist only as the original and a 128px thumbnail; any other size is
  a 404 (`kalio-catalog.ts`).
- **The struck price follows the chosen seller** (`kalio-offer-price.ts`).
  Selldone's price section paid the seller's price but took the struck
  price and the percent off from the product or size; it is amended where
  the product page, the quick-buy sheets and the catalogue load. Deals are
  real only when each seller's offer carries the discount: on 3 November
  2026 every offer on the 80 discounted products was given 20% of its own
  price (snapshots in the session scratchpad, `dealfix/`).
- **Nothing is named.** Aisles, sellers, deals, slides and tiles all come
  from live data; an aisle Kalio does not know still gets a tint, a row and,
  if featured, a tile.

Market Hall, the first design, is tagged `market-hall-0.1.5`.

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
python <cli-source>/.agents/skills/package-selldone-storefront-layout/scripts/package_layout.py dist dist.zip --manifest manifest.json
node scripts/kalio-deploy.mjs "$(npm root -g)/selldone-cli"
```

`<cli-source>` is a clone of github.com/selldone/cli; the npm package does
not ship `.agents/`. Locally, `file` calls a few large lazy chunks
`application/octet-stream`; the server has served those as JavaScript
(checked on 0.2.2), so only `text/x-java` blocks a release.

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

Uploading creates a **beta** version; it does not change any shop. Attaching
is a dashboard action (shop → Layout setting → *Molino Market Hall* (named Kalio Market Hall until 3 November 2026), then the
version). Since Selldone's new layout loader (3 November 2026) the shop
loads the version **selected** there; a new upload is not picked up until it
is selected. The designed home is the shop page, so set the shop's **Home**
to **Shop**; a Page Builder landing page there replaces it on `/` (the
Kalio home is still at `/shop`).

**How Selldone loads a Layout now.** The shop page carries an inline loader,
`window.sdShopLayout`, whose config names the selected release as
`https://selldone.com/cdn-storage-public/layouts/23/releases/<ULID>/app/shop.js`.
That address answers **302** to `https://cdn.selldone.com/public/…/shop.js`.
A browser keys a module by the address it asked for but resolves its
imports against the address it landed on, so any chunk importing
`../shop.js` loads a second copy of the app: the page-builder home flashes,
then the page goes blank. That is what broke 0.2.0. From 0.2.1 the build
keeps everything in a `core` chunk (`coreChunk` in `vite.config.ts`) and no
chunk imports `shop.js`. Kario's Layouts are built the same way as 0.2.0 but
work because they were uploaded before the change: their files are served
straight from `layouts.selldone.com`, no redirect.

**Previewing a release before it is selected:**

```bash
node --use-system-ca scripts/kalio-live-preview.mjs <release-ULID> 9125
```

serves the shop's real HTML with the loader pointed at that release, through
Selldone's own redirect (launch entry `kalio-live-preview`). The ULID is in
the deploy path from `GET /developer/layouts/23/deploys`.
`--use-system-ca` is needed when Node is started outside a shell here; the
bundled CA store rejects Selldone's chain.

Release checks that matter, beyond the hashes: every `dist/app/js/*.js` reads
as JavaScript to `file --mime-type`, `grep -l 'from"../shop.js"'
dist/app/js/*.js` finds nothing, and `find dist/app -type f | wc -l` stays
under ~360 (fonts ship as WOFF2 only, SVGs up to 16 KB are inlined).
