<!--
  Kalio — Hero.

  The top of the home page: one wide banner that turns through a few slides,
  and two tiles beside it — an aisle and a seller. Every slide is built from
  live data at view time:

  - Deals: the shop's discounted products, the best saving as the sticker,
    pictures taken from the fresh aisles first.
  - Aisles: two featured aisles with their own description and products.
  - The seller tile names a real seller and shows products from their shelf.

  No slide is drawn for something the shop does not have: no discounts, no
  deals slide; no sellers, an aisle tile in the seller's place. No delivery,
  timing or count claim is made anywhere.

  The banner advances on its own every few seconds unless the visitor is
  pointing at it, has focus in it, or has asked for reduced motion; the dots
  are buttons and say which slide they show.
-->
<template>
  <section class="k-hero k-wrap" aria-label="Featured">
    <!-- ▆▆▆▆▆▆▆▆ Banner ▆▆▆▆▆▆▆▆ -->
    <div
      :class="{ '-loading': !slides.length }"
      aria-roledescription="carousel"
      class="k-banner"
      @focusin="paused = true"
      @focusout="paused = false"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
    >
      <div v-if="!slides.length" aria-hidden="true" class="k-banner__slide -current"></div>

      <article
        v-for="(slide, i) in slides"
        :key="slide.key"
        :aria-hidden="i !== current"
        :aria-label="`${i + 1} of ${slides.length}`"
        :class="{ '-current': i === current }"
        :inert="i !== current || undefined"
        :style="{ '--k-banner': slide.ground }"
        aria-roledescription="slide"
        class="k-banner__slide"
      >
        <div class="k-banner__copy">
          <p class="k-eyebrow">{{ slide.eyebrow }}</p>
          <h2 class="k-banner__title">{{ slide.title }}</h2>
          <p class="k-banner__lede">{{ slide.lede }}</p>
          <router-link :to="slide.to" class="k-btn k-btn--solid">
            {{ slide.cta }}
            <v-icon class="k-flip" size="20">chevron_right</v-icon>
          </router-link>
        </div>

        <div v-if="slide.sticker" aria-hidden="true" class="k-banner__sticker">
          <small>Up to</small>
          <strong>{{ slide.sticker }}%</strong>
          <small>off</small>
        </div>

        <div aria-hidden="true" class="k-banner__art">
          <template v-if="seen.has(i)">
            <span
              v-for="(product, n) in slide.pics"
              :key="product.id"
              :class="`-at${n}`"
              class="k-banner__disc"
            >
              <img :src="picture(product)" alt="" />
            </span>
          </template>
        </div>
      </article>

      <div v-if="slides.length > 1" class="k-banner__dots">
        <button
          v-for="(slide, i) in slides"
          :key="'d' + slide.key"
          :aria-current="i === current ? 'true' : undefined"
          :aria-label="`Show slide ${i + 1}: ${slide.title}`"
          :class="{ '-on': i === current }"
          type="button"
          @click="go(i)"
        ></button>
      </div>
    </div>

    <!-- ▆▆▆▆▆▆▆▆ Tiles ▆▆▆▆▆▆▆▆ -->
    <div class="k-hero__tiles">
      <router-link
        v-for="tile in tiles"
        :key="tile.key"
        :class="`-${tile.kind}`"
        :style="{ '--k-banner': tile.ground }"
        :to="tile.to"
        class="k-tile"
      >
        <span class="k-tile__copy">
          <span class="k-eyebrow k-tile__eyebrow">
            <img v-if="tile.mark" :src="tile.mark" alt="" class="k-tile__mark" height="30" width="30" />
            {{ tile.eyebrow }}
          </span>
          <span class="k-tile__title">{{ tile.title }}</span>
          <span class="k-tile__go">
            {{ tile.cta }}
            <v-icon class="k-flip" size="18">chevron_right</v-icon>
          </span>
        </span>
        <span aria-hidden="true" class="k-tile__pics">
          <img v-for="product in tile.pics" :key="product.id" :src="picture(product)" alt="" loading="lazy" />
        </span>
      </router-link>
      <template v-if="!tiles.length">
        <div v-for="n in 2" :key="'t' + n" aria-hidden="true" class="k-tile -loading"></div>
      </template>
    </div>
  </section>
</template>

<script>
import {
  aisleRoute,
  aisles,
  dealsRoute,
  featured,
  offers,
  percentOff,
  productImage,
  sellerRoute,
  tintFor,
  vendorImage,
  vendors,
} from "./kalio-catalog";

const TURN_EVERY_MS = 7000;
const DEALS_GROUND = "#dcedc5";
const SELLER_GROUND = "#fbe6d8";

/* A slide's ground is its aisle's tint taken a step deeper, so the banner
   holds its own against the white page while still reading as that aisle. */
const deepen = (tint) => `color-mix(in oklab, ${tint} 90%, #3d5a48)`;

export default {
  name: "KalioHero",

  data() {
    return {
      slides: [],
      tiles: [],
      current: 0,
      seen: new Set([0, 1]),
      paused: false,
      reduced_motion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    };
  },

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    shopTitle() {
      return this.shop?.title || "Kalio";
    },
  },

  mounted() {
    this.build();
    if (!this.reduced_motion) {
      this.timer = setInterval(() => {
        if (!this.paused && !document.hidden && this.slides.length > 1) {
          this.go((this.current + 1) % this.slides.length);
        }
      }, TURN_EVERY_MS);
    }
  },

  beforeUnmount() {
    clearInterval(this.timer);
  },

  methods: {
    go(i) {
      this.current = i;
      /* Pictures of a slide load just before it is shown, not all up front. */
      this.seen = new Set([...this.seen, i, (i + 1) % Math.max(this.slides.length, 1)]);
    },

    picture(product) {
      return productImage(product);
    },

    list(dir, limit, extra = {}) {
      return window.$storefront.products
        .list(dir, 0, limit, { products_only: true, available: true, sort: "bestselling", ...extra })
        .then(({ products }) => products || [])
        .catch(() => []);
    },

    async build() {
      const [aisleList, sellerList, deals] = await Promise.all([
        aisles(),
        vendors(),
        this.list(null, 24, { filter: JSON.stringify({ only_has_discount: true }) }),
      ]);
      const ordered = featured(aisleList);
      const rankOf = new Map(ordered.map((aisle, i) => [aisle.id, i]));

      const tileAisle = ordered[1] || ordered[0] || null;
      const slideAisles = ordered.filter((aisle) => aisle !== tileAisle).slice(0, 2);

      const [tileProducts, ...slideProducts] = await Promise.all([
        tileAisle ? this.list(tileAisle.name, 2) : [],
        ...slideAisles.map((aisle) => this.list(aisle.name, 4)),
      ]);

      /* ―― Slides ―― */
      const slides = [];

      if (deals.length) {
        const best = Math.max(...deals.map((product) => percentOff(this.shop, product)));
        /* Fresh aisles first, one picture per aisle, so the banner shows a
           spread of the shop rather than four packs from one shelf. */
        const byRank = [...deals].sort(
          (a, b) => (rankOf.get(a.category_id) ?? 99) - (rankOf.get(b.category_id) ?? 99),
        );
        const pics = [];
        const aislesUsed = new Set();
        for (const product of byRank) {
          if (pics.length === 4) break;
          if (aislesUsed.has(product.category_id) || !product.icon) continue;
          aislesUsed.add(product.category_id);
          pics.push(product);
        }
        for (const product of byRank) {
          if (pics.length === 4) break;
          if (!pics.includes(product) && product.icon) pics.push(product);
        }

        slides.push({
          key: "deals",
          ground: DEALS_GROUND,
          eyebrow: `On offer at ${this.shopTitle}`,
          title: best > 0 ? `Fresh picks, up to ${best}% off` : "Fresh picks, marked down",
          lede: `Savings from ${this.shopTitle}’s sellers, across the aisles.`,
          cta: "Shop the deals",
          to: dealsRoute(),
          pics,
          sticker: best > 0 ? best : null,
        });
      }

      slideAisles.forEach((aisle, i) => {
        const pics = (slideProducts[i] || []).filter((product) => product.icon);
        if (!pics.length) return;
        slides.push({
          key: "aisle-" + aisle.id,
          ground: deepen(tintFor(aisle)),
          eyebrow: "Aisle",
          title: aisle.title || aisle.name,
          lede: aisle.description || `${aisle.title} from ${this.shopTitle}’s sellers.`,
          cta: `Shop ${aisle.title || aisle.name}`,
          to: aisleRoute(aisle),
          pics,
          sticker: null,
        });
      });

      this.slides = slides;

      /* ―― Tiles ―― */
      const tiles = [];
      if (tileAisle) {
        tiles.push({
          key: "aisle",
          kind: "aisle",
          ground: deepen(tintFor(tileAisle)),
          eyebrow: "Aisle",
          title: tileAisle.title || tileAisle.name,
          cta: "Shop the aisle",
          to: aisleRoute(tileAisle),
          pics: tileProducts.filter((product) => product.icon).slice(0, 2),
        });
      }

      const { shelfOf } = await offers();
      const seller = [...sellerList].sort(
        (a, b) => (shelfOf.get(b.id)?.length || 0) - (shelfOf.get(a.id)?.length || 0),
      )[0];
      if (seller) {
        const shelf = (shelfOf.get(seller.id) || []).filter((product) => product.icon);
        tiles.push({
          key: "seller",
          kind: "seller",
          ground: SELLER_GROUND,
          eyebrow: "Seller",
          mark: vendorImage(seller, true),
          title: `${seller.name}’s shelf`,
          cta: "Visit the shop",
          to: sellerRoute(seller),
          pics: shelf.slice(0, 2),
        });
      } else if (slideAisles[0]) {
        tiles.push({
          key: "aisle-2",
          kind: "aisle",
          ground: deepen(tintFor(slideAisles[0])),
          eyebrow: "Aisle",
          title: slideAisles[0].title,
          cta: "Shop the aisle",
          to: aisleRoute(slideAisles[0]),
          pics: (slideProducts[0] || []).slice(0, 2),
        });
      }
      this.tiles = tiles;
    },
  },
};
</script>
