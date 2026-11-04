<!--
  Kalio — the basket drawer (the header's Basket).

  A receipt first: the subtotal large, what the shopper saves, and
  Checkout right there. Then the basket in compact rows (picture, name,
  size and seller, a quantity stepper, the line's price), and under it
  three products often added, each with its own "+". Design C of three
  drawn on 4 November 2026 (../kalio-design/basket-drawer-options/).

  It replaces Selldone's BasketTopMenu ("YOUR CART", a black "Count"
  dropdown, "Hour" and a black Checkout). The basket, its bill and the
  steppers are the storefront's own (getBaskets, kalio-basket.ts); the
  stepper changes the count as it is tapped and the bill follows. A
  basket of another type (a file or a service) gets its own receipt.
-->
<template>
  <div class="k-bdrawer">
    <section v-for="group in groups" :key="group.type" class="k-bdrawer__group">
      <div :class="{ '-settling': group.settling }" class="k-bdrawer__receipt">
        <div class="k-bdrawer__sum">
          <p class="k-bdrawer__total">
            <small>
              Subtotal · {{ group.units }} {{ group.units === 1 ? "item" : "items" }}
              <template v-if="groups.length > 1"> · {{ typeName(group.type) }}</template>
            </small>
            <u-price :amount="group.total" :currency="group.currency" />
          </p>
          <span v-if="group.saved >= 0.01" class="k-bdrawer__save">
            You save <u-price :amount="group.saved" :currency="group.currency" />
          </span>
        </div>
        <router-link :to="checkoutRoute(group.type)" class="k-bdrawer__go" @click="$emit('close')">
          <v-icon size="20">shopping_bag</v-icon>
          Checkout
        </router-link>
      </div>

      <ul class="k-bdrawer__rows">
        <li v-for="item in group.items" :key="item.id" class="k-bdrawer__row">
          <router-link :to="productRoute(item.product_id)" class="k-bdrawer__pic" @click="$emit('close')">
            <img v-if="image(item.product)" :src="image(item.product)" alt="" height="36" loading="lazy" width="36" />
          </router-link>
          <router-link :to="productRoute(item.product_id)" class="k-bdrawer__name" @click="$emit('close')">
            <span>{{ item.product?.title }}</span>
            <small v-if="meta(item)">{{ meta(item) }}</small>
          </router-link>
          <div
            :aria-label="`Quantity of ${item.product?.title || 'this item'}`"
            :class="{ '-busy': settling(item.product, item) }"
            class="k-bdrawer__qty"
            role="group"
          >
            <button :aria-label="shown(item) > 1 ? 'One fewer' : 'Remove from basket'" type="button" @click="step(item, -1)">
              <v-icon size="16">{{ shown(item) > 1 ? "remove" : "delete_outline" }}</v-icon>
            </button>
            <output aria-live="polite">{{ shown(item) }}</output>
            <button :disabled="shown(item) >= max(item)" aria-label="One more" type="button" @click="step(item, 1)">
              <v-icon size="16">add</v-icon>
            </button>
          </div>
          <u-price :amount="item.price * shown(item)" :currency="item.currency" class="k-bdrawer__price" />
        </li>
      </ul>
    </section>

    <div v-if="suggestions.length" class="k-bdrawer__suggest">
      <p class="k-eyebrow k-bdrawer__label">Often added</p>
      <div class="k-bdrawer__minis">
        <div v-for="product in suggestions" :key="product.id" class="k-bdrawer__mini">
          <div class="k-bdrawer__mini-pic">
            <router-link :to="productRoute(product.id)" :aria-label="product.title" @click="$emit('close')">
              <img v-if="image(product)" :src="image(product)" alt="" loading="lazy" />
            </router-link>
            <button
              :aria-label="`Add ${product.title}`"
              :disabled="adding(product)"
              class="k-bdrawer__mini-add"
              type="button"
              @click="add(product)"
            >
              <v-progress-circular v-if="adding(product)" indeterminate size="16" width="2" />
              <v-icon v-else size="18">add</v-icon>
            </button>
          </div>
          <router-link :to="productRoute(product.id)" class="k-bdrawer__mini-name" @click="$emit('close')">
            {{ product.title }}
          </router-link>
          <u-price :amount="priceOf(product).now" :currency="currency" class="k-bdrawer__mini-price" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { hasSizes, pendingLine, quickAdd, settling, shownCount, stepTo } from "../kalio-basket";
import { offers, priceOf, productImage, vendors } from "../kalio-catalog";

const SUGGESTED = 3;

/* The size of a variant in words: its volume, weight, pack, colour or style. */
function sizeOf(variant) {
  if (!variant) return null;
  return variant.volume || variant.weight || variant.pack || variant.type || variant.style || null;
}

export default {
  name: "KalioBasketDrawer",
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  emits: ["close"],

  data() {
    return {
      sellerNames: new Map(),
      catalogue: [],
    };
  },

  computed: {
    currency() {
      return this.GetUserSelectedCurrency()?.code;
    },

    /* One receipt per basket with something in it: usually the one basket
       of groceries. Rows taken to zero leave at once; the bill follows. */
    groups() {
      return this.getBaskets()
        .filter((basket) => basket?.items?.length)
        .map((basket) => {
          const bill = basket.bill || {};
          const items = basket.items.filter((item) => shownCount(item.product || { id: item.product_id }, item) > 0);
          return {
            type: basket.type,
            items,
            units: basket.items.reduce((sum, item) => sum + (item.count || 0), 0),
            total: typeof bill.price === "number" ? bill.price : basket.price,
            /* From the lines, not the bill: a basket read on page load
               comes without one. */
            saved: basket.items.reduce(
              (sum, item) => sum + (item.dis || 0) * (item.count || 0) + (item.offer_amount || 0),
              0,
            ),
            currency: bill.currency || basket.currency,
            settling: basket.items.some((item) => settling(item.product || { id: item.product_id }, item)),
          };
        })
        .filter((group) => group.items.length);
    },

    inBasket() {
      const ids = new Set();
      for (const basket of this.getBaskets()) for (const item of basket?.items || []) ids.add(item.product_id);
      return ids;
    },

    /* Three products to add with one tap: none already in the basket, none
       that needs a size chosen, in stock; first from the aisles the basket
       already has, best deal first. */
    suggestions() {
      if (!this.catalogue.length) return [];
      const aisles = new Set();
      for (const basket of this.getBaskets())
        for (const item of basket?.items || []) if (item.product?.category_id) aisles.add(item.product.category_id);
      const pick = this.catalogue
        .filter((product) => !this.inBasket.has(product.id) && !hasSizes(product) && product.quantity > 0)
        .map((product) => ({
          product,
          near: aisles.has(product.category_id) ? 1 : 0,
          off: product.discount && product.price ? product.discount / product.price : 0,
        }))
        .sort((a, b) => b.near - a.near || b.off - a.off || a.product.id - b.product.id);
      return pick.slice(0, SUGGESTED).map(({ product }) => product);
    },
  },

  created() {
    vendors().then((list) => {
      this.sellerNames = new Map(list.map((vendor) => [vendor.id, vendor.name]));
    });
    offers().then(({ shelfOf }) => {
      const seen = new Map();
      for (const shelf of shelfOf.values()) for (const product of shelf) if (!seen.has(product.id)) seen.set(product.id, product);
      this.catalogue = [...seen.values()];
    });
  },

  methods: {
    settling,

    image(product) {
      return productImage(product, true);
    },

    priceOf(product) {
      return priceOf(this.$shop, product, this.currency);
    },

    meta(item) {
      const seller = this.sellerNames.get(item.vendor_id);
      return [sizeOf(item.variant), seller].filter(Boolean).join(" · ");
    },

    typeName(type) {
      return this.$t(ProductType[type]?.name || type);
    },

    shown(item) {
      return shownCount(item.product || { id: item.product_id }, item);
    },

    max(item) {
      return item.vendor_product?.quantity ?? item.variant?.quantity ?? item.product?.quantity ?? 99;
    },

    step(item, delta) {
      const product = { id: item.product_id, type: item.product?.type };
      stepTo(this, product, item, this.shown(item) + delta);
    },

    /* Its "+" was pressed and the basket has not answered yet. */
    adding(product) {
      return !!pendingLine(product);
    },

    add(product) {
      quickAdd(this, product, (picked) => {
        this.$emit("close");
        this.$router.push(this.productRoute(picked.id));
      });
    },

    productRoute(id) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: id } };
    },

    checkoutRoute(type) {
      return { name: window.$storefront.routes.BASKET_PAGE, params: { type } };
    },
  },
};
</script>
