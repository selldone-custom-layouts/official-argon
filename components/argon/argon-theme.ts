/*
 * Argon — the theme switcher's config (the header's "Theme" action; the
 * owner's rules of 9 November 2026: colour palettes, a custom colour and
 * Light / Dark, a click changes the whole site; at the top right of the
 * header; the same shared package in every Layout, components/theme-switcher/).
 *
 * Argon paints with two colours: the buy colour (`primary`: every "Add to
 * cart", Checkout and chosen state) and the brand colour (`brand`: the logo
 * tile, links, accents, the deal badge, a saving's words). Argon's own
 * palette is green buttons and a red brand; every other palette, a custom
 * colour and a merchant's brand colour use one hue for both.
 *
 * This file is everything Argon-specific: the palettes, which Argon variables
 * each palette value feeds (the Kalio base reads Argon's: --k-green is
 * var(--ar-blue), which is var(--ar-buy), in kalio-tokens.scss and
 * argon-theme.scss), the dark token set, and Vuetify's dark surfaces.
 * storefront.ts calls bootThemeSwitcher(ARGON_THEME, vuetify) before
 * mounting, so the chosen theme paints first, with no flash. The merchant's
 * choice is in argon-theme.settings.ts.
 *
 * Contrast (WCAG 2.1, measured 10 November 2026). White on each light
 * primary: Argon green #007a3d 5.45, cobalt 6.70, plum 6.98, teal 5.47,
 * tangerine 5.53; white on Argon red #c8102e 5.88. White on each dark
 * primary 5.17 or more, each 3:1 or more against the dark card #1b1d21;
 * each dark "text" colour on that card 7.4 or more.
 */
import type { ThemeSwitcherConfig } from "../theme-switcher/theme-switcher";
import { THEME_SETTINGS } from "./argon-theme.settings";

export const ARGON_THEME: ThemeSwitcherConfig = {
  /* The merchant's choice: argon-theme.settings.ts, the one file to edit. */
  settings: THEME_SETTINGS,

  /* The owner (9 November 2026): a merchant who imports Argon into their own
     shop must not see the switcher. With themeSwitcher "showcase" it shows
     only on these shops (window.shop.id, else <meta name="shop-name">). */
  showcaseShops: [
    { id: 15549, name: "digini-hzgablru" }, // Digini: Digito, Besti, Argon, Senso
    { id: 15645, name: "molino" }, // Molino: Molino, Tario, Walio, Dino, Valero
  ],

  storageKey: "argon-theme",
  darkClass: "ar-dark",

  palettes: [
    {
      id: "argon",
      name: "Argon red",
      light: {
        primary: "#007a3d", deep: "#00602f", soft: "#e6f2eb", onPrimary: "#ffffff", text: "#007a3d",
        brand: "#c8102e", brandDeep: "#a50d25", brandSoft: "#fdecee", brandText: "#c8102e",
      },
      dark: {
        primary: "#007a3d", deep: "#00602f", soft: "#12301f", onPrimary: "#ffffff", text: "#6fd39b",
        brand: "#d42114", brandDeep: "#b01b10", brandSoft: "#3a1519", brandText: "#ff8a96",
      },
    },
    {
      id: "cobalt",
      name: "Cobalt",
      light: {
        primary: "#1d4ed8", deep: "#1e40af", soft: "#e8efff", onPrimary: "#ffffff", text: "#1d4ed8",
        brand: "#1d4ed8", brandDeep: "#1e40af", brandSoft: "#e8efff", brandText: "#1d4ed8",
      },
      dark: {
        primary: "#2563eb", deep: "#1d4ed8", soft: "#17264a", onPrimary: "#ffffff", text: "#93b4ff",
        brand: "#2563eb", brandDeep: "#1d4ed8", brandSoft: "#17264a", brandText: "#93b4ff",
      },
    },
    {
      id: "plum",
      name: "Plum",
      light: {
        primary: "#7e22ce", deep: "#6b21a8", soft: "#f3e8ff", onPrimary: "#ffffff", text: "#7e22ce",
        brand: "#7e22ce", brandDeep: "#6b21a8", brandSoft: "#f3e8ff", brandText: "#7e22ce",
      },
      dark: {
        primary: "#9333ea", deep: "#7e22ce", soft: "#2c1a45", onPrimary: "#ffffff", text: "#d0aaff",
        brand: "#9333ea", brandDeep: "#7e22ce", brandSoft: "#2c1a45", brandText: "#d0aaff",
      },
    },
    {
      id: "teal",
      name: "Teal",
      light: {
        primary: "#0f766e", deep: "#115e59", soft: "#e2f5f2", onPrimary: "#ffffff", text: "#0f766e",
        brand: "#0f766e", brandDeep: "#115e59", brandSoft: "#e2f5f2", brandText: "#0f766e",
      },
      dark: {
        primary: "#0f766e", deep: "#115e59", soft: "#0f322f", onPrimary: "#ffffff", text: "#5eead4",
        brand: "#0f766e", brandDeep: "#115e59", brandSoft: "#0f322f", brandText: "#5eead4",
      },
    },
    {
      id: "tangerine",
      name: "Tangerine",
      light: {
        primary: "#b4450a", deep: "#923808", soft: "#fdf0e3", onPrimary: "#ffffff", text: "#b4450a",
        brand: "#b4450a", brandDeep: "#923808", brandSoft: "#fdf0e3", brandText: "#b4450a",
      },
      dark: {
        primary: "#c2410c", deep: "#9a3412", soft: "#3a2212", onPrimary: "#ffffff", text: "#fdba74",
        brand: "#c2410c", brandDeep: "#9a3412", brandSoft: "#3a2212", brandText: "#fdba74",
      },
    },
  ],

  /* Palette value -> the variables that carry it. --ar-head (the logo tile)
     keeps the light brand colour in both modes, with --ar-on-head words;
     --ar-on-brand is the words on a buy button (dark on a light merchant
     brand, textOnBrand "auto"). The inherited --ar-blue* names read --ar-buy*
     (argon-theme.scss). */
  tokens: {
    "--ar-buy": "primary",
    "--ar-buy-d": "deep",
    "--ar-buy-l": "soft",
    "--ar-buy-t": "text",
    "--ar-buy-rgb": "primary:rgb",
    "--ar-brand": "brand",
    "--ar-brand-d": "brandDeep",
    "--ar-brand-l": "brandSoft",
    "--ar-brand-t": "brandText",
    "--ar-brand-rgb": "brand:rgb",
    "--ar-head": "light.brand",
    "--ar-head-d": "light.brandDeep",
    "--ar-on-head": "light.onPrimary",
    "--ar-on-head-rgb": "light.onPrimary:rgb",
    "--ar-on-brand": "onPrimary",
    "--ar-on-brand-rgb": "onPrimary:rgb",
  },

  /* While dark (removed on light). Packshot tiles (--ar-photo, --k-well,
     --k-tint) stay white, so a white packshot keeps its edge hidden. */
  dark: {
    "--ar-bg": "#121315",
    "--ar-surface": "#1b1d21",
    "--ar-page": "#232529",
    "--ar-tile": "#2a2d32",
    "--ar-line": "#33363c",
    "--ar-line-2": "#464a52",
    "--ar-hover-line": "#5a5f68",
    "--ar-deco": "#7d828b",
    "--ar-ink": "#ececee",
    "--ar-ink-2": "#d4d6da",
    "--ar-brand-ink": "#ececee",
    "--ar-muted": "#a8acb3",
    "--ar-soft": "#9a9fa7",
    "--ar-off-bg": "#33363c",
    "--ar-off-ink": "#b9bdc4",
    "--ar-pill": "#ececee",
    "--ar-on-pill": "#121315",
    "--ar-pill-hover": "#ffffff",
    "--ar-dark-card": "#232529",
    "--ar-ph-bg": "#26292e",
    "--ar-ph-line": "#33363c",
    "--ar-ph-ink": "#a8acb3",
    "--ar-red-t": "#ff8a96",
    "--ar-green-t": "#6fd39b",
    "--ar-warn-t": "#ffb366",
    "--ar-yellow-l": "#3a3312",
    "--ar-sw-edge": "rgba(255, 255, 255, 0.55)",
    "--ar-pop-shadow": "rgba(0, 0, 0, 0.6)",
    "--k-line-soft": "#2a2d32",
    "--k-coral-soft": "#3a1519",
    "--k-star-off": "#7d828b",
    "--k-plain": "#1b1d21",
    "--k-shadow": "0 10px 28px -14px rgba(0, 0, 0, 0.7)",
  },

  vuetify: {
    light: "light",
    dark: "dark",
    paletteColors: { primary: "primary", "on-primary": "onPrimary" },
    darkColors: {
      background: "#121315",
      surface: "#1b1d21",
      "surface-bright": "#232529",
      "surface-variant": "#33363c",
      "on-background": "#ececee",
      "on-surface": "#ececee",
      "on-surface-variant": "#d4d6da",
      "on-primary": "#ffffff",
      secondary: "#ececee",
      "on-secondary": "#121315",
      error: "#ff8a96",
      info: "#93b4ff",
      success: "#6fd39b",
      warning: "#ffb366",
    },
  },

  metaThemeColor: "light.brand",
  ui: { ink: "var(--ar-ink)", muted: "var(--ar-muted)", line: "var(--ar-line)", surface: "var(--ar-surface)", font: '"Barlow", system-ui, sans-serif' },
  labels: { theme: "Theme", palettes: "Colour", mode: "Light or dark", modeTitle: "Mode", light: "Light", dark: "Dark", custom: "Custom colour", adjusted: "Adjusted for readability", brand: "Brand colour" },

  /* "Custom colour" (the owner, 9 November 2026): any colour, made readable by
     paletteFromColor(), and used for both the buy colour and the brand. The
     header is white, so white on the light primary needs only 4.5:1; 5 keeps
     a margin for the green info strip's smaller words. */
  custom: {
    headerContrast: 5,
    darkSurfaces: ["#121315", "#1b1d21", "#232529"],
    lightSurfaces: ["#ffffff", "#f2f2f2"],
    darkText: "#1a1a1a",
    extras: (v) => ({
      brand: v.primary,
      brandDeep: v.deep,
      brandSoft: v.soft,
      brandText: v.text,
    }),
  },
};
