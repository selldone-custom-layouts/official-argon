# Theme and colours

Argon runs the **shared theme switcher** (`components/theme-switcher/`), the same code as the other custom Layouts. Argon's palettes and tokens are in `components/argon/argon-theme.ts`; the **one file a merchant edits** is `components/argon/argon-theme.settings.ts`.

## Argon's colours

Argon paints with two colours:

- the **buy colour**, green `#007a3d`: every "Add to cart", Checkout and chosen state (white words 5.45:1);
- the **brand colour**, red `#c8102e`: the logo tile, links, accents, the deal badge (white words 5.88:1).

Around them: near-black `#1a1a1a` pills for quick links, sale red for "Save $X", light-grey `#f2f2f2` section grounds and a white page. Every colour is a token in `style/argon-theme.scss`.

Only the `argon` palette has two colours. Every other palette, a custom colour and a merchant's brand colour use one colour for both roles.

## On Argon's showcase shop

A **Theme** button sits at the top right of the header, between Wishlist and Cart (on a phone, one of the four icons). It opens a small panel:

- **Colour:** Argon red (the default), Cobalt, Plum, Teal, Tangerine, and **Custom colour** (any colour from the browser's colour picker; it is made readable in light and dark, with a note "Adjusted for readability" when it had to change).
- **Mode:** Light or Dark.

One click changes the whole site at once, with no reload: Argon's colours, the Kalio base, Vuetify's theme and Selldone's own parts (the buy button, prices, the cart drawer, the checkout sheets, dialogs). The choice is kept in the browser (key `argon-theme`) and painted before the first paint, so the default never flashes. The panel has no scrim, closes on a second click, Esc or a click outside, and works with the keyboard.

## On your own shop

The visitor switcher is a **showcase** feature. With `themeSwitcher: "showcase"` it shows only on Argon's own showcase shops (Digini 15549, Molino 15645). On any other shop it is not shown, a saved choice is ignored, and Argon shows the theme from the settings file:

```ts
export const THEME_SETTINGS: ThemeSettings = {
  palette: "argon",          // "argon" | "cobalt" | "plum" | "teal" | "tangerine"
  // brandColor: "#F5C400",  // any colour; replaces palette
  mode: "light",             // "light" | "dark"
  themeSwitcher: "showcase", // "showcase" | "on" (your visitors get it) | "off"
  textOnBrand: "auto",       // with brandColor: "auto" (a light brand keeps dark words) | "white"
};
```

| Setting | Allowed values |
| --- | --- |
| `palette` | `"argon"` (Argon red: green buy buttons and a red brand; the default), `"cobalt"`, `"plum"`, `"teal"`, `"tangerine"` |
| `brandColor` | any `"#RRGGBB"`; when set it replaces `palette` |
| `mode` | `"light"` or `"dark"` |
| `themeSwitcher` | `"showcase"` (the visitor switcher shows only on Argon's own showcase shop, Digini 15549; the default), `"on"` (your visitors get a Theme button in the header), `"off"` |
| `textOnBrand` | only with `brandColor`: `"auto"` (a light brand such as yellow keeps its colour, with dark words on it) or `"white"` (white words; a light colour is darkened) |

Every colour is made readable automatically: buttons, links, the logo tile and dark mode.

## Examples

Change only these lines; leave the rest of the file as it is.

| You want | Set |
| --- | --- |
| "Use the yellow theme" | No palette is yellow, so use a brand colour: `brandColor: "#F5C400", textOnBrand: "auto"` |
| "My brand colour is #F5C400" | `brandColor: "#F5C400", textOnBrand: "auto"`; use `textOnBrand: "white"` for white words (the colour is then darkened) |
| "Make it dark" | `mode: "dark"` |
| "Let visitors switch themes" | `themeSwitcher: "on"` |
| "Remove the switcher" | `themeSwitcher: "off"` (on your own shop it is already hidden with `"showcase"`) |
| "Go back to the original colours" | remove `brandColor`, set `palette: "argon", mode: "light"` |

Then build and upload a new version and put it live:

```bash
LAYOUT_ID=<your Layout id> SELLDONE_CLI_SRC=<cli clone> bash scripts/release.sh <new version> desk
```

See [Build and Upload](Build-and-Upload) and [Go Live](Go-Live).

## Contrast

| Palette | White words on the buy colour (light) |
| --- | --- |
| Argon red | green `#007a3d` 5.45:1; red `#c8102e` 5.88:1 |
| Cobalt | 6.70:1 |
| Plum | 6.98:1 |
| Teal | 5.47:1 |
| Tangerine | 5.53:1 |

In dark mode, white words on every palette's buy colour read at 5.17:1 or more, each buy colour stands at 3:1 or more against the dark card, and every dark text colour reads at 7.4:1 or more on it. A custom or brand colour goes through `paletteFromColor()`, which moves only its lightness until each role reads. In dark mode, product photos keep a white tile so their white edge never shows.

## Checks

Run these from the repository root after a theme change. They need Playwright; set `PW` to your install (`PW=<path>/node_modules/playwright`) if the default path is not yours. A palette argument is a palette id, or `custom:#rrggbb` for a custom colour.

1. **Contrast** on the live shop, at desktop and phone width. It must print `TOTAL 0`:
   ```sh
   PAGES="home=/,category=/<a category>,product=/product/<id>" \
     node components/theme-switcher/tools/contrast-audit.cjs https://<your shop> ".ar-cats"
   ```
   To test one palette and mode, add `STORAGE='{"argon-theme":"{\"palette\":\"argon\",\"mode\":\"dark\"}"}'` (this works where the switcher is shown).
2. **Cart, cart page and address sheet.** It must print `TOTAL 0`. It fills a cart in the browser only and blocks every order request:
   ```sh
   SHOP=<your shop's xapi name> STORAGE_KEY=argon-theme WAIT=".ar-cats" CART=".ar-act.-cart" \
     node components/theme-switcher/tools/cart-audit.cjs https://<your shop> argon dark
   ```
3. **Header and Theme panel**, only if the visitor switcher is on. It must print `PROBLEMS 0`:
   ```sh
   STORAGE_KEY=argon-theme WAIT=".ar-cats" BRAND=".ar-header__logo" CART=".ar-act.-cart" ACCOUNT=".ar-act.-me" \
     node components/theme-switcher/tools/header-check.cjs https://<your shop> argon dark
   ```
4. **Colour maths:** `node components/theme-switcher/theme-color.test.mjs`.

On Argon's showcase shop the same checks run with `https://argon.selldone.shop`, `SHOP=digini-hzgablru`, `PAGES="home=/,category=/digital-camera-category,product=/product/709990"`, for each palette in light and dark.
