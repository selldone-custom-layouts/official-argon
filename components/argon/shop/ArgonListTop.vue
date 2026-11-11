<!--
  Argon — the top of a results page, after a big catalogue store's: the
  crumbs, a small "Results for ‘…’ in…" line on a search, then the big
  title (the category, the search, Today's deals, a brand or All
  products) with the category's one-line description. On a search across
  the shop, the categories it was found in follow as chips. Today's deals
  says until when the deal prices hold (the deals' own end date). No
  product counts in the words (the filter row carries the result count).
-->
<template>
  <div class="ar-ltop">
    <nav :aria-label="t('pages.breadcrumb', 'Breadcrumb')" class="ar-crumbs">
      <router-link :to="{ path: '/' }">{{ t("pages.home", "Home") }}</router-link>
      <span aria-hidden="true" class="ms k-flip">chevron_right</span>
      <span aria-current="page">{{ crumb }}</span>
    </nav>

    <p v-if="search" class="ar-ltop__for">{{ t("argon.list.resultsFor", "Results for ‘{query}’ in…", { query: search }) }}</p>
    <h1 class="ar-ltop__t">{{ heading }}</h1>
    <p v-if="mode === 'aisle' && aisle && aisle.description" class="ar-ltop__d">{{ aisle.description }}</p>
    <p v-else-if="deals_page && dealsUntil" class="ar-ltop__d"><span class="ms">verified</span>{{ t("argon.home.dealsLocked", "Deal prices locked until {date}", { date: dealsUntil }) }}</p>

    <div v-if="mode !== 'aisle' && hits.length > 1" class="ar-inaisles">
      <span>{{ t("argon.list.foundIn", "Found in") }}</span>
      <router-link v-for="h in hits" :key="h.aisle.id" :to="h.to" class="ar-chip">{{ h.aisle.title || h.aisle.name }}</router-link>
    </div>
  </div>
</template>

<script>
import { catalogue, dealsEndDate, shortDate } from "../argon";
import { t } from "../../kalio/i18n/kalio-i18n";
import { aisleIndex } from "../../kalio/kalio-catalog";

export default {
  name: "ArgonListTop",
  inject: ["$shop"],

  props: {
    mode: { type: String, default: "aisle" },
    aisle: { type: Object, default: null },
    categoryName: { type: String, default: null },
    filter: { type: Object, default: null },
    products: { type: Array, default: () => [] },
  },

  data: () => ({ index: null, all: [] }),

  computed: {
    search() {
      return String(this.$route.query.search || "").trim();
    },
    deals() {
      return !!this.filter?.only_has_discount;
    },
    deals_page() {
      return this.deals && !this.search && this.mode !== "aisle";
    },
    dealsUntil() {
      return shortDate(dealsEndDate(this.$shop, this.all));
    },
    aisleName() {
      return this.aisle ? this.aisle.title || this.aisle.name : this.categoryName;
    },
    heading() {
      if (this.mode === "aisle") return this.aisleName;
      if (this.search) return t("argon.list.allCategories", "All categories");
      if (this.deals) return t("argon.menu.todaysDeals", "Today’s deals");
      /* A brand's page (the home's brand cards). */
      if (this.filter?.brands?.length === 1) return this.filter.brands[0];
      return t("argon.menu.allProducts", "All products");
    },
    crumb() {
      if (this.mode === "aisle") return this.aisleName;
      return this.search ? t("argon.search.go", "Search") : this.heading;
    },
    /* A search across the shop: the categories its results are in. */
    hits() {
      if (!this.index || !this.products.length || !this.search) return [];
      const by = new Map();
      for (const p of this.products) {
        const aisle = this.index.get(p.category_id);
        if (!aisle) continue;
        if (!by.has(aisle.id)) by.set(aisle.id, { aisle, n: 0 });
        by.get(aisle.id).n++;
      }
      return [...by.values()]
        .sort((a, b) => b.n - a.n)
        .slice(0, 8)
        .map((h) => ({
          aisle: h.aisle,
          to: { name: window.$storefront.routes.SHOP_CATEGORY_PAGE, params: { category_name: h.aisle.name }, query: { search: this.search } },
        }));
    },
  },

  mounted() {
    aisleIndex().then((index) => (this.index = index));
    catalogue().then((list) => (this.all = list));
  },
};
</script>
