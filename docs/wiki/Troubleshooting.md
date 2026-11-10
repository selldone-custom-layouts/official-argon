# Troubleshooting

## Sign in goes to Selldone and shows an error

The shop has no OAuth client for sign-in. Set up the shop's OAuth client id (shop dashboard, or the Selldone MCP connector's `selldone_shop_client_create`). See [Shop Requirements](Shop-Requirements).

## The shop shows a blank page, or an old page flashes first

A chunk imports `../shop.js`, so the app loads twice through Selldone's redirect. Keep shared code in the `core` chunk and don't use `experimentalMinChunkSize` (both in `vite.config.ts`). `release.sh` refuses such a build.

## Chunks fail with a MIME error (`text/x-java`)

Selldone stores the MIME type it sniffs from each file. Every JS file must start with `"use strict";`: that is `sniffAsJavaScript` in `vite.config.ts`. Check with `file --mime-type dist/app/js/*.js`.

## The upload is rejected

| Message | Fix |
| --- | --- |
| "The manifest must be an array." | Upload with `scripts/kalio-deploy.mjs`, not the plain CLI. |
| "Archive paths must be safe relative app/ paths." | Remove `dist/index.html`, and use no spaces or brackets in file names. |
| "Active SVG attributes" / "only passive vector shapes" | Run `node scripts/kalio-svg-flatten.mjs dist/app`. |
| Request cut off after ~100 s, and the version exists but is empty | Too many files. Stay under ~360, then upload a **new** version number. |
| 401 | The CLI is signed out (`~/.selldone-dev/.persist` is empty). Run `selldone` → Login. |

## The upload worked but the shop still shows the old version

- The version isn't attached yet: see [Go Live](Go-Live).
- A custom domain keeps its own selection. Set it to **inherit**, or attach the version to that domain.
- You checked a URL with a query. Open the plain address and read `window.sdShopLayout`.
- The ZIP was stale: always package with `--force` and compare `shop.js` with `cmp`.

## `/` shows a landing page, the Layout is only on `/shop`

The shop's Home is a Page Builder page. Set Home to **Shop**: see [Go Live](Go-Live).

## Grey boxes with a file name in them

Those are photo slots waiting for their photo. Put a WebP with exactly that name in `assets/photos/`, then build and release. A new tag or brand asks for its own `trend-<tag>.webp` or `brand-<brand>.webp`. See [Customize](Customize#the-photos).

## A category shows a collage of products instead of a photo

It has no photo of that shape. Add `assets/argon/<shape>-<category slug>.webp` (the slug is the category's `name`), then build and release. See [Customize](Customize#category-photos).

## A home section is missing

Each section folds away without its data: "<Category> offers" and the deal strip need discounts, "Shop the latest tech" needs four categories with products, "Explore our brands" needs four brands, "Trending now" needs tags other than `best-seller` and `new-arrival`, "Tips and guides" needs blog posts. See [Shop Requirements](Shop-Requirements).

## The deal clock or the deal date is missing

A clock counts only to a deal's own end date. Give the discount an end date in Selldone. Without one, the strip says "Today's deals across the store".

## The Theme button doesn't show on my shop

That is by design: with `themeSwitcher: "showcase"` it shows only on Argon's showcase shops. Set `themeSwitcher: "on"` in `components/argon/argon-theme.settings.ts` to give your visitors the switcher. See [Theme and colours](Theme-and-colours).

## Purple buttons appear in some places

Those are Selldone's own components using the theme colour. Argon sets `--v-theme-primary` from its buy colour in `style/kalio-tokens.scss`; if a part still shows Selldone's purple, make it read that variable rather than a fixed colour. To change the colours themselves, use the settings file, not the tokens.

## Filters are missing or show old values

Specs must be **flat**, plus `spec_order`. Save the category's filter list again after editing specs. See [Shop Requirements](Shop-Requirements).

## A product page shows a plain purple page in a headless test

A headless browser opening a `/product/` link directly gets Selldone's SEO page. Open the home first and move with the Layout's links, or test in a normal browser or the dev server.

## The map is grey or 0 px tall

`mapbox-gl.css` sets `position: relative` on the map; the canvas must stay `position: absolute`. Use the `streets-v12` style. Search finds streets and numbers, not landmarks.

## Address search only works after pressing Enter (Android)

`v-model` waits for the keyboard's composition to end. Read the input with `:value` and `@input`.

## Sticky parts don't stick

Vuetify's `.v-application` has `overflow: hidden`. Switch it to `overflow: clip` on the pages that need sticky (the product page's buy cards are one).

## GitHub blocks the push: "Mapbox Secret Access Token"

Selldone's storefront history contains Selldone's **public** Mapbox browser key (`pk.`). It has been public in `selldone/storefront` since 2023. Allow it once with the link GitHub prints, or remove it from your own commits.
