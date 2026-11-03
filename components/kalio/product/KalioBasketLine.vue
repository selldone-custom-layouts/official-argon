<!--
  Kalio — In the basket (product page and quick-buy sheet).

  Once the product is in the basket the buy button gives way to this:
  how many are in the basket and from which seller, a quantity stepper, and
  checkout with the basket's total beside it. Selldone turned the button
  into a blue number field and pinned a green strip to the window's foot;
  design C of three drawn on 3 November 2026
  (../kalio-design/basket-options/).

  The stepper sets the line's count through the storefront's own basket
  methods (kalio-basket.ts); at one, "−" takes the product out and the buy
  button comes back.
-->
<template>
  <div :class="{ '-busy': busy }" class="k-basket-line">
    <p class="k-basket-line__cap">
      <i aria-hidden="true"></i>
      {{ shown }} in your basket<template v-if="seller">, from {{ seller }}</template>
    </p>
    <div class="k-basket-line__row">
      <div aria-label="Quantity in basket" class="k-basket-line__qty" role="group">
        <button
          :aria-label="shown > 1 ? 'One fewer' : 'Remove from basket'"
          :disabled="busy"
          type="button"
          @click="step(-1)"
        >
          <v-icon size="22">{{ shown > 1 ? "remove" : "delete_outline" }}</v-icon>
        </button>
        <output aria-live="polite">{{ shown }}</output>
        <button :disabled="busy || shown >= max" aria-label="One more" type="button" @click="step(1)">
          <v-icon size="22">add</v-icon>
        </button>
      </div>
      <router-link :to="checkoutRoute" class="k-basket-line__go">
        Checkout
        <template v-if="total !== null">
          <span aria-hidden="true">·</span>
          <u-price :amount="total" :currency="currency" />
        </template>
      </router-link>
    </div>
  </div>
</template>

<script>
import { setCount } from "../kalio-basket";

export default {
  name: "KalioBasketLine",

  props: {
    /** The basket line for this product (and size). */
    line: { type: Object, required: true },
    product: { type: Object, required: true },
    /** The chosen offer, for the seller's name. */
    vendorProduct: { type: Object, default: null },
    /** Stock the stepper may not pass. */
    stock: { type: Number, default: null },
  },

  data() {
    return {
      busy: false,
      pending: null,
    };
  },

  computed: {
    shown() {
      return this.pending ?? this.line.count;
    },
    max() {
      return this.stock ?? this.vendorProduct?.quantity ?? this.product.quantity ?? 99;
    },
    seller() {
      return this.vendorProduct?.vendor?.name || null;
    },
    basket() {
      return this.getBasket(this.product.type || "PHYSICAL");
    },
    total() {
      const price = this.basket?.bill?.price;
      return typeof price === "number" ? price : null;
    },
    currency() {
      return this.basket?.bill?.currency || this.basket?.currency;
    },
    checkoutRoute() {
      return { name: window.$storefront.routes.BASKET_PAGE, params: { type: this.product.type || "PHYSICAL" } };
    },
  },

  methods: {
    step(delta) {
      const count = this.shown + delta;
      this.busy = true;
      this.pending = Math.max(count, 0);
      setCount(this, this.product, this.line, count)
        .catch(() => {})
        .finally(() => {
          this.busy = false;
          this.pending = null;
        });
    },
  },
};
</script>
