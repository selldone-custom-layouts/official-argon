<!--
  - Copyright (c) 2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -->
<template>
  <!-- Argon 404 (digini-design/404-b.html): a bordered panel with a large
       404 (the 0 in blue), a search, quick ways out; then one row of
       departments and today's deals. -->
  <div class="ar-404">
    <section class="ar-404__panel ar-wrap">
      <div class="ar-404__in">
        <span aria-hidden="true" class="ar-404__big">4<em>0</em>4</span>
        <div class="ar-404__txt">
          <h1>We can't find that page</h1>
          <p>The link may be old, or the page has moved. Try a search or start from a department.</p>
          <form class="ar-search -big" role="search" @submit.prevent="go">
            <input v-model="q" aria-label="Search" enterkeyhint="search" placeholder="What can we help you find?" type="search" />
            <button aria-label="Search" class="ar-search__go" type="submit"><span class="ms">search</span></button>
          </form>
          <div class="ar-404__links">
            <span>Or go to</span>
            <router-link :to="deals" class="ar-chip">Today's deals</router-link>
            <router-link :to="newest" class="ar-chip">New arrivals</router-link>
            <router-link :to="{ name: r.HISTORY_ORDERS_PHYSICAL }" class="ar-chip">Track an order</router-link>
            <router-link :to="{ name: r.SHOP_CONTACT_US }" class="ar-chip">Help</router-link>
          </div>
        </div>
      </div>
    </section>

    <section v-if="cats.length" class="ar-sec ar-wrap">
      <header class="ar-head">
        <h2>Popular departments</h2>
        <router-link :to="catalogue" class="ar-more">All departments<span class="ms">chevron_right</span></router-link>
      </header>
      <div :style="{ '--cols': Math.min(8, cats.length) }" class="ar-depts -one">
        <router-link v-for="c in cats.slice(0, 8)" :key="c.id" :to="catTo(c)" class="ar-dtile">
          <span><img v-if="c.icon" :src="icon(c)" alt="" loading="lazy" /><span v-else class="ms">category</span></span>
          <b>{{ c.title || c.name }}</b>
        </router-link>
      </div>
    </section>

    <argon-row :filter="{ only_has_discount: true }" :limit="12" :more-to="deals" class="ar-wrap" more-label="See all deals" title="Today's deals" />
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
