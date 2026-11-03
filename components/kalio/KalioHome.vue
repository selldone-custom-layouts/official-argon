<!--
  Kalio — Home.

  The front of the marketplace, built like a big grocery front: a banner,
  every aisle, then rows of products — deals first, then each aisle in turn,
  with two aisle promos and the sellers set between them. Almost everything
  on the page is a product a shopper can add.

  It is shown on the bare shop page only. Any query — a search, a filter, a
  sort, "All products" — means the shopper wants the catalogue itself, and the
  shop page shows Selldone's listing instead.

  The aisle order comes from kalio-catalog's featured(): fresh, everyday
  aisles first, every other aisle after them in the merchant's order. Rows
  below the first two load as they approach the screen.
-->
<template>
  <div class="k-home">
    <kalio-hero />

    <kalio-aisle-ribbon />

    <kalio-rail
      :filter="{ only_has_discount: true }"
      :meta="`Marked down by ${shopTitle}’s sellers`"
      :more-to="dealsRoute"
      more-label="See all deals"
      sort="bestselling"
      title="Deals right now"
    />

    <kalio-rail
      v-for="aisle in leadAisles"
      :key="aisle.id"
      :dir="aisle.name"
      :more-to="aisleRoute(aisle)"
      :title="aisle.title || aisle.name"
      sort="bestselling"
    />

    <kalio-promo-pair :aisles="promoAisles" />

    <kalio-seller-cards />

    <kalio-rail
      v-for="aisle in laterAisles"
      :key="aisle.id"
      :dir="aisle.name"
      :more-to="aisleRoute(aisle)"
      :title="aisle.title || aisle.name"
      lazy
      sort="bestselling"
    />

    <div v-if="ordered.length" class="k-home__end k-wrap">
      <router-link :to="catalogueRoute" class="k-btn k-btn--line">
        Browse every product
        <v-icon class="k-flip" size="20">chevron_right</v-icon>
      </router-link>
    </div>
  </div>
</template>

<script>
import KalioHero from "./KalioHero.vue";
import KalioAisleRibbon from "./KalioAisleRibbon.vue";
import KalioRail from "./KalioRail.vue";
import KalioPromoPair from "./KalioPromoPair.vue";
import KalioSellerCards from "./KalioSellerCards.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute, featured } from "./kalio-catalog";

const LEAD_ROWS = 2;
const PROMO_PATTERN = /breakfast|cereal|snack/i;

export default {
  name: "KalioHome",
  components: { KalioHero, KalioAisleRibbon, KalioRail, KalioPromoPair, KalioSellerCards },

  data() {
    return {
      ordered: [],
    };
  },

  computed: {
    shopTitle() {
      return this.$store.getters.getShop?.title || "Kalio";
    },
    dealsRoute() {
      return dealsRoute();
    },
    catalogueRoute() {
      return catalogueRoute();
    },
    leadAisles() {
      return this.ordered.slice(0, LEAD_ROWS);
    },
    laterAisles() {
      return this.ordered.slice(LEAD_ROWS);
    },
    /* Breakfast and snacks when the shop has them; otherwise the next two
       featured aisles after the lead rows. */
    promoAisles() {
      const label = (aisle) => `${aisle.title || ""} ${aisle.name || ""}`;
      const known = this.ordered.filter((aisle) => PROMO_PATTERN.test(label(aisle)));
      return known.length >= 2 ? known.slice(0, 2) : this.ordered.slice(LEAD_ROWS, LEAD_ROWS + 2);
    },
  },

  mounted() {
    aisles().then((list) => (this.ordered = featured(list)));
  },

  methods: {
    aisleRoute,
  },
};
</script>
