# Argon — Selldone Layout

**Argon Electronics** (package `argon-electronics`, Layout **32**) is a Layout of the Selldone shop **Digini** (shop 15549, xapi name `digini-hzgablru`), an electronics store with one seller. It was made on 10 November 2026 for the owner's request "like argos.co.uk": the reference's page sections and its bright catalogue-store feel, in Argon's own brand (never the reference's name, logo, slogans or images). It runs only on **argon.selldone.shop** (domain 1241, whose Home is the shop page). The shop's other addresses carry other Layouts (Digito, Besti, Senso). It started from Besti 1.0.15 (`besti-layout`), so every shared feature is kept: the shared theme switcher (showcase only), real deal timers, rings inside the box, the one-row gallery, named colour tiles, the compare page, the desk account, the cart drawer (design C), the guest order code fix and the deals list that stops asking for more.

The mockups are `../digini-design/argon-home.html`, `argon-category.html` and `argon-product.html` (screenshots in `../digini-design/shots/argon-*.png`). The photo prompts for Codex are `../digini-design/codex-photos-argon.md`.

## What makes it Argon

| Area | Argon |
| --- | --- |
| Brand | "argon" in white on a red rounded tile, like a badge (`ArgonLogo.vue`); the one line is `BRAND.name` in `components/kalio/kalio-brand.ts`; the mark (a white "a" on the red tile) is `assets/brand/argon-mark.svg`, also the tab icon |
| Colours | two colours: the buy colour, green `#007a3d` (every "Add to cart", Checkout, chosen state; white words 5.45:1) and the brand colour, red `#c8102e` (the logo tile, links, accents, the deal badge; white words 5.88:1). Near-black `#1a1a1a` pills for quick links, sale red for "Save $X", light-grey `#f2f2f2` section grounds, white page. Every colour is a token (`style/argon-theme.scss`) |
| Theme | the shared switcher (`components/theme-switcher/`, config `components/argon/argon-theme.ts`): five palettes (Argon red, Cobalt, Plum, Teal, Tangerine) + Custom colour + Light / Dark, only on Argon's showcase shop; the merchant's settings in `components/argon/argon-theme.settings.ts` |
| Type and icons | Barlow; Material Symbols Rounded for Argon's own icons |
| Header | a thin utility row (Track order, Returns, Help); the red logo tile, "Shop" (a mega menu of every category with its picture) and "Trending" (the live tags) dropdowns, Deals, a wide rounded grey search with a dark Search button and suggestions, then Account, Wishlist, Theme and Cart (icon and small label, a count bubble); a benefits strip of three honest links (the deals' real end date, Compare up to 4, Track any order). Phone: logo and menu button, four icons, the search across, one benefit line that turns; the menu button opens a side panel (`ArgonHeader.vue`) |
| Home | `ArgonHome.vue`: the category carousel (a "Today's deals" tile, then every category on a grey tile with its packshot), three dark promo cards and four "<Category> offers" pills, a green "Deal prices locked until <date>" strip, "Shop the latest tech" photo cards, a wide "Up to X% off <Category>" banner, "Popular products" rail, the dark red compare band, "Trending now" (tags), "Explore our brands", "There's even more" (track, compare, help, contact), "More deals" rail, "Need a hand?", the four newest guides (the owner's rule: articles last), then the text about the shop with Read more |
| Card | `ArgonCard.vue` + `argon-buy.ts`, used everywhere: a white card, the photo with Deal / New / Best seller badges (from the deal and the shop's own tags) and a heart, two-line name, price ("From $X" for capacity products), red "Save $X" and "Was", the deal clock line, swatches or capacity chips, a full-width green Add to cart that turns into "− n +", "Choose options" for capacity products (the quick-buy sheet), Compare. In the results grid the heart is a square button beside Add to cart |
| Results page | `ArgonListTop.vue` (crumbs, "Results for '…' in…", the big title) and `ArgonFilterBar.vue`: a row of dropdowns (Sort by, Category, Price, Brands, Colour, the category's spec filters, On sale) and "All filters" (a side sheet with every filter and Show results), the result count; four cards to a row, two on a phone; no side column |
| Product page | two columns on a grey ground (`ArgonProductOverview.vue`): a white gallery card (Argon's arrows, "1/8" counter and zoom over Selldone's slideshow; the thumbnails in one row) with About this product, Specifications, Delivery and returns, and Reviews under it; on the right, stacked white cards that stay in view: name, product code, price, Save/Was and the deal clock blocks; "Colour: <name>" tiles; quantity menu and a big green Add to cart, Add to wishlist, Compare; "Complete your purchase with…" (`ArgonComplete.vue`). Then "Customers also viewed" and "More in <category>" |
| Photos | the owner's category photos (`assets/argon/<shape>-<category>.webp`) where they fit; 17 other slots (`components/argon/argon-photos.ts`) draw a named placeholder until `assets/photos/<file>.webp` exists (`ArgonSlot.vue`) |
| Account | design A, "desk" (`release.sh <v> desk`) |
| Words | "cart" everywhere |

## Data rules

- **One catalogue read** (`argon.ts` `catalogue()`), shared by the home, header, cards and "Complete your purchase".
- **Tags are found, not named** (`tagged()`); `tagIndex` gives every card its badges. `best-seller` feeds Best sellers and Popular, `new-arrival` New arrivals, every other tag a "Trending now" card. A tag with no products shows nothing.
- **Deal clocks count to the deal's own end** (`dealEnd`, one shared ticker); the header strip, the home strip and the deals page name the earliest real end date of the running deals (`dealsEndDate`); without one they say "Today's deals across the store".
- **No product counts in shopper words** (a result count on a results page only).
- **Theme is a showcase feature**; a merchant's theme is the settings file.
- **Rings inside the box**; focus rings too.
- **No vendor UI.**

## Releases

- **1.0.0 (10 November 2026):** the first Argon (see the table above), with three fixes the owner asked for while it was being built:
  - **Images stay in their boxes.** In "Complete your purchase with…" the cameras ran past their boxes onto the names. Each picture now sits in its own square box (`overflow: hidden`, the image absolutely inside with 10px of padding, `object-fit: contain`) and the name starts 6px under it. The rule for the whole Layout is checked by `scripts/box-check.cjs` (below).
  - **Icon rows share one left edge.** Pickup, Delivery and Selldone's stock nudge ("Almost out of stock…", drawn by `SProductSectionIncentivise` with an emoji, its own padding and size) did not line up. The nudge is now read from Selldone's component (hidden) and drawn as a row of the same list; every stacked icon + words row (the delivery list, the phone menu's links, the Shop menu's side links) is a grid of a 24px icon box, a 10px gap and the words, which wrap under the words. The contact page's sample note sits on the cards' icon edge.
  - **The results grid's loading motion** (in place of Vuetify's thin line sliding over the cards): see "Listing motion" below.
  - Deploy 476, release `01M728583NVR9T1VKBZNMHKQBK` (js and css match), pinned on argon.selldone.shop only (domain 1241, private, exact version); the live page's saved block names argon-electronics 1.0.0. The domain's loading screen shows the red "argon" tile with three green dots (`selldone_domain_loading_update`, custom).

## Notes for the kits

### Listing motion (reusable)

Files: `components/kalio/listing-motion.ts` and `style/listing-motion.scss`, both Layout-neutral.

1. Copy both files. `@use "listing-motion";` in `storefront.scss` (before the Layout's own styles).
2. In the page that shows `SProductsListing` (`pages/products/StorefrontPageProducts.vue`):
   - `import { listingMotion } from "…/kalio/listing-motion";` and `data: () => ({ lm: listingMotion() })`;
   - on the listing: `:class="[…, lm.gridClass()]"` and `@lm-state="lm.onState"`;
   - under the filter row: `<div class="lm-anchor"><transition name="lm-pill"><div v-if="lm.updating" class="lm-pill" role="status" aria-live="polite"><i class="lm-spin"></i>Updating results…</div></transition></div>`;
   - after the listing: `<div v-if="lm.first || lm.loadingMore" class="lm-skels" aria-hidden="true"><div v-for="n in lm.first ? 8 : 4" :key="n" class="lm-skel"><i class="-img"></i><i class="-t1"></i><i class="-t2"></i><i class="-p"></i><i class="-b"></i></div></div>`;
   - the result count: `<transition name="lm-fade" mode="out-in"><p :key="total">…</p></transition>`.
3. Set five colours on the page's wrapper: `--lm-accent` (the pill's words, the brand colour as words), `--lm-surface`, `--lm-well`, `--lm-shine` (a light band in light mode, a faint one in dark) and `--lm-line`.

What it does: the .ts adds to Selldone's `SProductsListing`, once, a note in `fetchData()` of whether a request is a "more" page and a watcher on `busy_fetch` that emits `lm-state`; nothing in `modules/` changes. While a request runs on shown cards they stay in place, dimmed to .45 (150ms) and not clickable, and the pill slides in 6px and fades in (absolute, so nothing moves). New cards fade up 8px over 220ms, 25ms apart, the stagger capped at the first 12 (a CSS animation runs once when a card is inserted, so cards already shown keep still). The first load shows eight skeleton cards in the card's shape with a shimmer; "load more" shows four at the end in place of the button. Selldone's progress line is hidden. With `prefers-reduced-motion` only the dim and the pill remain.

### Box check

`node scripts/box-check.cjs <base> "<home selector>"` (PAGES, WIDTHS, STORAGE, SHOP, CART like the kit's tools). On every page and in the opened states (the Shop menu, the phone menu, quick-buy, the cart drawer and the cart page with a cart filled in the local store only), at 1440 and 390, it reports SPILL (an image past the nearest box that draws something and does not clip), OVERLAP (an image over words that are not a positioned overlay, in the same layer) and ALIGN (a vertical list of icon + words rows whose icons do not share one left edge, ±1px). Deliver at TOTAL 0.
