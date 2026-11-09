/*
 * Besti — the catalogue's cards are Besti's own.
 *
 * SProductsListing (a category, the catalogue, a search, the deals) draws
 * Selldone's SShopProductCard, which has no slot for any of this. A small
 * mixin is added to it here: once the card is mounted, a BestiCard (in its
 * `inside` mode, without links of its own, since Selldone's card is the link
 * to the product) is rendered into the card and Selldone's own markup is
 * hidden (besti-pages.scss). So every grid shows the same card as the home:
 * colour swatches that pick a colour, the price with "Save $X", "Add to
 * cart" that becomes "− n +", "Choose capacity" for the sheet, Compare and
 * Save. The card's "Choose …" is the card's own "quick-buy" event, so the
 * page that shows the listing opens Kalio's sheet as before
 * (kalio-listing-quick-buy.ts).
 *
 * The card's options are amended once, when this module first loads.
 */

import { h, render } from "vue";
import SShopProductCard from "@selldone/components-vue/storefront/product/card/SShopProductCard.vue";
import BestiCard from "../besti/BestiCard.vue";

const card: any = SShopProductCard;

if (!card.__bestiCard) {
  card.__bestiCard = true;
  card.mixins = [
    ...(card.mixins || []),
    {
      mounted(this: any) {
        this.bestiRender();
      },
      watch: {
        product(this: any) {
          this.bestiRender();
        },
      },
      beforeUnmount(this: any) {
        if (this._bestiHost) render(null, this._bestiHost);
      },
      methods: {
        bestiRender(this: any) {
          const root = this.$el;
          if (!root || !this.product || root.nodeType !== 1) return;
          if (!this._bestiHost || !this._bestiHost.isConnected) {
            this._bestiHost = document.createElement("div");
            this._bestiHost.className = "b-card-host";
            root.appendChild(this._bestiHost);
          }
          const vnode = h(BestiCard, {
            product: this.product,
            inside: true,
            onQuickBuy: () => this.$emit("quick-buy"),
          });
          vnode.appContext = this.$.appContext;
          render(vnode, this._bestiHost);
        },
      },
    },
  ];
}
