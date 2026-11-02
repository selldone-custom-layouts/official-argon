<!--
  Kalio — Seller hero.

  The top of a seller's storefront. Selldone's vendor header is a single row:
  a small avatar beside the name in bold. On a marketplace the seller is the
  reason a shopper came to this page, so Kalio gives them a band: the seller
  mark in a paper ring, the name in the display face, their own description,
  and the way back to the whole market.

  Everything comes from the live vendor record. A seller without a
  description gets a neutral line rather than invented copy about them.
-->
<template>
  <section class="k-seller-hero" :class="{ 'is-loading': !vendor }">
    <div class="k-seller-hero__mark">
      <img
        v-if="vendor && vendor.icon"
        :alt="vendor.name"
        :src="icon"
        height="132"
        width="132"
      />
      <v-icon v-else size="40">storefront</v-icon>
    </div>

    <div class="k-seller-hero__copy">
      <p class="k-eyebrow k-eyebrow--onink">Seller at {{ shopTitle }}</p>
      <h1 class="k-seller-hero__name">{{ vendor ? vendor.name : "\u00a0" }}</h1>
      <p class="k-seller-hero__lede">
        {{
          vendor && vendor.description
            ? vendor.description
            : "An independent seller in the " + shopTitle + " market hall."
        }}
      </p>
      <router-link :to="shopRoute" class="k-btn k-btn--ghost">
        Back to every aisle
      </router-link>
    </div>
  </section>
</template>

<script>
export default {
  name: "KalioSellerHero",

  props: {
    vendorId: { type: [Number, String], required: true },
  },

  data() {
    return {
      vendor: null,
    };
  },

  computed: {
    icon() {
      return this.vendor?.icon
        ? window.CDN.GET_SHOP_IMAGE_PATH(this.vendor.icon, 256)
        : null;
    },
    shopTitle() {
      return this.$store.getters.getShop?.title || "Kalio";
    },
    shopRoute() {
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
      window.$storefront.vendor
        .getVendor(this.vendorId)
        .then(({ vendor }) => {
          this.vendor = vendor || null;
        })
        .catch(() => {
          this.vendor = null;
        });
    },
  },
};
</script>
