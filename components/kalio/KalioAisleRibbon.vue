<!--
  Kalio — Aisle ribbon.

  The sixteen grocery aisles, read live from the shop's own root categories.
  Nothing about the list is hardcoded: a new aisle in the Selldone dashboard
  appears here, a removed one disappears, and a shop with no categories renders
  nothing at all rather than an empty heading.

  Counts are deliberately not shown. `category.products` is available and is a
  cached number; putting it on a tile invites "0 products" on an aisle that is
  simply being restocked.
-->
<template>
  <section v-if="aisles.length || busy" class="k-aisles">
    <div class="k-aisles__head">
      <p class="k-eyebrow">Shop the hall</p>
      <h2 class="k-aisles__title">Every aisle, one basket</h2>
    </div>

    <!-- Loading: the same tile geometry, so the row does not jump when data lands. -->
    <div v-if="busy" class="k-aisles__row" aria-hidden="true">
      <div v-for="n in 8" :key="'s' + n" class="k-aisle k-aisle--skeleton">
        <div class="k-aisle__art"></div>
        <div class="k-aisle__bar"></div>
      </div>
    </div>

    <div v-else class="k-aisles__row">
      <router-link
        v-for="aisle in aisles"
        :key="aisle.id"
        :to="aisleLink(aisle)"
        class="k-aisle"
      >
        <span class="k-aisle__art">
          <img
            v-if="aisle.icon"
            :alt="aisle.title || aisle.name"
            :src="icon(aisle)"
            height="96"
            loading="lazy"
            width="96"
          />
          <span v-else class="k-aisle__initial">{{ initial(aisle) }}</span>
        </span>
        <span class="k-aisle__label">{{ aisle.title || aisle.name }}</span>
      </router-link>
    </div>
  </section>
</template>

<script>
export default {
  name: "KalioAisleRibbon",

  props: {
    limit: { type: Number, default: 24 },
  },

  data() {
    return {
      aisles: [],
      busy: true,
    };
  },

  mounted() {
    this.fetch();
  },

  methods: {
    /* categories_only keeps the payload to the folder list: this row never
       needs products, and the catalog page fetches those anyway. */
    fetch() {
      this.busy = true;
      window.$storefront.products
        .list(null, 0, 1, { categories_only: true, categories_count: this.limit })
        .then(({ folders }) => {
          this.aisles = (folders || [])
            .filter((folder) => folder && folder.id)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        })
        .catch(() => {
          /* A failed aisle row must not take the page down with it: the row
             simply does not render, and the catalog remains reachable from the
             header. */
          this.aisles = [];
        })
        .finally(() => {
          this.busy = false;
        });
    },

    icon(aisle) {
      return window.CDN.GET_CATEGORY_ICON(aisle.id, 128);
    },

    initial(aisle) {
      return (aisle.title || aisle.name || "?").trim().charAt(0).toUpperCase();
    },

    aisleLink(aisle) {
      return {
        name: window.$storefront.routes.SHOP_CATEGORY_PAGE,
        params: { category_name: aisle.name },
      };
    },
  },
};
</script>
