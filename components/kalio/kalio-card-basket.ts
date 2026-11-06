/*
 * Kalio — the basket on Selldone's product card.
 *
 * SShopProductCard (the catalogue grid, an aisle, a seller's range) has no
 * slot for a button or a quantity, so a small mixin is added to it here:
 * once the card is mounted, a KalioCardStep is rendered at the card's foot,
 * sharing the app's context (store, router, global mixin). It is the
 * card's "Add to basket" (or "See options" for a product with sizes), and
 * "− n +" once the product is in the basket (Amazon's grocery cards, which
 * the owner pointed to, 6 November 2026). Its add is the card's own
 * "quick-buy" event, so the page that shows the card handles it as before
 * (quickAdd in kalio-basket.ts); the card's round "+" on the picture is
 * hidden. A rail (KalioRail) puts the same foot under its own card, below
 * the unit and the sellers, so a rail's cards are left alone here.
 *
 * The card's options are amended once, when this module first loads,
 * before a card is first rendered; it is imported by every Kalio piece
 * that shows cards.
 */

import { h, render } from "vue";
import SShopProductCard from "@selldone/components-vue/storefront/product/card/SShopProductCard.vue";
import KalioCardStep from "./KalioCardStep.vue";

const card: any = SShopProductCard;

if (!card.__kalioStep) {
  card.__kalioStep = true;
  card.mixins = [
    ...(card.mixins || []),
    {
      mounted(this: any) {
        this.kalioStepRender();
      },
      watch: {
        product(this: any) {
          this.kalioStepRender();
        },
      },
      beforeUnmount(this: any) {
        if (this._kalioStepHost) render(null, this._kalioStepHost);
      },
      methods: {
        kalioStepRender(this: any) {
          const box = this.$el?.querySelector?.(".card-wrap");
          if (!box || !this.product) return;
          if (this.$el.closest?.(".k-rail__cell")) return; // the rail draws the foot
          if (!this._kalioStepHost || !this._kalioStepHost.isConnected) {
            this._kalioStepHost = document.createElement("div");
            this._kalioStepHost.className = "k-card-step-host";
            box.appendChild(this._kalioStepHost);
          }
          const vnode = h(KalioCardStep, {
            product: this.product,
            card: true,
            adder: () => this.$emit("quick-buy"),
            /* Selldone's own conditions for the card's "+". */
            addable: () =>
              !(window as any).ExternalWidget &&
              (!this.isInsta || this.$vuetify.display.lgAndUp) &&
              this.quickBuy &&
              (this.product.quantity || this.isFile),
            soldOut: () => this.quickBuy && !this.isFile && !this.product.quantity,
          });
          vnode.appContext = this.$.appContext;
          render(vnode, this._kalioStepHost);
        },
      },
    },
  ];
}
