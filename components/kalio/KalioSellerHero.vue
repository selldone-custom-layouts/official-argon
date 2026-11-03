<!--
  Kalio — Seller hero.

  The top of a seller's storefront. Selldone's vendor header is one row: a
  small avatar beside the name. On a marketplace the seller is the reason a
  shopper came to this page, so Kalio gives them a band of their own — their
  mark, their name in the display face, their own description, and the way
  back to the whole market.

  Everything comes from the live vendor record. A seller without a
  description gets a neutral line, never invented copy about them.
-->
<template>
  <div class="k-wrap">
    <section :class="{ '-loading': busy }" class="k-seller-hero">
      <div class="k-seller-hero__mark">
        <img v-if="vendor && vendor.icon" :alt="vendor.name" :src="mark" height="132" width="132" />
        <v-icon v-else-if="!busy" size="40">storefront</v-icon>
      </div>

      <div class="k-seller-hero__copy">
        <p class="k-eyebrow">Seller on {{ shopTitle }}</p>
        <h1 class="k-seller-hero__name">{{ vendor ? vendor.name : " " }}</h1>
        <p class="k-seller-hero__lede">
          {{ vendor && vendor.description ? vendor.description : `An independent seller on ${shopTitle}.` }}
        </p>
        <router-link :to="homeRoute" class="k-btn k-btn--line">
          <v-icon class="k-flip" size="20">chevron_left</v-icon>
          All aisles
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import { vendorImage } from "./kalio-catalog";

export default {
  name: "KalioSellerHero",

  props: {
    vendorId: { type: [Number, String], required: true },
  },

  data() {
    return {
      vendor: null,
      busy: true,
    };
  },

  computed: {
    mark() {
      return vendorImage(this.vendor);
    },
    shopTitle() {
      return this.$store.getters.getShop?.title || "Kalio";
    },
    homeRoute() {
      return { name: window.$storefront.routes.SHOP_PAGE };
    },
  },

  watch: {
    vendorId() {
      this.fetch();
    },
  },

  mounted() {
    this.fetch();
  },

  methods: {
    fetch() {
      this.vendor = null;
      this.busy = true;
      window.$storefront.vendor
        .getVendor(this.vendorId)
        .then(({ vendor }) => {
          this.vendor = vendor || null;
        })
        .catch(() => {
          this.vendor = null;
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>
