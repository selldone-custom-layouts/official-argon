<!--
  Walio — the cart under the header's cart button (drawer design B, given to
  Walio on 7 November 2026: kalio-design/tario-options/drawer-b.html).

  A small window right under the button, opened only by the button: each
  line's picture with its count, its name and seller, its price; then the
  subtotal, what the shopper saves and how far free shipping is, and View
  cart / Check out. Counts are changed on the cart page ("Edit cart").
  A phone keeps the side drawer.
-->
<template>
  <div class="w-mini">
    <header class="w-mini__h">
      <b>Cart<template v-if="group"> · {{ group.units }} {{ group.units === 1 ? "item" : "items" }}</template></b>
      <router-link v-if="group" :to="cartTo" class="w-mini__edit" @click="$emit('close')">Edit cart</router-link>
    </header>
    <template v-if="group">
      <ul class="w-mini__list">
        <li v-for="item in group.items" :key="item.id">
          <router-link :to="productTo(item)" class="w-mini__im" @click="$emit('close')">
            <img v-if="image(item)" :src="image(item)" alt="" />
            <i v-if="item.count > 1">{{ item.count }}</i>
          </router-link>
          <router-link :to="productTo(item)" class="w-mini__name" @click="$emit('close')">
            {{ item.product?.title }}
            <small v-if="sellerNames.get(item.vendor_id)">Sold by {{ sellerNames.get(item.vendor_id) }}</small>
          </router-link>
          <u-price :amount="item.price * item.count" :currency="item.currency" class="w-mini__price" />
        </li>
      </ul>
      <footer class="w-mini__f">
        <p class="w-mini__row"><span>Subtotal</span><u-price :amount="group.total" :currency="group.currency" /></p>
        <p v-if="group.saved >= 0.01 || free_left > 0" class="w-mini__note">
          <template v-if="group.saved >= 0.01">You save <u-price :amount="group.saved" :currency="group.currency" /></template>
          <template v-if="group.saved >= 0.01 && free_left > 0"> · </template>
          <template v-if="free_left > 0"><u-price :amount="free_left" :currency="group.currency" /> away from free shipping</template>
        </p>
        <div class="w-mini__btns">
          <router-link :to="cartTo" class="t-btn -line" @click="$emit('close')">View cart</router-link>
          <router-link :to="cartTo" class="t-btn -main" @click="$emit('close')">Check out</router-link>
        </div>
      </footer>
    </template>
    <div v-else class="w-mini__empty">
      <v-icon size="30">shopping_cart</v-icon>
      <p>Your cart is empty</p>
      <router-link :to="deals" class="t-btn -main" @click="$emit('close')">Shop today’s deals</router-link>
    </div>
  </div>
</template>

<script>
import { productImage, vendors, dealsRoute } from "../kalio/kalio-catalog";
import { freeShippingFrom } from "./walio-home";

export default {
  name: "WalioMiniCart",
  emits: ["close"],

  data() {
    return { sellerNames: new Map() };
  },

  computed: {
    /* The groceries basket (the physical one), as the drawer reads it. */
    group() {
      const basket = this.getBaskets().find((b) => b?.items?.length && b.type === "PHYSICAL") || this.getBaskets().find((b) => b?.items?.length);
      if (!basket) return null;
      const bill = basket.bill || {};
      return {
        type: basket.type,
        items: basket.items,
        units: basket.items.reduce((sum, item) => sum + (item.count || 0), 0),
        total: typeof bill.price === "number" ? bill.price : basket.price,
        saved: basket.items.reduce((sum, item) => sum + (item.dis || 0) * (item.count || 0) + (item.offer_amount || 0), 0),
        currency: bill.currency || basket.currency,
      };
    },
    free_left() {
      const rule = freeShippingFrom(this.getShop());
      return rule && this.group ? Math.max(0, rule.amount - this.group.total) : 0;
    },
    cartTo() {
      return { name: window.$storefront.routes.BASKET_PAGE, params: { type: this.group?.type || "PHYSICAL" } };
    },
    deals() {
      return dealsRoute();
    },
  },

  created() {
    vendors().then((list) => (this.sellerNames = new Map(list.map((v) => [v.id, v.name]))));
  },

  methods: {
    image(item) {
      return productImage(item.product, true);
    },
    productTo(item) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: item.product_id } };
    },
  },
};
</script>
