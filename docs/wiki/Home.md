# Molino Market Hall

![Molino Market Hall on desktop and phone](https://raw.githubusercontent.com/selldone-custom-layouts/official-molino/main/docs/screenshots/cover.jpg)

**Molino Market Hall** is a custom storefront **Layout** for Selldone shops: a multi-vendor grocery marketplace in the spirit of Amazon Fresh. It is the storefront of the live shop **[molino.selldone.shop](https://molino.selldone.shop)**. It is built on the official [selldone/storefront](https://github.com/selldone/storefront), so Selldone's basket, checkout, payments, vendor offers and orders keep working underneath a completely new design.

## Start here

| I want to… | Page |
| --- | --- |
| Have an AI agent set it up on my shop | **[Install with AI](Install-with-AI)** |
| Set it up myself | [Manual Setup](Manual-Setup) |
| Know what my shop's data needs | [Shop Requirements](Shop-Requirements) |
| Build, upload and verify a release | [Build and Upload](Build-and-Upload) |
| Put it live on my shop and domain | [Go Live](Go-Live) |
| Change colours, fonts, sections, pages | [Customize](Customize) |
| Fix a problem | [Troubleshooting](Troubleshooting) |

## How a Selldone Layout works (one minute)

1. A **Layout** is a complete storefront app (Vue 3) that runs on Selldone's own servers instead of the default storefront.
2. You build it, zip it, and **upload** it to your Selldone developer account with the official [selldone-cli](https://github.com/selldone/cli). Each upload is a new **version**.
3. You **attach** a version to your shop: shop dashboard › Domains › Default layout › Change layout. Every domain of the shop can inherit it.
4. Selldone injects **your** shop into the Layout: its products, categories, sellers, prices, theme, languages and settings. Nothing about molino is hard-coded.

## What you get

- **Home:** a deals banner, two rows of aisles, a row of best sellers for every aisle, an aisle mosaic, seller cards and a market shelf.
- **Cards:** "Add to basket" turns into "− n in basket +" in place, "See options" for products with sizes, and the seller is named on every card.
- **Shop pages:** a compact aisle head, quiet filters built from product specs, one sort menu.
- **Product page:** gallery, details and a sticky buy box with every seller's offer.
- **Seller storefronts.**
- **Basket and checkout:** a receipt-style basket drawer and page, a map-first address sheet and delivery choices.
- **Orders:** the receipt, delivery, the trip and chat.
- **Buyer account:** in two designs.
- **Content pages:** journal, article, About, Terms and Privacy.

## Links

- Live shop: <https://molino.selldone.shop>
- Repository: <https://github.com/selldone-custom-layouts/official-molino>
- Design notes and release log: [`KALIO.md`](https://github.com/selldone-custom-layouts/official-molino/blob/main/KALIO.md)
- All official custom Layouts: <https://github.com/selldone-custom-layouts>
- Selldone: <https://selldone.com>
