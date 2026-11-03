<!--
  Kalio — Catalogue header.

  The top of the whole catalogue ("Every product", a search, the deals): what
  the shopper is looking at and how many products it holds, then the row of
  aisles. Selldone's catalogue opened on a column of tall aisle cards with
  no title and no count; the aisle row says the same in one line.

  The count is the listing's own total, passed in by the page.
-->
<template>
  <div class="k-aisle-page k-wrap">
    <header class="k-cat-head">
      <p class="k-eyebrow">{{ eyebrow }}</p>
      <h1 class="k-cat-head__title">{{ title }}</h1>
      <p v-if="total !== null" class="k-cat-head__count">
        {{ total.toLocaleString() }} {{ total === 1 ? "product" : "products" }}
      </p>
    </header>

    <nav v-if="list.length > 1" aria-label="Aisles" class="k-aisle-chips">
      <router-link
        v-for="item in list"
        :key="item.id"
        :style="{ '--k-tint': tintOf(item) }"
        :to="aisleRoute(item)"
        class="k-aisle-chip"
      >
        <img v-if="item.icon" :src="aisleImage(item, 64)" alt="" height="28" width="28" loading="lazy" />
        {{ item.title || item.name }}
      </router-link>
    </nav>
  </div>
</template>

<script>
import { aisleImage, aisleRoute, aisles, tintFor } from "./kalio-catalog";

export default {
  name: "KalioCatalogueHeader",
  inject: ["$shop"],

  props: {
    /** The listing's total for the current query; null until it is read. */
    total: { type: Number, default: null },
  },

  data() {
    return {
      list: [],
    };
  },

  computed: {
    search() {
      return String(this.$route.query.search || "").trim();
    },
    deals() {
      try {
        return !!JSON.parse(this.$route.query.filter || "{}").only_has_discount;
      } catch {
        return false;
      }
    },
    eyebrow() {
      if (this.search) return "Search results";
      if (this.deals) return "On offer";
      return `Everything at ${this.$shop?.title || "Kalio"}`;
    },
    title() {
      if (this.search) return `“${this.search}”`;
      if (this.deals) return "Today’s deals";
      return "All products";
    },
  },

  mounted() {
    aisles().then((list) => (this.list = list));
  },

  methods: {
    aisleImage,
    aisleRoute,
    tintOf: tintFor,
  },
};
</script>
