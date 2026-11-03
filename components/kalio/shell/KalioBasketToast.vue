<!--
  Kalio — "Added to basket".

  A small notice under the header when a product first goes into the
  basket: its packshot, its name with the size and the seller, and the way
  to the basket. It fades by itself. Selldone pinned a green strip ("1 This
  item is in your cart.") to the foot of the window for as long as the
  product page was open; the count now lives on the header's basket.

  Listens for "kalio:basket-added", which the storefront's AddToBasket
  (mixin/StorefrontMixin.ts) emits when a line goes from none to some.
-->
<template>
  <transition name="k-toast">
    <aside v-if="note" aria-live="polite" class="k-toast" role="status">
      <img v-if="note.image" :src="note.image" alt="" class="k-toast__pic" height="52" width="52" />
      <div class="k-toast__copy">
        <p class="k-toast__title">
          <span aria-hidden="true" class="k-toast__tick"><v-icon size="13">check</v-icon></span>
          Added to basket
        </p>
        <p class="k-toast__line">{{ note.line }}</p>
      </div>
      <router-link :to="basketRoute" class="k-toast__go" @click="close">View basket</router-link>
      <button aria-label="Close" class="k-toast__close" type="button" @click="close">
        <v-icon size="18">close</v-icon>
      </button>
    </aside>
  </transition>
</template>

<script>
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { productImage } from "../kalio-catalog";

const SHOWN_FOR = 4500;

/* The size of a variant in words: its volume, weight, pack, colour or style. */
function sizeOf(variant) {
  if (!variant) return null;
  return variant.volume || variant.weight || variant.pack || variant.type || variant.style || null;
}

export default {
  name: "KalioBasketToast",

  data() {
    return {
      note: null,
      type: "PHYSICAL",
    };
  },

  computed: {
    basketRoute() {
      return { name: window.$storefront.routes.BASKET_PAGE, params: { type: this.type } };
    },
  },

  watch: {
    "$route.path"() {
      this.close();
    },
  },

  created() {
    this.onAdded = ({ product, variant, vendor_product, type }) => {
      const parts = [product?.title, sizeOf(variant), vendor_product?.vendor?.name && `from ${vendor_product.vendor.name}`];
      this.type = type || product?.type || "PHYSICAL";
      this.note = { image: productImage(product, true), line: parts.filter(Boolean).join(" · ") };
      clearTimeout(this.timer);
      this.timer = setTimeout(this.close, SHOWN_FOR);
    };
    EventBus.$on("kalio:basket-added", this.onAdded);
  },

  beforeUnmount() {
    EventBus.$off("kalio:basket-added", this.onAdded);
    clearTimeout(this.timer);
  },

  methods: {
    close() {
      clearTimeout(this.timer);
      this.note = null;
    },
  },
};
</script>
