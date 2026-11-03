<!--
  Kalio — Aisle header.

  The top of a category page: the aisle's title, its description and its
  picture on the aisle's own tint, all from the live category record, with a
  row of every aisle beneath it so a shopper can step to the next aisle
  without going back to the front. Selldone's default category page opens
  straight onto a breadcrumb and a grid.

  The record is fetched with with_parent on a one-product page of that
  aisle, which returns the category itself as "parent". A stale link with no
  record renders nothing, and the listing below shows its own empty state.
-->
<template>
  <div class="k-aisle-page k-wrap">
    <header v-if="aisle" :style="{ '--k-tint': tint }" class="k-aisle-head">
      <div class="k-aisle-head__copy">
        <router-link :to="homeRoute" class="k-aisle-head__back">
          <v-icon class="k-flip" size="18">chevron_left</v-icon>
          All aisles
        </router-link>
        <p class="k-eyebrow">Aisle</p>
        <h1 class="k-aisle-head__title">{{ aisle.title || aisle.name }}</h1>
        <p v-if="aisle.description" class="k-aisle-head__lede">{{ aisle.description }}</p>
      </div>
      <div v-if="aisle.icon" aria-hidden="true" class="k-aisle-head__art">
        <img :src="image" alt="" height="200" width="200" />
      </div>
    </header>
    <div v-else-if="busy" aria-hidden="true" class="k-aisle-head -loading"></div>

    <nav v-if="list.length > 1" aria-label="Aisles" class="k-aisle-chips">
      <router-link
        v-for="item in list"
        :key="item.id"
        :aria-current="item.name === categoryName ? 'page' : undefined"
        :class="{ '-on': item.name === categoryName }"
        :style="{ '--k-tint': tintOf(item) }"
        :to="route(item)"
        class="k-aisle-chip"
      >
        <img v-if="item.icon" :src="chipImage(item)" alt="" height="28" width="28" loading="lazy" />
        {{ item.title || item.name }}
      </router-link>
    </nav>
  </div>
</template>

<script>
import { aisleImage, aisleRoute, aisles, tintFor } from "./kalio-catalog";

export default {
  name: "KalioAisleHeader",

  props: {
    categoryName: { type: String, required: true },
  },

  data() {
    return {
      aisle: null,
      busy: true,
      list: [],
    };
  },

  computed: {
    image() {
      return aisleImage(this.aisle, 256);
    },
    tint() {
      return tintFor(this.aisle);
    },
    homeRoute() {
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
    aisles().then((list) => (this.list = list));
  },

  methods: {
    route: aisleRoute,
    tintOf: tintFor,
    chipImage(item) {
      return aisleImage(item, 64);
    },

    fetch() {
      this.aisle = null;
      this.busy = true;
      window.$storefront.products
        .list(this.categoryName, 0, 1, { with_parent: true, products_only: true })
        .then(({ parent }) => {
          this.aisle = parent && parent.id ? parent : null;
        })
        .catch(() => {
          this.aisle = null;
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>
