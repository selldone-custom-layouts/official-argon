<!--
  Kalio — Catalogue header.

  The top of the whole catalogue ("Every product", a search, the deals), in
  the shelf head (KalioShelfHead): what the shopper is looking at and how
  many products it holds, then the row of aisles with "All products" first.
  Selldone's catalogue opened on a column of tall aisle cards with no title
  and no count.

  The count is the listing's own total, passed in by the page.
-->
<template>
  <kalio-shelf-head :crumbs="crumbs" :eyebrow="eyebrow" :meta="meta" :tabs="tabs" :title="title" />
</template>

<script>
import KalioShelfHead from "./KalioShelfHead.vue";
import { aisleRoute, aisles, catalogueRoute } from "./kalio-catalog";

export default {
  name: "KalioCatalogueHeader",
  components: { KalioShelfHead },
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
      return null;
    },
    title() {
      if (this.search) return `“${this.search}”`;
      if (this.deals) return "Today’s deals";
      return "All products";
    },
    crumbs() {
      return [
        { label: this.$shop?.title || "Kalio", to: { name: window.$storefront.routes.SHOP_PAGE } },
        { label: this.search ? "Search" : this.title },
      ];
    },
    meta() {
      if (this.total === null) return null;
      return `${this.total.toLocaleString()} ${this.total === 1 ? "product" : "products"}`;
    },
    tabs() {
      if (!this.list.length) return [];
      return [
        { key: "all", label: "All products", to: catalogueRoute(), on: !this.search && !this.deals },
        ...this.list.map((item) => ({ key: item.id, label: item.title || item.name, to: aisleRoute(item) })),
      ];
    },
  },

  mounted() {
    aisles().then((list) => (this.list = list));
  },
};
</script>
