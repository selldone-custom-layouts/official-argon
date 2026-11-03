/*
 * Kalio — the catalogue's "+" opens Kalio's quick-buy sheet.
 *
 * SProductsListing (the catalogue, an aisle, a seller's full range) opens
 * a sheet of its own from a card's "+", with Selldone's default product
 * overview inside. The page that shows the listing hosts a KalioQuickBuy and
 * registers it here; while one is registered, the listing's quickBuy hands
 * it the product instead. Where no page has registered (a listing inside a
 * Page Builder page), Selldone's sheet opens as before, so "+" always works.
 *
 * The listing's options are amended once, when this module first loads,
 * before the listing is first rendered.
 */

import SProductsListing from "@selldone/components-vue/storefront/products/listing/SProductsListing.vue";
import "./kalio-offer-price"; // Selldone's sheet, when it opens, prices the chosen seller's offer too

type Host = (product: any) => void;
let host: Host | null = null;

/** Register the sheet that opens for a listing's "+"; returns the release. */
export function hostQuickBuy(open: Host): () => void {
  host = open;
  return () => {
    if (host === open) host = null;
  };
}

const listing: any = SProductsListing;
const selldoneQuickBuy = listing.methods.quickBuy;

listing.methods = {
  ...listing.methods,
  quickBuy(this: any, product: any) {
    if (this.viewOnly) return;
    if (host) host(product);
    else selldoneQuickBuy.call(this, product);
  },
};
