<!--
  Kalio — Merchandising rail.

  A horizontal shelf of products pulled live with one products.list call. The
  caller passes the sort or the tags; nothing in here names a product, a price
  or a brand, so the rail cannot go stale when the catalogue changes.

  The card is the platform's SShopProductCard with quick-buy on, because the
  card carries basket, variant, discount, badge and currency behaviour that a
  hand-built card would only imitate. The card's Quick Buy button does not buy
  anything by itself: it emits "quick-buy" and expects its parent to open the
  product overview. SProductsListing does that with a bottom sheet, and this
  rail does the same thing the same way — fetch the full product, provide it
  as $product, render SProductOverview in quick-buy mode — so a press on a
  rail card and a press on a grid card land in the identical buying flow.

  A rail with no products renders nothing at all, not a heading over an empty
  row. Kalio's sellers have no products assigned yet, and vendor rails rely on
  exactly that.
-->
<template>
  <section v-if="busy || products.length" class="k-rail">
    <header class="k-rail__head">
      <div>
        <p v-if="eyebrow" class="k-eyebrow">{{ eyebrow }}</p>
        <h2 class="k-rail__title">{{ title }}</h2>
      </div>

      <div class="k-rail__tools">
        <router-link v-if="moreTo" :to="moreTo" class="k-rail__more">
          {{ moreLabel }}
        </router-link>
        <div class="k-rail__arrows">
          <button
            type="button"
            class="k-rail__arrow"
            aria-label="Scroll left"
            @click="scrollBy(-1)"
          >
            <v-icon size="20">arrow_back</v-icon>
          </button>
          <button
            type="button"
            class="k-rail__arrow"
            aria-label="Scroll right"
            @click="scrollBy(1)"
          >
            <v-icon size="20">arrow_forward</v-icon>
          </button>
        </div>
      </div>
    </header>

    <div ref="track" class="k-rail__track">
      <template v-if="busy">
        <div v-for="n in 6" :key="'s' + n" class="k-rail__cell">
          <div class="k-rail__skeleton"></div>
        </div>
      </template>

      <div
        v-for="product in products"
        v-else
        :key="product.id"
        class="k-rail__cell"
      >
        <s-shop-product-card
          :product="product"
          :to="{
            name: window.$storefront.routes.PRODUCT_PAGE,
            params: { product_id: product.id },
          }"
          quick-buy
          @quick-buy="quickBuy(product)"
        />
      </div>
    </div>

    <!-- The same quick-buy sheet the catalogue grid opens. -->
    <v-bottom-sheet
      v-model="quick_buy"
      :max-width="1480"
      content-class="rounded-t-xl k-quickbuy"
      max-height="90vh"
      width="98vw"
    >
      <v-card class="position-relative" rounded="t-xl">
        <v-card-text class="pt-5 thin-scroll">
          <s-product-overview-loading
            v-if="busy_product && !selected_product"
          />
          <s-product-overview
            v-if="selected_product"
            can-buy
            quick-buy-mode
            show-cover
          />
          <v-btn
            class="absolute-top-end z1"
            icon
            size="large"
            variant="text"
            aria-label="Close"
            @click="quick_buy = false"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </section>
</template>

<script>
import { computed } from "vue";
import SShopProductCard from "@selldone/components-vue/storefront/product/card/SShopProductCard.vue";
import SProductOverview from "@selldone/components-vue/storefront/product/overview/SProductOverview.vue";
import SProductOverviewLoading from "@selldone/components-vue/storefront/product/overview/loading/SProductOverviewLoading.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "KalioRail",
  components: { SShopProductCard, SProductOverview, SProductOverviewLoading },

  props: {
    title: { type: String, required: true },
    eyebrow: { type: String, default: null },

    /** Any sort the storefront API accepts: newest, bestselling, cheapest, most_popular, random. */
    sort: { type: String, default: "newest" },
    /** Real product tags from the shop, e.g. ['clearance']. Never a display-only label. */
    tags: { type: Array, default: null },
    /** Restrict the rail to one marketplace seller. */
    vendorId: { type: [Number, String], default: null },
    /** Restrict the rail to one aisle by category directory. */
    dir: { type: String, default: null },

    limit: { type: Number, default: 12 },
    moreTo: { type: Object, default: null },
    moreLabel: { type: String, default: "See all" },
  },

  /* SProductOverview injects $product; the listing provides it the same way. */
  provide() {
    return {
      $product: computed(() => this.selected_product),
    };
  },

  data() {
    return {
      products: [],
      busy: true,
      window: window,

      quick_buy: false,
      selected_product: null,
      busy_product: false,
    };
  },

  mounted() {
    this.fetch();
  },

  methods: {
    fetch() {
      this.busy = true;

      const options = {
        products_only: true,
        sort: this.sort,
        available: true,
      };
      if (this.tags && this.tags.length) options.tags = this.tags;
      if (this.vendorId) options.vendor_id = this.vendorId;

      window.$storefront.products
        .list(this.dir, 0, this.limit, options)
        .then(({ products }) => {
          this.products = products || [];
        })
        .catch(() => {
          this.products = [];
        })
        .finally(() => {
          this.busy = false;
        });
    },

    quickBuy(product) {
      this.quick_buy = true;
      this.selected_product = null;
      this.busy_product = true;

      const done = ({ product: full }) => {
        this.selected_product = full;
      };

      window.$storefront.products
        .optimize(60)
        .get(product.id, { no_article: true })
        .cache(done)
        .then(done)
        .catch((error) => {
          NotificationService.showLaravelError(error);
          this.quick_buy = false;
        })
        .finally(() => {
          this.busy_product = false;
        });
    },

    /* One page of the shelf per press, so the arrows move the same distance
       whatever the viewport. */
    scrollBy(direction) {
      const track = this.$refs.track;
      if (!track) return;
      track.scrollBy({
        left: direction * Math.round(track.clientWidth * 0.85),
        behavior: "smooth",
      });
    },
  },
};
</script>
