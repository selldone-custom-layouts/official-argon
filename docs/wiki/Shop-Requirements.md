# Shop Requirements

The Layout reads everything from your shop. Nothing about Digini is hard-coded. Here is what your shop's data needs so that each part looks as it does on [argon.selldone.shop](https://argon.selldone.shop). A section with no data folds away; it never shows an empty box.

## Settings (yours to choose)

| Setting | What to set | What the Layout does |
| --- | --- | --- |
| **OAuth client id** | Set it up for your shop first | Sign in opens your shop's own sign-in. Without it, Sign in leaves for Selldone and shows an error. |
| **Business model** | A normal shop | Argon shows no seller names, seller pages or seller sections. |
| **Guest checkout** | Your choice | When guests may buy, "Add to cart" works signed out; otherwise it asks the shopper to sign in first, as Selldone's own button does. |
| **Payment methods** | At least one, for your currency | Without one, the cart says the shop is not taking payments yet, and Pay does not open an empty window. |
| **Shipping methods / pickup points** | What you offer | The product page's Delivery and returns card lists them; "Delivery method" in the cart appears only when there is a choice. |
| **Login modes** | Your choice | The sign-in window follows them. |
| **Currency, country, language** | Your market | Prices, the address form, the language and currency pickers in the footer. |
| **Home of the domain** | The shop page | The designed home is the shop page. A Page Builder page set as Home replaces it on `/`. |

## Categories

- Each **top-level category** is a tile in the home's category carousel, an entry in the header's "Shop" mega menu and the phone menu, and its own results page.
- Give each one an **icon**: a product cut-out (packshot) on a transparent ground. It sits on the grey carousel tile and in the mega menu.
- A short **description** shows under the title on the category's results page.
- Order them in Selldone; the Layout keeps your order.
- **"<Category> offers" pills** are the four categories with the most deals.
- **"Shop the latest tech"** shows four categories, those with a photo first, then those with the most new arrivals. It needs at least four categories with products.
- **The wide banner** ("Up to X% off <Category>") is the category with the biggest saving, a category with a wide photo first.
- **Photos (optional):** `wide-`, `portrait-` or `square-<slug>.webp` in `assets/argon/` (see [Customize](Customize#category-photos)). Without a photo a category gets a collage of its own products.

## Products

- A square **photo** on white; more photos for the gallery.
- A **brand**. It makes the Brands filter and "Explore our brands" (the four brands with the most products; the block shows from four brands on).
- **Variants:** colour variants show as swatches on the card and as "Colour: <name>" tiles on the product page; capacity, size or pack variants as chips with their own price, and the card says "From $X" and "Choose options". A variant photo replaces the main photo when that variant is picked.
- A **product code** (SKU) shows on the product page.
- A **discount** makes the Deal badge, the red "Save $X" and "Was $Y", and puts the product in Today's deals, Popular products and More deals.
- **Discount dates:** a deal with an end date gets a clock on the card and the product page, counting to that date. The header strip, the green home strip and the deals page name the earliest real end date of the running deals ("Deal prices locked until <date>"). With no end dates they say "Today's deals across the store". No date is ever invented.

## Specs and filters

The results page's dropdowns and the All filters sheet come from **product specs** and the category's **filter list**:

- Write specs **flat**: `{"Group": "group", "Key": ["value"]}` with `spec_order`. Nested specs are ignored by Selldone.
- After changing specs, save the category's filter list again (its values are frozen when saved).
- Sort by, Category, Price, Brands, Colour and On sale come for free.
- The product page's Specifications card shows the same specs in your groups.

## Tags (merchandising)

Tags are found from your products, never named in code. A tag with no products shows nothing; a new tag on any product shows up without a code change.

- `best-seller` → the Best seller badge, the "Best sellers" promo card, and first place in Popular products.
- `new-arrival` → the New badge and the "New arrivals" promo card (else the newest products).
- **Any other tag** → the header's "Trending" dropdown and a card in "Trending now" (the four most used tags). Each card has its own photo slot, `trend-<tag>.webp` (see [Customize](Customize#the-photos)).

## Content

- **Blog posts:** the four newest show as "Tips and guides", last on the home.
- **The shop's description:** the "About <shop>" text at the end of the home, with Read more.
- **About us, Terms, Privacy, Contact us** profiles. Until you write them, sample text shows under a clear "Sample text" note.
- **FAQ** entries (the header's Help, "Need a hand?" and the footer link there).
- **Social links:** shown in the footer beside the sign-up.

## Checklist

- [ ] The shop's OAuth client id is set up
- [ ] Categories have icons (packshots) and descriptions
- [ ] Products have photos, brands, SKUs and variants
- [ ] Some products have discounts, with end dates where the deal really ends
- [ ] Specs are flat and categories' filter lists are saved
- [ ] At least one payment method and one shipping method
- [ ] Tags for best sellers and new arrivals, and any others you want trending
- [ ] The domain's Home is the shop page
