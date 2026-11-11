<!--
  Argon — "Frequently bought together" (product page).

  This product and two more, each with a tick to leave it out, the total of
  the ticked ones and one blue "Add all to cart". The two come from the
  merchant's own cross-sells when there are any; otherwise from other
  departments that share one of this product's tags, else the best-priced
  ones from other departments (then the title is "Goes well together":
  Selldone has no data on what is bought together, so it is not claimed).
  Each goes in with its first colour or capacity in stock.
-->
<template>
  <section v-if="items.length > 1" id="ar-together" aria-labelledby="ar-together-h" class="ar-sec ar-together">
    <header class="ar-head"><h2 id="ar-together-h">{{ curated ? t("argon.together.title", "Frequently bought together") : t("argon.together.goes", "Goes well together") }}</h2></header>
    <div class="ar-together__box">
      <div class="ar-together__row">
        <template v-for="(it, i) in items" :key="it.p.id">
          <span v-if="i" aria-hidden="true" class="ar-together__plus"><span class="ms">add</span></span>
          <div :class="{ '-off': !it.on }" class="ar-together__it">
            <router-link :to="to(it.p)" class="ar-together__img"><img :src="image(it.p)" alt="" loading="lazy" /></router-link>
            <label class="ar-together__pick">
              <input v-model="it.on" type="checkbox" />
              <i aria-hidden="true"><span class="ms">check</span></i>
              <span>
                <template v-if="!i"><b>{{ t("argon.together.this", "This item:") }}</b> </template>{{ it.p.title }}
              </span>
            </label>
            <b class="ar-together__price"><u-price :amount="priceOf(it)" :currency="currency" /></b>
          </div>
        </template>
      </div>
      <div class="ar-together__sum">
        <small>{{ count === items.length && count > 1 ? (count === 3 ? t("argon.together.totalAll3", "Total for all three") : t("argon.together.totalBoth", "Total for both")) : t("argon.together.total", { one: "Total for one item", other: "Total for {n} items" }, { n: count }) }}</small>
        <u-price :amount="total" :currency="currency" class="ar-together__total" />
        <button :disabled="!count || adding" class="ar-btn" type="button" @click="addAll">
          <template v-if="done"><span class="ms">check</span>{{ t("argon.together.added", "Added to cart") }}</template>
          <template v-else><span class="ms">add_shopping_cart</span>{{ count === items.length && count > 1 ? t("argon.together.addAll", "Add all {n} to cart", { n: count }) : t("argon.together.add", "Add {n} to cart", { n: count }) }}</template>
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { currentCurrency } from "../../region-switcher/region";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { addVariant, mayBuy, quickAdd } from "../../kalio/kalio-basket";
import { catalogue, moneyOf, tagged } from "../argon";

export default {
  name: "ArgonTogether",
  mixins: [CurrencyMixin],
  props: {
    product: { type: Object, required: true },
  },
  data: () => ({ items: [], curated: false, adding: false, done: false }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    currency() {
      return currentCurrency();
    },
    count() {
      return this.items.filter((x) => x.on).length;
    },
    total() {
      return this.items.filter((x) => x.on).reduce((s, x) => s + this.priceOf(x), 0);
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
    firstVariant(p) {
      const list = (p.product_variants || []).filter((v) => v.enable !== false);
      return list.find((v) => v.quantity > 0) || null;
    },
    priceOf(it) {
      return moneyOf(this.shop, it.p, it.v, this.currency).now;
    },
    image(p) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 128);
    },
    to(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    async read() {
      this.done = false;
      const me = this.product;
      const all = await catalogue();
      const rich = new Map(all.map((p) => [p.id, p]));
      const base = rich.get(me.id) || me;
      const ok = (p) => p && p.id !== me.id && p.icon && p.quantity > 0;
      /* 1. the merchant's cross-sells */
      const cross = (me.cross_sells || [])
        .map((c) => c.target || c.product || c)
        .map((p) => rich.get(p?.id) || p)
        .filter(ok);
      let picks = cross.slice(0, 2);
      this.curated = picks.length >= 1;
      /* 2. other departments sharing a tag */
      if (picks.length < 2) {
        const tags = await tagged();
        const mine = [...tags.entries()].filter(([, list]) => list.some((p) => p.id === me.id)).map(([t]) => t);
        const pool = mine.flatMap((t) => tags.get(t)).filter((p) => ok(p) && p.category_id !== me.category_id);
        for (const p of pool) if (picks.length < 2 && !picks.some((x) => x.id === p.id || x.category_id === p.category_id)) picks.push(rich.get(p.id) || p);
      }
      /* 3. the lowest-priced from other departments */
      if (picks.length < 2) {
        const pool = all
          .filter((p) => ok(p) && p.category_id !== me.category_id)
          .sort((a, b) => moneyOf(this.shop, a, null, this.currency).now - moneyOf(this.shop, b, null, this.currency).now);
        for (const p of pool) if (picks.length < 2 && !picks.some((x) => x.id === p.id || x.category_id === p.category_id)) picks.push(p);
      }
      if (this.product.id !== me.id) return;
      this.items = [base, ...picks].map((p) => ({ p, v: this.firstVariant(p), on: true }));
    },
    async addAll() {
      if (!mayBuy(this)) return;
      this.adding = true;
      try {
        for (const it of this.items.filter((x) => x.on)) {
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
