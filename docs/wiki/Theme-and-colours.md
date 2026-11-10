# Theme and colours

Argon runs the **shared theme switcher** (`components/theme-switcher/`), the same code as Digito and the other custom Layouts. Its config for Argon is `components/argon/argon-theme.ts`; the one file a merchant edits is `components/argon/argon-theme.settings.ts`.

## On Argon's showcase shop

A **Theme** action sits at the top right of the header, just before the cart (on a phone, the icon beside the account icon). It opens a small panel:

- **Colour:** Argon blue (the default), Violet, Emerald, Copper, Magenta, and **Custom colour** (any colour from the browser's colour picker; it is made readable in light and dark, with a note "Adjusted for readability" when it had to change). Six swatches in three full rows.
- **Mode:** Light or Dark.

One click changes the whole site at once, with no reload: Argon's colours, the Kalio base, Vuetify's theme and Selldone's own parts (the buy button, prices, the cart drawer, the checkout sheets, dialogs). The choice is kept in the browser and painted before the first paint, so the default never flashes. The panel has no scrim, closes on a second click, Esc or a click outside, and works with the keyboard.

## On your own shop

The visitor switcher is a **showcase** feature: on any shop other than Argon's own showcase shops (Digini 15549, Molino 15645) it is not shown, a saved choice is ignored, and Argon looks exactly as designed. Your theme comes from the settings file:

```ts
export const THEME_SETTINGS: ThemeSettings = {
  palette: "blue",          // "blue" | "violet" | "emerald" | "copper" | "magenta"
  // brandColor: "#F5C400", // any colour; replaces palette
  mode: "light",            // "light" | "dark"
  themeSwitcher: "showcase",// "showcase" | "on" (your visitors get it) | "off"
  textOnBrand: "auto",      // with brandColor: "auto" (a light brand keeps dark words) | "white"
};
```

Examples:

| You want | Set |
| --- | --- |
| A yellow brand | `brandColor: "#F5C400", textOnBrand: "auto"` |
| Your brand colour with white words | `brandColor: "#…", textOnBrand: "white"` (a light colour is darkened) |
| A dark shop | `mode: "dark"` |
| Your visitors choose | `themeSwitcher: "on"` |
| The original look | remove `brandColor`, `palette: "blue", mode: "light"` |

Then build and upload a new version (see [Build and Upload](Build-and-Upload)) and put it live.

## Contrast

Every palette keeps white button words at 6.3:1 or more (light) and 5:1 or more (dark), the yellow "Deals" at 4.5:1 or more on the department bar, and every link colour at 4.5:1 or more on its ground. A custom or brand colour goes through `paletteFromColor()`, which moves only its lightness until each role reads. In dark mode, product photos keep a white tile so their white edge never shows.

Checks (from the repository root; each must print 0):

```sh
STORAGE='{"argon-theme":"{\"palette\":\"blue\",\"mode\":\"dark\"}"}' \
PAGES="home=/,category=/digital-camera-category,product=/product/709990" \
  node components/theme-switcher/tools/contrast-audit.cjs https://argon.selldone.shop ".b-hero__main"
SHOP=digini-hzgablru STORAGE_KEY=argon-theme WAIT=".b-hero__main" CART=".b-cartpill" \
  node components/theme-switcher/tools/cart-audit.cjs https://argon.selldone.shop blue dark
STORAGE_KEY=argon-theme WAIT=".b-hero__main" BRAND=".b-header__logo" CART=".b-cartpill" ACCOUNT=".b-act.-me" \
  node components/theme-switcher/tools/header-check.cjs https://argon.selldone.shop blue dark
node components/theme-switcher/theme-color.test.mjs
```
