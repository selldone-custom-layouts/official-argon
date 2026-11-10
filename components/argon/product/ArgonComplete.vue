<!--
  Argon — "Complete your purchase with…" on the product page: this product,
  a "+", one more from the shop (the merchant's own cross-sell when there
  is one, else another product from the same category), the two together
  and "Add both to cart". A colour or capacity product goes in with the
  choice shown (this page's chosen variant; the other's first in stock).
  The button itself says when both are in; nothing pops up.
-->
<template>
  <section v-if="partner" aria-labelledby="ar-complete-h" class="ar-pcard ar-complete">
    <h2 id="ar-complete-h" class="ar-pcard__h">Complete your purchase with…</h2>
    <div class="ar-complete__row">
      <div class="ar-complete__item">
        <span class="ar-complete__im"><img :src="image(product, variant)" alt="" loading="lazy" /></span>
        <b>{{ product.title }}</b>
        <u-price :amount="priceOf(product, variant)" :currency="currency" />
      </div>
      <span aria-hidden="true" class="ar-complete__plus"><span class="ms">add</span></span>
      <router-link :to="to(partner)" class="ar-complete__item">
        <span class="ar-complete__im"><img :src="image(partner, partnerVariant)" alt="" loading="lazy" /></span>
        <b>{{ partner.title }}</b>
        <u-price :amount="priceOf(partner, partnerVariant)" :currency="currency" />
      </router-link>
    </div>
    <div class="ar-complete__foot">
      <span class="ar-complete__total">Both for <u-price :amount="total" :currency="currency" /></span>
      <button :disabled="adding || soldOut" class="ar-btn" type="button" @click="addBoth">
        <template v-if="done"><span class="ms">check</span>Both in your cart</template>
        <template v-else>Add both to cart</template>
      </button>
    </div>
  </section>
</template>

<script>
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { addVariant, mayBuy, quickAdd } from "../../kalio/kalio-basket";
import { catalogue, leadVariant, moneyOf } from "../argon";

export default {
  name: "ArgonComplete",
  mixins: [CurrencyMixin],
  props: {
    product: { type: Object, required: true },
    /** The variant chosen on the page, or null. */
    variant: { type: Object, default: null },
  },
  data: () => ({ partner: null, adding: false, done: false }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return this.GetUserSelectedCurrency()?.code;
    },
    partnerVariant() {
      if (!this.partner) return null;
      const list = (this.partner.product_variants || []).filter((v) => v.enable !== false);
      return leadVariant(this.partner) || list.find((v) => v.quantity > 0) || null;
    },
    total() {
      return this.priceOf(this.product, this.variant) + (this.partner ? this.priceOf(this.partner, this.partnerVariant) : 0);
    },
    soldOut() {
      const mine = this.variant ? this.variant.quantity : this.product.quantity;
      return !(mine > 0);
    },
  },
  watch: {
    "product.id": {
      handler() {
        this.read();
      },
      immediate: true,
    },
  },
  methods: {
    priceOf(p, v) {
      return moneyOf(this.shop, p, v && v.id ? v : null, this.currency).now;
    },
    image(p, v) {
      return window.CDN.GET_SHOP_IMAGE_PATH((v && v.image) || p.icon, 128);
    },
    to(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    async read() {
      this.done = false;
      const me = this.product;
      const all = await catalogue();
      const rich = new Map(all.map((p) => [p.id, p]));
      const ok = (p) => p && p.id !== me.id && p.icon && p.quantity > 0;
      /* 1. the merchant's cross-sell */
      const cross = (me.cross_sells || [])
        .map((c) => c.target || c.product || c)
        .map((p) => rich.get(p?.id) || p)
        .filter(ok);
      /* 2. another from the same category: the closest price below this one, else the cheapest */
      const mine = this.priceOf(me, null);
      const same = all
        .filter((p) => ok(p) && p.category_id === me.category_id)
        .map((p) => ({ p, now: this.priceOf(p, null) }))
        .sort((a, b) => a.now - b.now);
      const below = same.filter((x) => x.now <= mine);
      const pick = cross[0] || (below.length ? below[below.length - 1].p : same[0]?.p) || null;
      if (this.product.id !== me.id) return;
      this.partner = pick;
    },
    async addBoth() {
      if (!mayBuy(this)) return;
      this.adding = true;
      try {
        const items = [
          { p: this.product, v: this.variant && this.variant.id ? this.variant : null },
          { p: this.partner, v: this.partnerVariant },
        ];
        for (const it of items) {
          if (it.v) await addVariant(this, it.p, it.v);
          else await quickAdd(this, it.p, () => null);
        }
        this.done = true;
        setTimeout(() => (this.done = false), 2500);
      } finally {
        this.adding = false;
      }
    },
  },
};
</script>
