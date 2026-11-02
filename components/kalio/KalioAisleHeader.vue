<!--
  Kalio — Aisle header.

  The top of a category page: the aisle's own title in the display face, its
  description, and its image on a paper disc, all from the live category
  record. Selldone's default category page opens straight onto a breadcrumb
  and the grid; a grocery aisle deserves a sign over it.

  The record is fetched with with_parent on a one-product page of that aisle,
  which returns the category itself as "parent". If the aisle has no record
  (a stale link), the header renders nothing and the listing below handles
  the empty state as it always has.
-->
<template>
  <header v-if="aisle" class="k-aisle-head">
    <div class="k-aisle-head__copy">
      <router-link :to="shopRoute" class="k-aisle-head__back">
        <v-icon size="16">arrow_back</v-icon>
        All aisles
      </router-link>
      <p class="k-eyebrow">Aisle</p>
      <h1 class="k-aisle-head__title">{{ aisle.title || aisle.name }}</h1>
      <p v-if="aisle.description" class="k-aisle-head__lede">
        {{ aisle.description }}
      </p>
    </div>
    <div v-if="aisle.icon" class="k-aisle-head__art" aria-hidden="true">
      <img :src="icon" alt="" height="200" width="200" />
    </div>
  </header>
</template>

<script>
export default {
  name: "KalioAisleHeader",

  props: {
    categoryName: { type: String, required: true },
  },

  data() {
    return {
      aisle: null,
    };
  },

  computed: {
    icon() {
      return this.aisle ? window.CDN.GET_CATEGORY_ICON(this.aisle.id, 256) : null;
    },
    shopRoute() {
      return { name: window.$storefront.routes.SHOP_PAGE };
    },
  },

  watch: {
    categoryName() {
      this.fetch();
    },
  },

  mounted() {
    this.fetch();
  },

  methods: {
    fetch() {
      this.aisle = null;
      window.$storefront.products
        .list(this.categoryName, 0, 1, { with_parent: true, products_only: true })
        .then(({ parent }) => {
          this.aisle = parent && parent.id ? parent : null;
        })
        .catch(() => {
          this.aisle = null;
        });
    },
  },
};
</script>
