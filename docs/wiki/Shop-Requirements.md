# Shop Requirements

The Layout reads everything from your shop. Nothing about Digini is hard-coded. Here is what your shop's data needs so that each part looks as it does on [besti.selldone.shop](https://besti.selldone.shop).

## Settings (yours to choose)

| Setting | What to set | What the Layout does |
| --- | --- | --- |
| **Business model** | A normal shop | Besti shows no seller names, seller pages or seller sections. |
| **Payment methods** | At least one, for your currency | Without one, the cart says the shop is not taking payments yet, and Pay does not open an empty window. |
| **Shipping methods / pickup points** | What you offer | The product page lists them; "Delivery method" in the cart appears only when there is a choice. |
| **Checkout / sign-in** | Guest checkout on or off | With it off, "Add to cart" asks a guest to sign in first, as Selldone's own button does. |
| **Home of the domain** | The shop page | The designed home is the shop page. A Page Builder page set as Home replaces it on `/`. |

## Categories (departments)

- Each **top-level category is a department**: a tile in "Shop by department", a name in the blue bar, a slide or tile when it has a photo, its own page.
- Give each one an **icon** (a product cut-out on transparent ground) and a short **description** (it shows on the hero card and the department page).
- Order them in Selldone; the Layout keeps your order.
- **Photos (optional):** put `wide-`, `portrait-` or `square-<slug>.webp` in `assets/besti/` (see [Customize](Customize)). Without a photo a department gets a collage of its own products.

## Products

- A square **photo** on white; more photos for the gallery.
- A **brand** (it makes "Shop by brand" and the brand filter).
- **Variants:** colour variants show as swatches on the card and as tiles on the product page; capacity, size or pack variants as chips with their own price. A variant photo replaces the main photo when that variant is picked.
- A **discount** (with or without dates) makes the yellow "% off" flag, the red "Save $X" and "Was $Y", and puts the product among the deals. The Deal of the Day is one of the biggest savings, a new one each day.

## Specs and filters

The department page's filters come from **product specs** and the category's **filter list**:
- Write specs **flat**: `{"Group": "group", "Key": ["value"]}` with `spec_order`. Nested specs are ignored by Selldone.
- After changing specs, save the category's filter list again (its values are frozen when saved).
- Price, brand, colour and capacity filters come for free.

## Tags (merchandising rows)

- `best-seller` → the Best sellers block (one big card and two rows beside it).
- `new-arrival` → New arrivals (else the newest products).
- **Any other tag** → its own row titled "<Tag> Items". A tag with no products shows nothing.

## Content

- **Blog posts** (the four newest show as "Tips and guides", last on the home).
- **About us, Terms, Privacy, Contact us** profiles. Until you write them, sample text shows under a clear "Sample text" note.
- **FAQ** entries.

## Checklist

- [ ] Categories have icons and descriptions
- [ ] Products have photos, brands and variants
- [ ] Specs are flat and categories' filter lists are saved
- [ ] At least one payment method and one shipping method
- [ ] Tags for best sellers and new arrivals
- [ ] The domain's Home is the shop page
