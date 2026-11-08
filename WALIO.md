# Walio — Selldone Layout

**Walio Market** (package `walio-market`) is the third Layout of the Selldone shop **molino** (shop 15645), after Molino Market Hall and Tario Market. It was made on 7 November 2026, when the owner asked for "one like Walmart, named Walio, on walio.selldone.shop". It started from Tario Market 1.0.0, which itself started from Molino Market Hall 0.2.30.

Every behaviour of Molino is kept:
- "Add to basket" turns into "− n in basket +" in place;
- no pop-ups and no phone bottom bar;
- the two-step, map-first address sheet;
- the receipt;
- the reviews (design A) and the buyer account (design A).

Tario's checkout in numbered steps is kept too. [`KALIO.md`](KALIO.md) explains every behaviour and Selldone workaround.

## What makes it Walio

| Area | Walio |
| --- | --- |
| Action colour | blue `#0071dc`, deep `#004f9a` (the token is still `--k-green`) |
| Savings | green `#2a8703` (`--k-coral`) |
| Highlights | spark yellow `#ffc220`: the basket button, the brand's round mark, the hero's saving, the summary step |
| Type | Nunito Sans; headings 800 |
| Header | solid blue, white words, a white search pill, a yellow basket; the aisle bar under it is white with blue Deals |
| Footer | deep navy `#041e42`, yellow headings |
| Stars | gold `#e5a200` |
| Checkout | numbered steps (blue 1 and 2, yellow 3), a white order summary, a blue pill to pay; the "still missing" line in amber |

- The token values are in `style/kalio-tokens.scss`.
- The structure is in `style/walio-skin.scss`, loaded last.
- Tario's red literals were mapped to blues.

## The same shop, three Layouts

| Domain | Layout | How it is set |
| --- | --- | --- |
| molino's default (molino.selldone.shop and the rest) | Molino Market Hall (23) | the shop default |
| `tario.selldone.shop` | Tario Market | the domain's own Layout |
| `walio.selldone.shop` | Walio Market | the domain's own Layout: `api.shops.domains.layout.set`, `mode: private`, Walio's id and exact version |

- Never pin the shop default for Walio.
- After a release, check all three addresses' `window.sdShopLayout` "saved" blocks.
- The shop's name and logo come from its data, so the header says "molino".

## Every page (1.1.0)

Walio started as Tario 1.0.0 in blue. On 7 November 2026 the owner gave Walio the mockups Tario did not take (`kalio-design/tario-options/index.html`: every **B**, and product page **A**, since Tario took product B). The home is in `components/walio/WalioHome.vue`; the rest in `components/walio/shop/`, `components/walio/product/`, `WalioMiniCart.vue` and the pages; styles in `style/walio-home.scss` and `style/walio-pages.scss` (loaded after `walio-skin.scss`). Rows, cards, photos and the filter helpers are shared with Tario (`WalioRow`, `WalioCard`, `WalioPhoto`, `walio-home.ts`, `walio-filters.ts`; their CSS keeps Tario's `t-` classes).

| Page | Design |
| --- | --- |
| Home | B: a split hero (photo + Deals and New tiles), Best saving today (a row of equal cards, the biggest saving first), category tiles, Top picks, Shop the idea (a photo beside four products from the breakfast aisle, Add all), Pickup or delivery panel, Trending in the fresh aisle, the sellers |
| Aisle, search, Deals, All products | B: a banner on the aisle's tint (facts and packshots), a filter column beside the grid (On sale only, price with quick ranges, sizes as buttons, ticks), Sort by; a phone gets a Filters / Sort bar; a search shows its top match |
| Seller | B: the seller's card in the column (numbers, the seller's aisles as a menu), a blue deals banner, a row per aisle, then everything |
| Product | A: thumbnails under the picture, Shop all &lt;brand&gt;, "How do you want it?" tiles, the sellers as cards, free rules under Add to cart, "About this item" in tabs (Details, Specifications, Shipping &amp; returns), reviews, More in &lt;aisle&gt; |
| Cart drawer | B: a small window under the cart button (a phone keeps the drawer) |
| Checkout | B: Cart ✓ — Delivery — Contact — Review &amp; pay over the numbered step cards |
| Sign-in | B: the sign-in as a whole page |
| Account, Orders | B: the account's "home" design (greeting, tabs, overview; orders as a table), built with `scripts/release.sh <v> home` |
| About | B: the story beside three photos, How an order works (from the shop's sellers and delivery methods), values, contact |
| Terms, Privacy | B: four summary cards and folding sections (the shop's own page keeps its contents column) |
| Journal | B: the list with a side column (Molino's) |
| Article | B: the text with the shopping list in a side column |
| Order | B: the receipt as paper beside the order |
| 404 | B: a blue panel with a large 404 and a photo, then today's deals |

- **Photos:** Tario's eleven lifestyle photos, as `assets/walio/walio-*.jpg`.
- **Words:** "cart" everywhere ("Add to cart", "Cart", "Your cart is empty").

## Releases

- **1.1.7 (8 November 2026):** the Compare pill changes colour on hover and nothing else: no underline under the word and its icon, and not Selldone's widget-hover lift (a 50px shadow easing in over half a second) (the owner: "the hover animation is not good, remove the lines"); and a delivery way's line no longer starts with "·" when the way has no message of its own ("· Pay on delivery").
- **1.1.6 (7 November 2026):** the catalogue's and aisles' cards (Selldone's product card, restyled) and the product page's match box get the same big product as the home's cards in 1.1.5: about 84% of the box instead of 53–55%.
- **1.1.5 (7 November 2026):** Best saving today is a row of equal cards like every other row (six to a computer screen, scrolling sideways, up to twelve deals, the biggest saving first), as the big grocers show deals. The large first card left an empty band under the four beside it, filled a whole tablet screen, and its "Today's best" flag sat over the card's own saving tag (the owner asked whether it was standard). Every card's product now fills about 84% of its grey box instead of 55%: all 160 photos frame the pack at 70%, so the photo is drawn at 120% of the box.
- **1.1.4 (7 November 2026):** the home's two deal tiles show their products big enough to read: each pack sits in its own white card (84 x 112 on a computer; a row of three under the words on tablets and phones), cropped to the pack instead of the photo's white margin, and from a resized photo instead of the 128 px thumbnail (the owner: "the products can't be seen at all"). The journal shows the four articles' own photos (Molino 0.2.33).
- **1.1.3 (7 November 2026):** the browser tab of the first page reads "Walio" too (the server writes the shop's own title, "molino", into the first page's head; kalio-brand.ts now renames it as the shop is read).
- **1.1.2 (7 November 2026):** Walio's own name and logo: the shop's title reads "Walio" in this Layout only (kalio-brand.ts sets it as the shop is read; Selldone's record, emails and the SEO page for crawlers keep "molino"); the Layout's own logo (assets/brand/, kalio-brand.ts) before the wordmark in the header, menu and footer and as the tab icon; "Compare" moved off the picture to a quiet "☐ Compare" line at the foot of the card ("☑ Comparing" once picked), as big shops place it; the journal leaves Selldone's sample posts out once the shop has its own (four grocery articles were published on 7 November 2026). Also fixes the home rows' photos (a missing method in WalioCard).
- **1.1.1 (7 November 2026):** a tester's feedback, as in Molino 0.2.31: product photos at the size they are shown (Selldone's 128 thumbnail and 256–768 from the kalio Worker's `/img` resizer, the full photo as fallback), a "☐ Compare / ☑ Comparing" pill on cards and a "⇄ Compare n" pill at the foot instead of rings that looked like loading, no sound when signing in, "Saved" everywhere instead of Favorites and Wishlist, and states that do not rely on colour alone (focus ring, underlined hover, a ticked chosen size).
- **1.1.0 (7 November 2026):** every page from the mockups Tario did not take (the Bs, product A); see "Every page".
- **1.0.0 (7 November 2026):** the first Walio.
