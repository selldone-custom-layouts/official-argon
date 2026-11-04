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
| In the basket: quantity and "Checkout · total" on the product page (design C); a card's "+" adds straight away and becomes − n +; "Added to basket" notice | `components/kalio/product/KalioBasketLine.vue`, `KalioCardStep.vue`, `kalio-card-basket.ts`, `kalio-basket.ts`, `shell/KalioBasketToast.vue` |
| Basket drawer (design C, 0.2.11): a receipt with the subtotal, savings and Checkout; compact rows with a stepper; three "Often added" | `components/kalio/shell/KalioBasketDrawer.vue` (styles in `kalio-shell.scss`, `.k-bdrawer`) |
| Basket page (design C, 0.2.12): lines by seller; When · Where · Who cards; a receipt with every line of Selldone's bill, the discount code and Pay; on a phone a bar with the total and Pay | `pages/basket/cart/StorefrontPageBasketCart.vue` (Selldone's script kept), `components/kalio/checkout/KalioCartLines.vue`, `components/kalio/KalioOftenAdded.vue` (also in the drawer) |
| Where: the address sheet (a light Mapbox map with a fixed pin, search, "Use my location", saved addresses, every address field) | `components/kalio/checkout/KalioAddressSheet.vue` |
| When: shipping methods and pickup points as cards, any time or days and parts of the day, or a date | `pages/basket/cart/SCartShippingOptions.vue` (Selldone's script kept), in the basket page's When sheet |
| Pay: Selldone's payment window restyled (heading, total on the stone ground, each way to pay as a card) | `style/kalio-checkout.scss` (`.s--storefront-master-payment-dialog`) |
| Order page: where it stands, Invoice and Share, the steps as a line, items by seller; Selldone's vendor orders, returns and refunds in Kalio cards | `pages/basket/order/StorefrontPageBasketOrder.vue`, `pages/basket/order/physical/dashbaord/StorefrontPageBasketOrderPhysicalDashboard.vue` |
| Order page cards (0.2.15): the receipt with how it is paid and Pay now; Delivery (deliver to, when, tracking, billing, map, change address); Messages (bubbles and a message box, also on file and service orders) | `components/kalio/order/KalioOrderReceipt.vue`, `KalioOrderDelivery.vue`, `KalioOrderChat.vue` |
| Basket page, sheets, payment window and order page styles | `style/kalio-checkout.scss` |
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
- **Adding from a card** (`kalio-basket.ts`): a product with sizes opens
  the quick-buy sheet; any other goes into the basket from its cheapest
  offer with stock. Counts are set through the storefront's own
  AddToBasket / RemoveFromBasket; AddToBasket announces a first add
  (`kalio:basket-added`) for the notice. Selldone's green in-basket strip
  is not mounted (`layouts/StorefrontLayout.vue`).
- **Taps never wait for the server** (0.2.11). A basket answer takes about
  a second, sometimes three. Every stepper (card, shelf, product page,
  drawer) shows the count tapped at once (`wanted` in `kalio-basket.ts`);
  the requests for a line go out one at a time, each with the latest count,
  and a change of seller waits its turn and keeps the count. Before this
  the buttons were disabled while a request ran, so a quick second tap was
  lost, and changing the seller during a slow "+" sent the old count: on 4
  November 2026, 2 quarts from Alina became 1 from Mason.
- **The basket page** keeps Selldone's whole script (bill, basket config,
  coupons, lottery, club, wallet, shipping options, payment, service
  orders); only its template is Kalio's. Coupons and lottery prizes show
  only when the shopper has some (no empty "Add coupon" row). Pay leads
  to whatever is still missing (address, phone, email) before it opens
  the payment window. The When card shows only when there is something to
  choose; on 4 November 2026 molino has one method, Pickup, with no pickup
  point, so it does not show and Selldone asks only for an address.
- **The address sheet** (0.2.13 after a buyer's walk-through at 1920×923,
  1440×900, 1366×700 and 390×844, `../kalio-design/review/buyer.cjs`):
  the map is `streets-v12` (the light style read as a grey, broken map);
  a tap on the map takes the pin there and a tap on the pin looks up the
  address under it; a lookup replaces street, city, county and postcode
  together (no New York street with a London postcode); below zoom 13 the
  pin asks to zoom in; the map and the form have a fixed height and the
  footer sits above them (the map, a positioned box, used to paint over
  Save address when the form grew taller than the window). It started
  from Selldone's Mapbox wrapper with the
  `light-v11` style and Selldone's address lookups (`gto-to-address`,
  `autocomplete`, `address/all`); it saves the same receiver_info fields
  (`no`, `unit`, `name`, `phone`, …). mapbox-gl.css gives `.mapboxgl-map`
  `position: relative`, which collapsed the map to 0 px; the canvas keeps
  `position: absolute !important`.
- **No way to pay**: when the shop has no payment method for the
  basket's currency, the receipt says so and Pay does not open an empty
  payment window (`payment_ways`, `pay_blocker`).
- **Payment methods**: on 4 November 2026 the storefront first received no
  payment method (`shop.gateways` was empty); later that day the owner
  switched on Cash on delivery and a Motorbike method, and placed the
  first order, SM-1 (basket 29504, $55.15 with $25 delivery).
- **The order page's payment, delivery and chat** (0.2.15; the upload
  named 0.2.14 carried 0.2.13's files, see the release steps). Selldone's
  payment table, receiver widget and full-screen chat window gave way to
  Kalio cards (`components/kalio/order/`): the receipt in the side column
  now says how the order is paid (by card with the date, cash to the
  courier, cash at the shop, a bank transfer, or "Pay now" and "Use
  another way to pay" while an online payment waits), the Delivery card
  lists deliver to, when, tracking and billing beside a small map, with
  "Change address" (the address sheet) and billing edited in place, and
  the messages sit on the page as bubbles with a box under them. The
  sums follow Selldone's: an order's `price` is after every discount and
  the wallet, with delivery in it (the receipt used to add delivery
  again: SM-1 showed $80.15 instead of $55.15, and "Discount" repeated
  "You saved"). A bank transfer's details and receipt upload stay
  Selldone's row. On a phone the receipt follows the items, and the
  bottom bar hides while any sheet or window is open (it covered the
  address sheet's Save). Tested with SM-1's own data and three variants
  (paid and sent, waiting for payment, delivered):
  `../kalio-design/review/ordercards.cjs`.
- **The basket drawer** reads the savings from the lines (`dis` × count +
  `offer_amount`): a basket read on page load has no `bill`. The "Added to
  basket" notice keeps quiet while the drawer is open (`basketView`).
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
python <cli-source>/.agents/skills/package-selldone-storefront-layout/scripts/package_layout.py dist dist.zip --manifest manifest.json --force
unzip -p dist.zip app/shop.js | cmp - dist/app/shop.js   # the ZIP is this build
node scripts/kalio-deploy.mjs "$(npm root -g)/selldone-cli"
```

`<cli-source>` is a clone of github.com/selldone/cli; the npm package does
not ship `.agents/`. Locally, `file` calls a few large lazy chunks
`application/octet-stream`; the server has served those as JavaScript
(checked on 0.2.2), so only `text/x-java` blocks a release.

Without `--force` the packager keeps an existing `dist.zip` (it says so on
stderr and still prints PASS for the old file): on 4 November 2026 the upload
named 0.2.14 carried 0.2.13's files that way.

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
