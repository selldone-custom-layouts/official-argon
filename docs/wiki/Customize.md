# Customize

Besti's design lives in its own components and style sheets. Selldone's commerce logic underneath (cart, bill, checkout, variants, orders) stays untouched.

## The name, in one line

`components/kalio/kalio-brand.ts`: `BRAND.name = "Besti"`. The wordmark (`components/besti/BestiLogo.vue`) draws it in lower case with a yellow square for every "i" dot; the page titles, footer and messages follow. Set it to `null` to use your shop's own title. The tab icon is `assets/brand/besti-mark.svg`.

## Colours and type

| What | Where |
| --- | --- |
| Blue for every button, yellow accent, sale red, navy, Archivo | `style/besti.scss` (top), `style/kalio-tokens.scss` (`--k-green` is the action colour, `--k-coral` the saving) |
| Fonts (Archivo, Material Symbols Rounded) | `components/kalio/kalio-fonts.ts` |
| Vuetify's primary (Selldone's own parts) | `style/kalio-tokens.scss`, `--v-theme-primary` |

## The photos

The department photos are `assets/besti/<shape>-<category slug>.webp`, where shape is `wide` (16:9, a quiet left third for words: hero slides, the wide banner), `portrait` (4:5: the hero's side tiles, About) or `square` (Everyday essentials). The slug is the category's `name` in Selldone. A category without a photo gets a collage of its own products, so the Layout is complete with no photos at all. Keep the total file count of a release under about 360.

## Where things are

| Area | Files |
| --- | --- |
| Header (deal strip, search, cart pill, department bar, mega menu) | `components/besti/shell/BestiHeader.vue` |
| Footer (newsletter band, columns, legal row) | `components/besti/shell/BestiFooter.vue` |
| Home | `components/besti/BestiHome.vue`, `BestiDealOfDay.vue`, `BestiRail.vue`, `BestiPhoto.vue`, `besti.ts` |
| Product card (everywhere, also inside Selldone's catalogue grid) | `components/besti/BestiCard.vue`, `besti-buy.ts`, `components/kalio/kalio-card-basket.ts` |
| Shop, category, search, deals (filters, sort, top) | `pages/products/StorefrontPageProducts.vue`, `components/walio/shop/` |
| Product page | `pages/product/StorefrontPageProduct.vue`, `components/besti/product/` |
| Quick-buy sheet | `components/kalio/KalioQuickBuy.vue` (Besti's overview inside) |
| Compare | `components/kalio/compare/`, `style/kalio-compare.scss` |
| Cart drawer, cart page, address sheet, payment window | `components/kalio/shell/KalioBasketDrawer.vue`, `pages/basket/cart/`, `components/kalio/checkout/`, `style/kalio-checkout.scss` |
| Order page | `pages/basket/order/`, `components/kalio/order/` |
| Account ("desk") | `components/kalio/account/`, `style/kalio-account.scss` |
| Content pages, 404 | `pages/official/`, `pages/blog/`, `pages/faq/`, `pages/errors/404/` |
| Every page's Besti dress | `style/besti.scss`, `style/besti-pages.scss` (loaded last) |

## Rules the design keeps

- **Re-skin, don't replace.** Keep Selldone's scripts for the cart, bill, checkout, variants and orders; change templates and styles.
- **One blue for every button, white words, flat; hover changes the colour only.** No line under any word or icon, except links inside an article's text.
- **Nothing is named in code.** Categories, tags, brands, prices and deals come from the shop. A tag becomes its own "<Tag> Items" row on the home; a tag with no products shows nothing.
- **No pop-ups.** "Add to cart" turns into "− n +" in place; there is no "Added" toast and no phone bottom bar.
- **Category grids never leave a hole:** two rows of the same length (an "All departments" tile fills an odd count).
