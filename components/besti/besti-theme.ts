/*
 * Besti — the shopper's theme: a colour palette and Light / Dark (the owner's
 * rule of 9 November 2026: "put colour palettes and light / dark themes in the
 * footer; a click changes the site's theme").
 *
 * The choice lives in localStorage ("besti-theme", "<palette>:<mode>") and is
 * put on <html data-bp data-bm> before the app mounts (bootTheme, called from
 * storefront.ts right after Vuetify is made), so the first paint already has
 * it. Every colour in Besti's styles reads tokens keyed on those attributes
 * (besti-theme.scss); Vuetify's theme gets the palette's primary and its
 * light / dark name, so Selldone's own parts follow. One click: no reload.
 */
import { reactive } from "vue";

export interface Palette {
  id: string;
  name: string;
  /** The swatch's colour (the palette's primary). */
  primary: string;
}

/* The colours themselves live in besti-theme.scss ($palettes); these are the
   names and the swatch colours the footer shows. */
export const PALETTES: Palette[] = [
  { id: "blue", name: "Besti blue", primary: "#0a4bd8" },
  { id: "violet", name: "Violet", primary: "#6d28d9" },
  { id: "emerald", name: "Emerald", primary: "#03694c" },
  { id: "copper", name: "Copper", primary: "#9a4207" },
  { id: "magenta", name: "Magenta", primary: "#a21caf" },
];

export type Mode = "light" | "dark";

const KEY = "besti-theme";
const DEFAULT = { palette: "blue", mode: "light" as Mode };

/** The theme now on the page (reactive, for the footer's row). */
export const theme = reactive({ ...DEFAULT });

let vuetify: any = null;

function read(): { palette: string; mode: Mode } {
  try {
    const raw = window.localStorage.getItem(KEY) || "";
    const [palette, mode] = raw.split(":");
    return {
      palette: PALETTES.some((p) => p.id === palette) ? palette : DEFAULT.palette,
      mode: mode === "dark" ? "dark" : "light",
    };
  } catch {
    return { ...DEFAULT };
  }
}

function save(): void {
  try {
    window.localStorage.setItem(KEY, `${theme.palette}:${theme.mode}`);
  } catch {
    /* private mode or blocked storage: the choice lasts for this visit */
  }
}

function paint(): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.setAttribute("data-bp", theme.palette);
  html.setAttribute("data-bm", theme.mode);
  const p = PALETTES.find((x) => x.id === theme.palette) || PALETTES[0];
  const t = vuetify?.theme;
  if (t) {
    try {
      for (const name of ["light", "dark"]) {
        const def = t.themes?.value?.[name];
        if (def?.colors) {
          def.colors.primary = p.primary;
          def.colors.secondary = p.primary;
        }
      }
      if (t.global?.name && "value" in t.global.name) t.global.name.value = theme.mode;
      else if (typeof t.change === "function") t.change(theme.mode);
    } catch {
      /* Vuetify's theme API changed: the tokens still carry the colours */
    }
  }
}

/** Reads the saved choice and puts it on the page; call before mounting. */
export function bootTheme(v: any): void {
  vuetify = v;
  Object.assign(theme, read());
  paint();
}

export function setPalette(id: string): void {
  if (!PALETTES.some((p) => p.id === id) || theme.palette === id) return;
  theme.palette = id;
  save();
  paint();
}

export function setMode(mode: Mode): void {
  if (theme.mode === mode) return;
  theme.mode = mode;
  save();
  paint();
}
