# Tario — Selldone Layout

**Tario Market** (package `tario-market`) is the second Layout of the Selldone shop **molino** (shop 15645). It started on 7 November 2026 as a copy of Molino Market Hall (`kalio-market-hall`, layout 23, release 0.2.30) and was re-dressed in a red, big-box style. The owner asked for "a new one like Target's site, with the same red theme… checkout built right", named tario, on `tario.selldone.shop`.

Every behaviour of Molino is kept, because the owner asked for each of them:

- "Add to basket" turns into "− n in basket +" in place, and "See options" shows for products with sizes;
- no "Added to basket" pop-up and no phone bottom bar;
- the two-step, map-first address sheet, with suggestions while typing;
- the receipt that follows Selldone's bill, and Pay leading to whatever is missing;
- the reviews (design A), the buyer account (design A, "desk") and the content pages.

[`KALIO.md`](KALIO.md) explains every one of them and every Selldone workaround. Read it before changing anything.

## What makes it Tario

| Area | Molino | Tario |
| --- | --- | --- |
| Action colour | deep green `#155b42` | red `#cc0000` (the token is still called `--k-green`) |
| Savings | coral | the same red |
| Type | Fraunces headings, DM Sans | Inter for everything; headings 800, tight |
| Corners | 20 px cards | 12 px cards, 8 px small |
| Header | white, aisle words in grey | a 4 px red rule on top; the wordmark with a round red mark; a **red aisle bar** with white words |
| Product pictures | each aisle's pastel tint | one light-grey well (`--k-well`); aisle rings and the mosaic keep their colours |
| Footer | deep green | charcoal `#1b1b1b`, red headings |
| Stars | amber | near-black |
| Checkout | "Your details" eyebrow | numbered steps: **1 Review your items**, **2 Delivery & contact**, **3 Order summary** (white card, red Place button, grey when something is missing) |

- The token values are in `style/kalio-tokens.scss`.
- The structural differences are in `style/tario-skin.scss`, loaded last.
- The step headings are in `pages/basket/cart/StorefrontPageBasketCart.vue` (`.t-step`).
- Every green literal of Molino's stylesheets was mapped to a red or a grey.

## The same shop, two Layouts

- molino's **default** Layout stays Molino Market Hall (23) on `molino.selldone.shop`, `molino.myselldone.com` and every domain that inherits.
- **`tario.selldone.shop` alone** carries Tario: its domain Layout is set to `mode: private` with Tario's layout id and exact version (`api.shops.domains.layout.set`), **not inherit**.
- When releasing Tario, never pin the shop default: that would put Tario on molino's own address.
- Check both addresses after every release: each `window.sdShopLayout` "saved" block must name its own package.
- The shop's name and logo come from its data, so Tario's header says "molino". Nothing is hard-coded.
- Guest baskets and sign-ins are per domain.

## Releases

- **1.0.0 (7 November 2026):** the first Tario. It was checked on the dev server with:
  - `cardcheck.cjs` on phone, tablet and computer (everything passed except the old test's expectation that Compare is green);
  - `reviewscheck.cjs` on phone, tablet and computer;
  - `buyer2.cjs` on computer (the phone run of that older script stops at the address form, which is now behind the map step; `cardcheck.cjs` covers the two steps);
  - `qasweep.cjs`.
