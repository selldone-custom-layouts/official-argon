# Besti — Selldone Layout

**Besti Electronics** (package `besti-electronics`, Layout **29**) is a Layout of the Selldone shop **Digini** (shop 15549, xapi name `digini-hzgablru`), an electronics store with one seller. It was made on 8–9 November 2026 from the owner's approved **Home B "Department store"** mockup (`../digini-design/home-b.html`) and runs only on **besti.selldone.shop** (domain 1240, whose Home is set to the shop page). The shop's other address, digito.selldone.shop, carries a different Layout (Digito, design A). It started from Walio Market 1.1.10, which itself came from Molino Market Hall.

Every Kalio behaviour is kept ([`KALIO.md`](KALIO.md)): counts that change at once and never lose a quick tap, no "Added" toasts and no phone bottom bar, the two-step map-first address sheet, the honest receipt, the guest order code fix, the compare page, the desk account. Besti adds its own dress and removes every marketplace surface.

## What makes it Besti

| Area | Besti |
| --- | --- |
| Brand | "besti", heavy navy ink, every "i" dot a small yellow square (`BestiLogo.vue`); the one line is `BRAND.name` in `kalio-brand.ts`; the mark is `assets/brand/besti-mark.svg` |
| Colours | blue `#0a4bd8` for every button (white words, flat, hover = colour only); yellow `#ffd91a` only as an accent; sale red `#c4122f`; navy `#071634`; page white; tiles bordered `#e1e5eb`, radius 10 |
| Type and icons | Archivo; Material Symbols Rounded for Besti's own icons (Selldone's parts keep Material Icons) |
| Header | navy Deal of the Day strip ("Next deal in", to local midnight: the shop's discounts have no end date), white bar with scoped search and suggestions, blue cart pill with count and total, blue department bar with a click-to-open mega menu, More, Deals (yellow), New arrivals, Brands |
| Home | `BestiHome.vue`: hero (wide photos by department, two portrait tiles), Shop by department (two even rows), Deal of the Day, Top deals with tabs, Everyday essentials, Best sellers (tag), wide banner, New arrivals, brands, "<Tag> Items" rows, Recently viewed, Tips and guides |
| Card | `BestiCard.vue` + `besti-buy.ts`, used everywhere; in Selldone's catalogue grid it is drawn inside Selldone's card (`kalio-card-basket.ts`) |
| Product page | three columns (`BestiProductOverview.vue`), Specifications in groups, Reviews, Bought together (`BestiTogether.vue`), Related, More in the department |
| Account | design A, "desk" (`release.sh <v> desk`) |
| Words | "cart" everywhere |

## Data rules

- **One catalogue read.** `products/list` answers the whole catalogue with brands, specs and variants with ids (`besti.ts` `catalogue()`); the home, header, cards and "bought together" share it.
- **Tags are found, not named.** Selldone has no "list the tags" call, but a product found by a tag comes back with all its tags, so a few seed words find the rest (`tagged()`). `best-seller` makes the bento, `new-arrival` the New arrivals row, any other tag its own "<Tag> Items" row, and a tag with no products shows nothing.
- **Photos by slug.** `assets/besti/<wide|portrait|square>-<category name>.webp`; a category without one gets a collage of its products (`BestiPhoto.vue`).
- **Category grids never leave a hole** (the owner's rule of 9 November 2026): ≥16 categories show 15 and "All departments"; an odd count adds the tile; columns = tiles ÷ 2 (`catTiles()`).
- **No vendor UI.** The cart drawer names a line's colour or size, never a seller; Selldone's vendor surfaces are not mounted.

## Releases

- **1.0.4 (9 November 2026):** Top deals always in whole rows, never a hole: as many full rows as a department's deals fill (five to a row on a computer, four on a laptop, three on a tablet, two on a phone), a department with fewer than one row keeping its one short row (the owner's no-hole rule of 9 November 2026, applied beyond the category tiles). Deploy 423, release `01M6YX29DG099W7BB46M7Z4TSJ`, pinned on besti.selldone.shop.
- **1.0.3 (9 November 2026):** Selldone's own English strings say "cart" (`cartWords()` in `kalio-brand.ts`: the buy button, the share-order dialog, "others have this in their carts"); a phone card keeps the full "Add to cart" (container query at 128 px); the reviews summary as a bordered card; the grocery home, header, footer and seller components nothing used any more are removed. Deploy 421, release `01M6YWN5CCY1KRB6GSJBWZ50BN`, pinned on besti.selldone.shop.
- **1.0.2 (9 November 2026):** catalogue cards stretch to equal heights in a row; no line under anything inside a link or button on any inherited page (the guides list underlined its titles on hover), while buttons inside an article's text lose the article's link line; "Home" as the first crumb everywhere; a calm card for an empty FAQ and Besti's heading size there; the guides page speaks of guides (navy head, "Shop the guide", its shopping list from the catalogue, "Add all" putting a colour product in with its first colour in stock); brand links open the catalogue with Selldone's brand filter (the page is titled with the brand); the map pin is Besti blue with a yellow centre. Deploy 419, release `01M6YVYHAZCRQEZ4HB7FZ0249R`, pinned on besti.selldone.shop.
- **1.0.1 (9 November 2026):** the 404 inside the Layout (header, search, footer); Contact us designed (a form with Selldone's own contact call, sample cards under a "Sample text" note until the shop writes its page, no red "Store profile not found"); one Besti breadcrumb on About, Terms, Privacy and Contact; "Often added" from the catalogue (other departments first, a colour product with its first colour in stock); a cart line names its colour; the compare page without a price per kg and with Besti's blue buttons; the order kinds say "Products", not "Groceries"; the tablet portrait home three cards to a row; the mega menu's text starts at the line's start. Deploy 417, release `01M6YTZDDRSR1RK59VTDZWZXVA`, pinned on besti.selldone.shop.
- **1.0.0 (9 November 2026):** the first Besti. Uploaded as deploy 416 (release `01M6YSXN6ZBPHRSPQTG07JNRBE`), pinned on besti.selldone.shop only; the domain's Home set to the shop page. Built while Selldone's storefront `/info` answered 500 "Update in progress" platform-wide, so it was checked on the dev server with a stand-in shop record (every other read live).
