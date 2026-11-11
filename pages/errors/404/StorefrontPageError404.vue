<!--
  - Copyright (c) 2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -->
<template>
  <!-- Argon 404: a friendly panel with a large 404 (the 0 in the brand
       colour), a search, quick ways out; then every category as a tile
       (the home's tiles) and today's deals. -->
  <div class="ar-404">
    <section class="ar-404__panel ar-wrap">
      <div class="ar-404__in">
        <span aria-hidden="true" class="ar-404__big">4<em>0</em>4</span>
        <div class="ar-404__txt">
          <h1>{{ t("argon.404.title", "We can't find that page") }}</h1>
          <p>{{ t("argon.404.text", "The link may be old, or the page has moved. Try a search or start from a department.") }}</p>
          <form class="ar-search -big" role="search" @submit.prevent="go">
            <span aria-hidden="true" class="ms ar-search__ic">search</span>
            <input v-model="q" :aria-label="t('argon.search.go', 'Search')" :placeholder="t('argon.404.placeholder', 'What can we help you find?')" enterkeyhint="search" type="search" />
            <button :aria-label="t('argon.search.go', 'Search')" class="ar-search__go" type="submit"><span class="ms">search</span></button>
          </form>
          <div class="ar-404__links">
            <span>{{ t("argon.404.orGo", "Or go to") }}</span>
            <router-link :to="deals" class="ar-chip">{{ t("argon.menu.todaysDeals", "Today’s deals") }}</router-link>
            <router-link :to="newest" class="ar-chip">{{ t("argon.menu.newArrivals", "New arrivals") }}</router-link>
            <router-link :to="{ name: r.HISTORY_ORDERS_PHYSICAL }" class="ar-chip">{{ t("argon.footer.trackOrder", "Track an order") }}</router-link>
            <router-link :to="{ name: r.SHOP_CONTACT_US }" class="ar-chip">{{ t("argon.header.help", "Help") }}</router-link>
          </div>
        </div>
      </div>
    </section>

    <section v-if="cats.length" class="ar-sec ar-wrap">
      <header class="ar-head">
        <h2>{{ t("argon.menu.shopByCategory", "Shop by category") }}</h2>
        <router-link :to="catalogue" class="ar-more">{{ t("argon.menu.allProducts", "All products") }}<span class="ms k-flip">chevron_right</span></router-link>
      </header>
      <div class="ar-404__cats">
        <router-link v-for="c in cats.slice(0, 15)" :key="c.id" :to="catTo(c)" class="ar-cat">
          <span class="ar-cat__tile"><img v-if="c.icon" :src="icon(c)" alt="" loading="lazy" /><span v-else class="ms">category</span></span>
          <span class="ar-cat__t">{{ c.title || c.name }}</span>
        </router-link>
        <!-- Full rows only (the owner's rule): an "All products" tile evens them out. -->
        <router-link v-if="cats.length % 2 === 1 || cats.length > 15" :to="catalogue" class="ar-cat -all">
          <span class="ar-cat__tile"><span class="ms">grid_view</span></span>
          <span class="ar-cat__t">{{ t("argon.menu.allProducts", "All products") }}</span>
        </router-link>
      </div>
    </section>

    <argon-row :filter="{ only_has_discount: true }" :limit="12" :more-to="deals" class="ar-wrap" :more-label="t('argon.common.seeAllDeals', 'See all deals')" :title="t('argon.menu.todaysDeals', 'Today’s deals')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ArgonRow from "../../../components/argon/ArgonRow.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../../components/kalio/kalio-catalog";

export default defineComponent({
  name: "StorefrontPageError404",
  components: { ArgonRow },
  data: () => ({ q: "", cats: [] as any[] }),
  computed: {
    r(): any {
      return (window as any).$storefront.routes;
    },
    deals() {
      return dealsRoute();
    },
    newest() {
      return catalogueRoute({ sort: "newest" });
    },
    catalogue() {
      return catalogueRoute();
    },
  },
  mounted() {
    aisles().then((list) => (this.cats = list));
  },
  methods: {
    catTo(c: any) {
      return aisleRoute(c);
    },
    icon(c: any) {
      return (window as any).CDN.GET_CATEGORY_ICON(c.id, 256);
    },
    go() {
      const text = this.q.trim();
      this.$router.push(text ? { name: this.r.SHOP_PAGE, query: { search: text } } : catalogueRoute());
    },
  },
});
</script>
