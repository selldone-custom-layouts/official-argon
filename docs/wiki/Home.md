# Argon Electronics

![Argon Electronics on desktop and phone](https://raw.githubusercontent.com/selldone-custom-layouts/official-argon/main/docs/screenshots/cover.jpg)

**Argon Electronics** is a custom storefront **Layout** for Selldone shops: a single-shop electronics store dressed as a bright, busy, friendly catalogue retailer. A red logo tile and a wide search; a category carousel of packshot tiles; dark promo cards and offer pills; a green deal strip with the deals' real end date; photo cards, rails and trending tags; green Add to cart buttons on every card; a results page with a row of filter dropdowns; a two-column product page with stacked buy cards; a side-by-side compare page; a receipt-first cart and a desk-style account.

It runs on **[argon.selldone.shop](https://argon.selldone.shop)**, one address of the Selldone shop Digini: one shop, one Layout per domain (see [Go Live](Go-Live)). It is built on the official [selldone/storefront](https://github.com/selldone/storefront), so Selldone's cart, checkout, payments and orders keep working underneath a new design.

## Start here

| I want to… | Page |
| --- | --- |
| Have an AI agent set it up on my shop | **[Install with AI](Install-with-AI)** |
| Set it up myself | [Manual Setup](Manual-Setup) |
| Know what my shop's data needs | [Shop Requirements](Shop-Requirements) |
| Build, upload and verify a release | [Build and Upload](Build-and-Upload) |
| Put it live on my shop and domain | [Go Live](Go-Live) |
| Change the name, photos, sections, pages | [Customize](Customize) |
| Change the colours, light or dark, the visitor switcher | [Theme and colours](Theme-and-colours) |
| Fix a problem | [Troubleshooting](Troubleshooting) |

## How a Selldone Layout works (one minute)

1. A **Layout** is a complete storefront app (Vue 3) that runs on Selldone's own servers instead of the default storefront.
2. You build it, zip it, and **upload** it to your Selldone developer account with the official [selldone-cli](https://github.com/selldone/cli). Each upload is a new **version**.
3. You **attach** a version to your shop, or to one domain of it.
4. Selldone injects **your** shop into the Layout: its products, categories, prices, tags, languages and settings. Nothing about Digini is hard-coded: only the brand name (one line) and the photos (category photos matched by slug, and named photo slots).

## The look

| Part | Argon |
| --- | --- |
| Brand colour | red `#c8102e`: the logo tile, links, accents, the deal badge |
| Buy colour | green `#007a3d`: every Add to cart, Checkout and chosen state |
| Quick links | near-black `#1a1a1a` pills |
| Grounds | a white page, light-grey `#f2f2f2` sections |
| Type and icons | Barlow, Material Symbols Rounded |
| Buttons | flat; hover changes the colour only; no line under any word or icon; selection rings inside the box |
| Theme | five palettes, a custom colour and Light / Dark; a visitor switcher on Argon's showcase shop only (see [Theme and colours](Theme-and-colours)) |

## What you get

- **Header:** a utility row (Track order, Returns, Help); the red logo tile; "Shop" (a mega menu of every category with its picture) and "Trending" (the live tags) dropdowns, Deals; a wide grey search with a dark Search button and suggestions; Account, Wishlist, Theme and Cart with a count bubble; a strip of three links (the deals' real end date, Compare up to 4, Track any order). On a phone: a menu button that opens a side panel, the search across the screen, and one benefit line that changes.
- **Home:** the category carousel (a "Today's deals" tile, then every category with its packshot), three dark promo cards and "<Category> offers" pills, a green "Deal prices locked until <date>" strip, Shop the latest tech, a wide "Up to X% off <Category>" banner, Popular products, a dark red compare band, Trending now, Explore our brands, There's even more, More deals, Need a hand?, the four newest guides, and a short text about the shop.
- **Cards:** a white card with Deal, New and Best seller badges and a heart, a two-line name, the price, a red "Save $X" and "Was", the deal's clock, swatches or capacity chips, a green Add to cart that turns into "− n +" in place, "Choose options" for a quick-buy sheet, Compare.
- **Results pages:** crumbs and a big title, a row of filter dropdowns (Sort by, Category, Price, Brands, Colour, spec filters, On sale) and an All filters side sheet, the result count, four cards to a row.
- **Product page:** a gallery card with About this product, Specifications, Delivery and returns and Reviews under it; stacked buy cards on the right that stay in view (price, deal clock, colour tiles, quantity, Add to cart, wishlist, Compare, Complete your purchase with…); then Customers also viewed and More in <category>.
- **Compare:** the picks pinned on top, the specs side by side with differences marked.
- **Cart and checkout:** a receipt-first drawer, the cart page, a map-first address sheet, delivery choices and the payment window.
- **Orders and account:** the receipt, delivery and messages; the account as a desk with a side menu.
- **Content pages:** guides, article, About, Terms, Privacy, Contact, FAQ and a designed 404.

## Links

- Live shop: <https://argon.selldone.shop>
- Repository: <https://github.com/selldone-custom-layouts/official-argon>
- What Argon is and its data rules: [`ARGON.md`](https://github.com/selldone-custom-layouts/official-argon/blob/main/ARGON.md); shared behaviours: [`KALIO.md`](https://github.com/selldone-custom-layouts/official-argon/blob/main/KALIO.md)
- All official custom Layouts: <https://github.com/selldone-custom-layouts>
- Selldone: <https://selldone.com>
