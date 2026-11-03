/*
 * Kalio — the basket on Selldone's product card.
 *
 * SShopProductCard (every rail and the catalogue grid) has no slot for a
 * quantity, so a small mixin is added to it here: once the card is
 * mounted, a KalioCardStep is rendered into the card's picture box, sharing
 * the app's context (store, router, global mixin). It shows only while the
 * product is in the basket, laid over the card's "+". The "+" itself is
 * handled by the page that shows the card (quickAdd in kalio-basket.ts).
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
          if (!this._kalioStepHost || !this._kalioStepHost.isConnected) {
            this._kalioStepHost = document.createElement("div");
            this._kalioStepHost.className = "k-card-step-host";
            box.appendChild(this._kalioStepHost);
          }
          const vnode = h(KalioCardStep, { product: this.product });
          vnode.appContext = this.$.appContext;
          render(vnode, this._kalioStepHost);
        },
      },
    },
  ];
}
