<!--
  Kalio — Seller hero.

  The top of a seller's storefront. Selldone's vendor header is one row: a
  small avatar beside the name. On a marketplace the seller is the reason a
  shopper came to this page, so Kalio gives them a storefront sign: their
  mark, their name in the display face, their own description, the aisles
  they sell in (each jumps to that aisle's row further down), and a stall
  of their own products.

  Everything comes from live records: the vendor, and the seller's own
  product list. A seller without a description gets a neutral line, never
  invented copy about them; no counts are shown.
-->
<template>
  <div class="k-wrap">
    <section :class="{ '-loading': busy }" aria-labelledby="k-seller-name" class="k-seller-hero">
      <div class="k-seller-hero__main">
        <div class="k-seller-hero__mark">
          <img v-if="vendor && vendor.icon" :alt="vendor.name" :src="mark" height="132" width="132" />
          <v-icon v-else-if="!busy" size="40">storefront</v-icon>
        </div>

        <div class="k-seller-hero__copy">
          <p class="k-eyebrow">Seller on {{ shopTitle }}</p>
          <h1 id="k-seller-name" class="k-seller-hero__name">{{ vendor ? vendor.name : " " }}</h1>
          <p class="k-seller-hero__lede">
            {{ vendor && vendor.description ? vendor.description : `An independent seller on ${shopTitle}.` }}
          </p>

          <nav v-if="sellsIn.length" aria-label="Aisles this seller sells in" class="k-seller-hero__aisles">
            <a
              v-for="aisle in shownAisles"
              :key="aisle.id"
              :href="`#k-seller-aisle-${aisle.id}`"
              :style="{ '--k-tint': tint(aisle) }"
              class="k-seller-hero__aisle"
              @click.prevent="jump(aisle)"
            >
              <img v-if="aisle.icon" :src="aisleImage(aisle, 64)" alt="" height="24" width="24" />
              {{ aisle.title || aisle.name }}
            </a>
            <button
              v-if="sellsIn.length > shownAisles.length"
              class="k-seller-hero__aisle -more"
              type="button"
              @click="all_aisles = true"
            >
              +{{ sellsIn.length - shownAisles.length }} more
            </button>
          </nav>

          <div class="k-seller-hero__acts">
            <router-link :to="homeRoute" class="k-btn k-btn--line">
              <v-icon class="k-flip" size="20">chevron_left</v-icon>
              All aisles
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="stall.length" aria-hidden="true" class="k-seller-hero__stall">
        <span v-for="(product, i) in stall" :key="product.id" :class="`-at${i}`" class="k-seller-hero__disc">
          <img :src="picture(product)" alt="" />
        </span>
      </div>
    </section>
  </div>
</template>

<script>
import { aisleImage, aisleIndex, featured, offers, productImage, tintFor, vendorImage } from "./kalio-catalog";

export default {
  name: "KalioSellerHero",

  props: {
    vendorId: { type: [Number, String], required: true },
  },

  data() {
    return {
      vendor: null,
      busy: true,
      sellsIn: [],
      stall: [],
      all_aisles: false,
    };
  },

  computed: {
    /* A seller in every aisle would fill the sign with chips; six, then a
       button for the rest. */
    shownAisles() {
      return this.all_aisles ? this.sellsIn : this.sellsIn.slice(0, 6);
    },
    mark() {
      return vendorImage(this.vendor);
    },
    shopTitle() {
      return this.$store.getters.getShop?.title || "Kalio";
    },
    homeRoute() {
      return { name: window.$storefront.routes.SHOP_PAGE };
    },
  },

  watch: {
    vendorId() {
      this.fetch();
    },
  },

  mounted() {
    this.fetch();
  },

  methods: {
    aisleImage,
    tint: tintFor,
    picture(product) {
      return productImage(product);
    },

    fetch() {
      this.vendor = null;
      this.busy = true;
      this.sellsIn = [];
      this.stall = [];
      const id = this.vendorId;

      window.$storefront.vendor
        .getVendor(id)
        .then(({ vendor }) => {
          if (String(id) === String(this.vendorId)) this.vendor = vendor || null;
        })
        .catch(() => {
          this.vendor = null;
        })
        .finally(() => {
          this.busy = false;
        });

      /* The aisles this seller sells in, in Kalio's featured order, and a
         stall of products only they sell (then any of theirs). */
      Promise.all([offers(), aisleIndex()]).then(([{ sellersOf, shelfOf }, index]) => {
        if (String(id) !== String(this.vendorId)) return;
        const shelf = shelfOf.get(Number(id)) || [];
        const aisleIds = new Set(shelf.map((product) => product.category_id));
        this.sellsIn = featured([...index.values()].filter((aisle) => aisleIds.has(aisle.id)));
        const own = shelf.filter((product) => product.icon && (sellersOf.get(product.id) || []).length === 1);
        const rest = shelf.filter((product) => product.icon && !own.includes(product));
        this.stall = [...own, ...rest].slice(0, 3);
      });
    },

    jump(aisle) {
      const target = document.getElementById(`k-seller-aisle-${aisle.id}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
};
</script>
