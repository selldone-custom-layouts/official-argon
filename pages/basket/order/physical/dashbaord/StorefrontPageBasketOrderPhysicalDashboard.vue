<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<!--
  Kalio — a physical order's page (design C, 4 November 2026,
  ../kalio-design/basket-flow-options/): a word on where the order stands
  with its number, the invoice and a share link; its steps (placed,
  confirmed, packing, sent, received) as a line; the items by seller; then
  Selldone's own widgets, in Kalio's cards: payment (which also pays an
  order still waiting for it), delivery, the chat with the shop, the
  sellers' own orders and returns.
-->
<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="k-order__page">
    <section :class="`-${tone}`" class="k-order__hero">
      <span aria-hidden="true" class="k-order__mark"><v-icon size="30">{{ toneIcon }}</v-icon></span>
      <div class="k-order__words">
        <h1>{{ heroTitle }}</h1>
        <p>
          Order <b>{{ getBasketOrderCode(basket) }}</b>
          <template v-if="placedAt"> · {{ placedAt }}</template>
          <template v-if="heroNote"> · {{ heroNote }}</template>
        </p>
        <p v-if="basket.subscription_id" class="k-order__sub">
          From the subscription
          <router-link :to="{ name: 'MySubscriptionOrderInfoPage', params: { basket_id: basket.subscription_id } }">SN-{{ basket.subscription_id }}</router-link>
        </p>
      </div>
      <div class="k-order__acts">
        <button :disabled="busy_invoice" class="k-order__btn" type="button" @click="downloadInvoice">
          <v-progress-circular v-if="busy_invoice" indeterminate size="16" width="2" />
          <v-icon v-else size="18">download</v-icon>Invoice
        </button>
        <s-shop-share-order-button :basket="basket" class="k-order__share"></s-shop-share-order-button>
      </div>
    </section>

    <ol v-if="tone !== 'off'" aria-label="Order progress" class="k-order__track">
      <li
        v-for="(state, i) in states"
        :key="state.code"
        :class="{ '-done': i < stateIndex || (i === stateIndex && i === states.length - 1), '-now': i === stateIndex && i < states.length - 1 }"
        class="k-order__step"
      >
        <i aria-hidden="true"><v-icon v-if="i < stateIndex || (i === stateIndex && i === states.length - 1)" size="15">check</v-icon></i>
        <b>{{ $t(state.name) }}</b>
      </li>
    </ol>

    <div class="k-order__grid">
      <div class="k-order__main">
        <div class="k-lines -read">
          <section v-for="group in groups" :key="group.key" class="k-lines__seller">
            <header class="k-lines__head">
              <img v-if="group.logo" :src="group.logo" alt="" class="k-lines__logo" height="36" width="36" />
              <span v-else aria-hidden="true" class="k-lines__logo -shop"><v-icon size="18">storefront</v-icon></span>
              <span class="k-lines__who">
                <b class="k-lines__name">{{ group.name }}</b>
                <small>{{ group.units }} {{ group.units === 1 ? "item" : "items" }}</small>
              </span>
              <u-price :amount="group.subtotal" :currency="basket.currency" class="k-lines__subtotal" />
            </header>
            <div v-for="item in group.items" :key="item.id" class="k-lines__line">
              <router-link :to="productRoute(item.product_id)" class="k-lines__pic">
                <img v-if="image(item)" :src="image(item)" alt="" height="44" loading="lazy" width="44" />
              </router-link>
              <div class="k-lines__text">
                <router-link :to="productRoute(item.product_id)" class="k-lines__title">{{ item.product?.title }}</router-link>
                <small>
                  {{ [size(item), `${item.count} × `].filter(Boolean).join(" · ") }}<u-price :amount="item.price" :currency="basket.currency" />
                </small>
              </div>
              <p class="k-lines__price">
                <u-price :amount="item.price * item.count - (item.offer_amount || 0)" :currency="basket.currency" />
              </p>
            </div>
          </section>
        </div>

        <s-shop-customer-order-payment-widget
          :order="basket"
          class="k-order__box"
          @request:refresh="$emit('request:refresh')"
        ></s-shop-customer-order-payment-widget>
        <s-basket-vendor-orders :basket="basket" class="k-order__box"></s-basket-vendor-orders>
        <s-shop-customer-delivery-info-widget :basket="basket" class="k-order__box"></s-shop-customer-delivery-info-widget>
        <s-order-chat-widget :basket="basket" class="k-order__box"></s-order-chat-widget>
        <s-order-basket-return :basket="basket" class="k-order__box" />
      </div>

      <aside class="k-order__side">
        <div class="k-cart__receipt k-order__receipt">
          <p class="k-eyebrow">{{ paidWord }} · {{ units }} {{ units === 1 ? "item" : "items" }}</p>
          <div class="k-cart__top">
            <p class="k-cart__total"><u-price :amount="total" :currency="basket.currency" /></p>
            <span :class="`-${tone}`" class="k-order__pill">{{ pillWord }}</span>
          </div>
          <div class="k-cart__rows">
            <p class="k-cart__row"><span>Items ({{ units }})</span><u-price :amount="itemsBefore" :currency="basket.currency" /></p>
            <p v-if="saved >= 0.01" class="k-cart__row -save">
              <span>You saved</span><span>−<u-price :amount="saved" :currency="basket.currency" /></span>
            </p>
            <p v-if="basket.discount > 0" class="k-cart__row -save">
              <span>Discount</span><span>−<u-price :amount="basket.discount" :currency="basket.currency" /></span>
            </p>
            <p :class="{ '-free': basket.delivery_price === 0 }" class="k-cart__row">
              <span>Delivery</span>
              <u-price v-if="basket.delivery_price > 0" :amount="basket.delivery_price" :currency="basket.currency" />
              <span v-else-if="basket.delivery_price === 0">Free</span>
              <span v-else>Paid on delivery</span>
            </p>
            <p v-if="basket.tax > 0" class="k-cart__row">
              <span>Tax{{ basket.tax_included ? " (included)" : "" }}</span><u-price :amount="basket.tax" :currency="basket.currency" />
            </p>
          </div>
          <p v-if="basket.payment?.gateway" class="k-order__paidby">
            <img v-if="basket.payment.gateway.icon" :src="getShopImagePath(basket.payment.gateway.icon)" alt="" height="22" width="22" />
            {{ tone === "ok" ? "Paid with" : "Paying with" }} {{ basket.payment.gateway.name }}
          </p>
        </div>
        <router-link :to="{ name: window.$storefront.routes.SHOP_PAGE }" class="k-order__more">
          <v-icon size="18">shopping_bag</v-icon>Keep shopping
        </router-link>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import SOrderBasketReturn from "@selldone/components-vue/storefront/order/basket/return/SOrderBasketReturn.vue";
import SShopCustomerOrderPaymentWidget from "@selldone/components-vue/storefront/order/payment/SShopCustomerOrderPaymentWidget.vue";
import SShopCustomerDeliveryInfoWidget from "@selldone/components-vue/storefront/order/delivery/SShopCustomerDeliveryInfoWidget.vue";

import SShopShareOrderButton from "@selldone/components-vue/storefront/order/share-order/SShopShareOrderButton.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SOrderChatWidget from "@selldone/components-vue/storefront/order/chat/widget/SOrderChatWidget.vue";
import SBasketVendorOrders from "@selldone/components-vue/storefront/order/vendor-order/SBasketVendorOrders.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { Basket } from "@selldone/core-js";
import { productImage, vendorImage, vendors } from "../../../../../components/kalio/kalio-catalog";

/* The size of a variant in words: its volume, weight, pack, colour or style. */
function sizeOf(variant) {
  if (!variant) return null;
  return variant.volume || variant.weight || variant.pack || variant.type || variant.style || null;
}

export default {
  name: "StorefrontPageBasketOrderPhysicalDashboard",
  components: {
    SBasketVendorOrders: SBasketVendorOrders,
    SOrderChatWidget,
    SShopShareOrderButton,
    SShopCustomerDeliveryInfoWidget,
    SShopCustomerOrderPaymentWidget,
    SOrderBasketReturn,
  },

  emits: ["request:refresh"],

  props: {
    basket: {
      type: Object,
      require: true,
    },
  },

  data: function () {
    return {
      ProductType: ProductType,

      orderType: ProductType.PHYSICAL,
      busy_invoice: false,
      sellers: new Map(),
    };
  },
  computed: {
    shop() {
      return this.getShop();
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Kalio ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    states() {
      return Object.values(Basket.PhysicalOrderStates || {});
    },
    stateIndex() {
      const at = this.states.findIndex((state) => state.code === this.basket?.delivery_state);
      return at < 0 ? 0 : at;
    },
    /** ok: paid or paying on delivery · wait: not paid yet · off: cancelled */
    tone() {
      const status = this.basket?.status;
      if (status === "Canceled") return "off";
      if (status === "Payed" || status === "COD") return "ok";
      return "wait";
    },
    toneIcon() {
      return { ok: "check", wait: "schedule", off: "close" }[this.tone];
    },
    heroTitle() {
      if (this.tone === "off") return "This order was cancelled";
      if (this.tone === "wait") return this.basket?.status === "Reserved" ? "Your order is waiting for payment" : "This order is not paid yet";
      if (this.stateIndex === this.states.length - 1) return "Your order has reached you";
      return "Thank you, your order is in";
    },
    heroNote() {
      if (this.tone !== "ok") return null;
      const state = this.states[this.stateIndex];
      return state ? this.$t(state.name) : null;
    },
    units() {
      return (this.basket?.items || []).reduce((sum, item) => sum + (item.count || 0), 0);
    },
    /** The items at their prices before the sellers' discounts. */
    itemsBefore() {
      return (this.basket?.items || []).reduce((sum, item) => sum + ((item.price || 0) + (item.dis || 0)) * (item.count || 0), 0);
    },
    saved() {
      return (this.basket?.items || []).reduce((sum, item) => sum + (item.dis || 0) * (item.count || 0) + (item.offer_amount || 0), 0);
    },
    /** What the order costs: the amount paid when there is a payment,
     *  else the order's price with delivery and any tax on top. */
    total() {
      const b = this.basket || {};
      if (b.payment?.amount) return b.payment.amount;
      return (b.price || 0) + (b.delivery_price > 0 ? b.delivery_price : 0) + (b.tax_included ? 0 : b.tax || 0) + (b.tax_shipping || 0);
    },
    paidWord() {
      return { ok: this.basket?.status === "COD" ? "To pay on delivery" : "Paid", wait: "To pay", off: "Cancelled" }[this.tone];
    },
    pillWord() {
      return { ok: this.basket?.status === "COD" ? "On delivery" : "Paid", wait: "Waiting", off: "Cancelled" }[this.tone];
    },
    placedAt() {
      const at = this.basket?.reserved_at || this.basket?.created_at;
      if (!at) return null;
      return new Date(at).toLocaleString(this.$i18n?.locale || "en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    },
    /* The items by seller, as the basket page shows them. */
    groups() {
      const groups = new Map();
      for (const item of this.basket?.items || []) {
        const key = item.vendor_id || 0;
        if (!groups.has(key)) {
          const vendor = this.sellers.get(item.vendor_id);
          groups.set(key, {
            key,
            name: vendor?.name || this.shop?.title || "",
            logo: vendor ? vendorImage(vendor, true) : null,
            items: [],
            units: 0,
            subtotal: 0,
          });
        }
        const group = groups.get(key);
        group.items.push(item);
        group.units += item.count || 0;
        group.subtotal += (item.price || 0) * (item.count || 0) - (item.offer_amount || 0);
      }
      return [...groups.values()];
    },
  },
  created() {
    vendors().then((list) => {
      this.sellers = new Map(list.map((vendor) => [vendor.id, vendor]));
    });
  },
  methods: {
    image(item) {
      if (item.variant?.image) return window.CDN.GET_SHOP_IMAGE_PATH(item.variant.image, 128);
      return productImage(item.product, true);
    },
    size(item) {
      return sizeOf(item.variant);
    },
    productRoute(id) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: id } };
    },

    downloadInvoice() {
      this.busy_invoice = true;

      axios
        .get(
          window.XAPI.GET_ORDER_BASKET_RECEIPT(
            this.shop.name,
            this.basket.id,
          ),
          {
            params: {
              code: this.basket.code || undefined,
              signature: this.$route.query.signature,
              timestamp: this.$route.query.timestamp,
            },
            responseType: "blob",
          },
        )
        .then(({ data }) => {
          const download_url = window.URL.createObjectURL(
            new Blob([data], { type: "application/pdf" }),
          );
          const link = document.createElement("a");
          link.href = download_url;
          link.download = `${this.getBasketOrderCode(this.basket)}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(
            () => window.URL.revokeObjectURL(download_url),
            0,
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_invoice = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
