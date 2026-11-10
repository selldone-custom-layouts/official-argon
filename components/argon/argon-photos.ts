/*
 * Argon — the photo slots (the one registry).
 *
 * Every lifestyle photo slot on Argon's pages that is not a category's own
 * photo (those are assets/argon/<shape>-<category slug>.webp, see argon.ts
 * photoOf) is listed here: slot → file name, its size and where it shows.
 *
 * A slot uses assets/photos/<file> when that file exists at build time
 * (import.meta.glob lists only the files that are there). Until then it
 * draws a calm placeholder of the same shape with the file's name in it, so
 * the page still looks intentional and the owner can see which file goes
 * where. To add the photos: put the WebP files in assets/photos/, build and
 * release. No code change. The prompts that make them are in
 * digini-design/codex-photos-argon.md.
 *
 * Two kinds of slot follow the shop's live data and so take a name part:
 *  - trend-<tag>.webp: one per product tag in "Trending now" (wireless,
 *    portable, 4k, gaming today; a new tag looks for its own file);
 *  - brand-<brand>.webp: one per brand in "Explore our brands" (the four
 *    brands with the most products).
 */

const FILES = import.meta.glob("../../assets/photos/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const BY_FILE = new Map<string, string>(Object.entries(FILES).map(([path, url]) => [path.split("/").pop()!, url]));

export interface Slot {
  /** The file name in assets/photos/. */
  file: string;
  /** width / height of the slot (and of the photo to make). */
  ratio: number;
  /** Where it shows, for people. */
  where: string;
}

/** The fixed slots. */
export const SLOTS: Record<string, Slot> = {
  "promo-deals": { file: "promo-deals.webp", ratio: 3 / 2, where: "Home: the first promo card, Today's deals" },
  "promo-new": { file: "promo-new.webp", ratio: 3 / 2, where: "Home: the second promo card, New arrivals" },
  "promo-best": { file: "promo-best.webp", ratio: 3 / 2, where: "Home: the third promo card, Best sellers" },
  "banner-compare": { file: "banner-compare.webp", ratio: 16 / 9, where: "Home: the dark red compare banner, right side" },
  "service-track": { file: "service-track.webp", ratio: 1, where: "Home: There's even more, Track an order" },
  "service-compare": { file: "service-compare.webp", ratio: 1, where: "Home: There's even more, Compare products" },
  "service-help": { file: "service-help.webp", ratio: 1, where: "Home: There's even more, Help & FAQ" },
  "service-contact": { file: "service-contact.webp", ratio: 1, where: "Home: There's even more, Contact us" },
  "help-desk": { file: "help-desk.webp", ratio: 3 / 2, where: "Home: the Need a hand? block" },
};

/** A slot name made from live data ("4K" → "4k", "Coonooo" → "coonooo"). */
export function slug(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A tag's "Trending now" slot. */
export function trendSlot(tag: string): Slot {
  return { file: `trend-${slug(tag)}.webp`, ratio: 3 / 2, where: `Home: Trending now, ${tag}` };
}

/** A brand's "Explore our brands" slot. */
export function brandSlot(brand: string): Slot {
  return { file: `brand-${slug(brand)}.webp`, ratio: 1, where: `Home: Explore our brands, ${brand}` };
}

/** The photo's address when the file is in the build, else null (placeholder). */
export function slotSrc(slot: Slot | null | undefined): string | null {
  return (slot && BY_FILE.get(slot.file)) || null;
}
