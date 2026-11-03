<!--
  Kalio — Aisle promos.

  Two wide tiles in the middle of the home page, each sending a shopper into
  one aisle with three of its products in the picture. The aisles are passed
  in by the home page; the headline is a short grocer's line for aisles Kalio
  knows (breakfast, snacks, …) and the aisle's own title for any other, so a
  new aisle still gets a correct tile.
-->
<template>
  <section v-if="cards.length" aria-label="Aisle picks" class="k-promos k-wrap">
    <router-link
      v-for="(card, i) in cards"
      :key="card.aisle.id"
      :class="i % 2 ? '-mint' : '-sun'"
      :to="card.to"
      class="k-promo"
    >
      <span class="k-promo__copy">
        <span class="k-eyebrow">{{ card.aisle.title || card.aisle.name }}</span>
        <span class="k-promo__title">{{ card.headline }}</span>
        <span class="k-promo__go">
          Shop {{ (card.aisle.title || card.aisle.name).toLowerCase() }}
          <v-icon class="k-flip" size="18">chevron_right</v-icon>
        </span>
      </span>
      <span aria-hidden="true" class="k-promo__pics">
        <img v-for="product in card.pics" :key="product.id" :src="picture(product)" alt="" loading="lazy" />
      </span>
    </router-link>
  </section>
</template>

<script>
import { aisleRoute, productImage } from "./kalio-catalog";

const HEADLINES = [
  [/breakfast|cereal/i, "Breakfast, sorted"],
  [/snack/i, "The snack drawer"],
  [/produce|fruit|veg/i, "Picked for the week"],
  [/dairy|egg|milk/i, "Fridge, restocked"],
  [/bread|bakery/i, "Fresh from the oven"],
  [/pantry/i, "Stock the cupboard"],
  [/beverage|drink/i, "Something to sip"],
  [/frozen/i, "Ready when you are"],
];

export default {
  name: "KalioPromoPair",

  props: {
    aisles: { type: Array, default: () => [] },
  },

  data() {
    return {
      cards: [],
    };
  },

  watch: {
    aisles: {
      handler() {
        this.build();
      },
      immediate: true,
    },
  },

  methods: {
    picture(product) {
      return productImage(product);
    },

    headline(aisle) {
      const label = `${aisle.title || ""} ${aisle.name || ""}`;
      const hit = HEADLINES.find(([pattern]) => pattern.test(label));
      return hit ? hit[1] : aisle.title || aisle.name;
    },

    build() {
      const pair = this.aisles.slice(0, 2);
      Promise.all(
        pair.map((aisle) =>
          window.$storefront.products
            .list(aisle.name, 0, 3, { products_only: true, available: true, sort: "bestselling" })
            .then(({ products }) => (products || []).filter((product) => product.icon))
            .catch(() => []),
        ),
      ).then((lists) => {
        this.cards = pair
          .map((aisle, i) => ({
            aisle,
            headline: this.headline(aisle),
            to: aisleRoute(aisle),
            pics: lists[i],
          }))
          .filter((card) => card.pics.length);
      });
    },
  },
};
</script>
