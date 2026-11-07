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

## Releases

- **1.0.0 (7 November 2026):** the first Walio.
