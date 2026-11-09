/* ━━━━━━━━━━━━ The Layout's own name and logo ━━━━━━━━━━━━
   Besti Electronics runs on its own address of the shop Digini (one shop, a
   Layout per domain), so the shop's own title would put "Digini" in its
   header, footer, page titles and every line that names the shop. Like Tario
   and Walio, the title is replaced here, as soon as the shop is read, for
   this Layout only. The shop record on Selldone (its emails, dashboard, the
   SEO page Selldone serves to crawlers) keeps its own title.

   THE BRAND IS THIS ONE LINE: `name`. The wordmark (components/besti/
   BestiLogo.vue) is drawn from it in lower case, every "i" carrying a small
   yellow square for its dot. Set `name: null` to keep the shop's own title.

   The mark (assets/brand/besti-mark.svg, 64x64 SVG: a white "b" on navy with
   the yellow square) is the browser tab's icon and the avatar on order
   messages. */

import mark from "../../assets/brand/besti-mark.svg?url";

export const BRAND: { name: string | null; mark: string } = {
  name: "Besti",
  mark,
};

/** Put the Layout's name on the shop record the storefront reads. */
export function applyBrand(shop: any): void {
  if (shop && BRAND.name && shop.title && shop.title !== BRAND.name) {
    renameTab(shop.title);
    shop.title = BRAND.name;
  }
  brandIcon();
  cartWords();
}

/** The first page keeps the head the server wrote ("… | molino"); later pages
    build their titles from the renamed shop. Put the Layout's name in the tab. */
function renameTab(original: string): void {
  if (typeof document === "undefined" || !document.title.includes(original)) return;
  document.title = document.title.split(original).join(BRAND.name as string);
}

/** The tab's icon (and the home-screen icon) is the Layout's mark. */
export function brandIcon(): void {
  if (typeof document === "undefined") return;
  for (const rel of ["icon", "apple-touch-icon"]) {
    let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = rel;
      document.head.appendChild(link);
    }
    if (link.href !== BRAND.mark) {
      link.href = BRAND.mark;
      if (rel === "icon") link.type = "image/svg+xml";
    }
  }
}

/* ━━━━━━━━━━━━ One word for the cart ━━━━━━━━━━━━
   Besti says "cart" everywhere. Selldone's own English strings that still
   say "basket" (its buy button, the share-order dialog, the "others have
   this" line) are set to "cart" here, in English only, once. */
let wordsMerged = false;
export function cartWords(): void {
  if (wordsMerged || typeof window === "undefined") return;
  const i18n = (window as any).$i18n_global;
  const locale = i18n?.locale?.value ?? i18n?.locale;
  if (!i18n?.mergeLocaleMessage || !String(locale).startsWith("en")) return;
  i18n.mergeLocaleMessage(locale, {
    buy_button: { quantity_in_basket: "In your cart", add_to_basket: "Add to cart" },
    share_order: { address_included: "Share cart items + address", address_excluded: "Share only cart items" },
    product_section_incentivise: { have_in_their_bag: "<b>{in_carts}</b> others have this in their carts!" },
    /* Selldone's countdown (the product page's deal clock) reads "Day",
       "Hour": Besti's clocks say days, hrs, min, sec everywhere. */
    global: { count_down: { days: "days", hours: "hrs", minutes: "min", seconds: "sec" } },
  });
  wordsMerged = true;
}
