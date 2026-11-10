# Customize

Argon's design lives in its own components and style sheets. Selldone's commerce logic underneath (cart, bill, checkout, variants, orders) stays untouched. After any change: build and upload a new version ([Build and Upload](Build-and-Upload)) and put it live ([Go Live](Go-Live)).

## The name, in one line

`components/kalio/kalio-brand.ts`: `BRAND.name = "Argon"`. The logo (`components/argon/ArgonLogo.vue`) draws it in lower case, white on a red rounded tile; the page titles, footer and messages follow. Set it to `null` to use your shop's own title.

The mark, `assets/brand/argon-mark.svg` (a white "a" on the red tile, 64×64), is the tab icon and the avatar on order messages. Replace the file to use your own.

## Colours, light or dark

One file: `components/argon/argon-theme.settings.ts`. See [Theme and colours](Theme-and-colours). Do not edit the palettes in `components/argon/argon-theme.ts` or the tokens in `style/argon-theme.scss` for a merchant's theme.

## Type and icons

| What | Where |
| --- | --- |
| Fonts (Barlow, Material Symbols Rounded) | `components/kalio/kalio-fonts.ts` |
| Colour tokens (red brand, green buy, near-black pills, grey grounds, sale red) | `style/argon-theme.scss` |

## The photos

Argon has two kinds of photo. Both are plain files: drop them in, build, release. No code change.

### Photo slots

17 photo slots are registered in `components/argon/argon-photos.ts`: nine fixed ones, four for the tags in Trending now and four for the brands in Explore our brands. Each slot looks for `assets/photos/<file>.webp`. Until that file exists, the slot shows a calm grey placeholder of the same shape with the file's name in it, so you can see which file goes where.

| File | Size | Where it shows |
| --- | --- | --- |
| `promo-deals.webp` | 1200×800 (3:2) | Home, the first dark promo card (Today's deals) |
| `promo-new.webp` | 1200×800 (3:2) | Home, the second promo card (New arrivals) |
| `promo-best.webp` | 1200×800 (3:2) | Home, the third promo card (Best sellers) |
| `banner-compare.webp` | 1200×675 (16:9) | Home, the right side of the dark red compare band |
| `trend-<tag>.webp` | 1200×800 (3:2) | Home, Trending now: one per tag shown (four) |
| `brand-<brand>.webp` | 1000×1000 (1:1) | Home, Explore our brands: one per brand shown (four) |
| `service-track.webp` | 1000×1000 (1:1) | Home, There's even more: Track an order |
| `service-compare.webp` | 1000×1000 (1:1) | Home, There's even more: Compare products |
| `service-help.webp` | 1000×1000 (1:1) | Home, There's even more: Help & FAQ |
| `service-contact.webp` | 1000×1000 (1:1) | Home, There's even more: Contact us |
| `help-desk.webp` | 1200×800 (3:2) | Home, the Need a hand? block |

The `trend-` and `brand-` names follow your live data: the tag or brand in lower case, with spaces and signs as `-` ("4K" → `trend-4k.webp`). A new tag or brand shows a placeholder with its own file name until you add that file.

To add or replace photos:

1. Make WebP files at the sizes above (quality about 82). Keep the subject inside the frame with some room at the edges; each photo is cropped slightly to fill its slot. No text or logos in the photos.
2. Put them in `assets/photos/` with exactly those names. To replace one, overwrite the file.
3. Build and release a new version. The slots pick the files up at build time.

The photo prompts used for Argon's showcase shop are kept in the owner's design folder (`digini-design/codex-photos-argon.md`, not in this repository). They are a good starting point for your own.

### Category photos

The category photos are `assets/argon/<shape>-<category slug>.webp`. The slug is the category's `name` in Selldone.

| Shape | Ratio | Where it shows |
| --- | --- | --- |
| `wide` | 16:9, a quiet left third for words | the "Up to X% off <Category>" banner; also the photo cards when there is no other shape |
| `square` | 1:1 | the "Shop the latest tech" photo cards (first choice) |
| `portrait` | 4:5 | the About page; the photo cards when there is no square one |

A category without a photo gets a collage of its own products, so the Layout is complete with no photos at all. An optional smaller copy, `<shape>-<slug>-800.webp`, is used on small screens. Add, replace or remove files the same way: drop them in `assets/argon/`, build, release.

Keep the total file count of a release under about 360 (Selldone's upload limit). The photos above fit.

## Where things are

| Area | Files |
| --- | --- |
| Header (utility row, logo tile, Shop and Trending dropdowns, search, actions, benefits strip, phone side panel) | `components/argon/shell/ArgonHeader.vue` |
| Footer (columns, sign-up, legal row) | `components/argon/shell/ArgonFooter.vue` |
| Home | `components/argon/ArgonHome.vue`, `ArgonRail.vue`, `ArgonRow.vue`, `ArgonPhoto.vue`, `ArgonSlot.vue`, `argon.ts` |
| Product card (everywhere, also inside Selldone's catalogue grid) | `components/argon/ArgonCard.vue`, `argon-buy.ts`, `ArgonDealClock.vue` |
| Results page (crumbs, title, filter dropdowns, All filters) | `pages/products/StorefrontPageProducts.vue`, `components/argon/shop/ArgonListTop.vue`, `ArgonFilterBar.vue` |
| Product page | `pages/product/StorefrontPageProduct.vue`, `components/argon/product/` (`ArgonProductOverview.vue`, `ArgonComplete.vue`, `argon-spec.ts`) |
| Quick-buy sheet | `components/kalio/KalioQuickBuy.vue` (Argon's overview inside) |
| Compare | `components/kalio/compare/`, `style/kalio-compare.scss` |
| Cart drawer, cart page, address sheet, payment window | `components/kalio/shell/KalioBasketDrawer.vue`, `pages/basket/cart/`, `components/kalio/checkout/`, `style/kalio-checkout.scss` |
| Order page | `pages/basket/order/`, `components/kalio/order/` |
| Account ("desk") | `components/kalio/account/`, `style/kalio-account.scss` |
| Content pages, 404 | `pages/official/`, `pages/blog/`, `pages/faq/`, `pages/errors/404/` |
| Every page's Argon dress | `style/argon.scss`, `style/argon-pages.scss` (loaded last) |

## Rules the design keeps

- **Re-skin, don't replace.** Keep Selldone's scripts for the cart, bill, checkout, variants and orders; change templates and styles.
- **Two colours.** Green for every buy action (Add to cart, Checkout, chosen state), red for the brand (logo tile, links, accents). Every colour is a token.
- **Flat buttons; hover changes the colour only.** No line under any word or icon, except links inside an article's text.
- **Rings inside the box.** Selection and focus rings are drawn inside the element, never as an outline outside it.
- **Nothing is named in code.** Categories, tags, brands, prices and deals come from the shop. A tag with no products shows nothing.
- **Deal clocks are real.** They count to the deal's own end date; no date, no clock.
- **No product counts in shopper words.** Only a results page shows a result count.
- **No pop-ups.** "Add to cart" turns into "− n +" in place; there is no "Added" toast and no phone bottom bar.
