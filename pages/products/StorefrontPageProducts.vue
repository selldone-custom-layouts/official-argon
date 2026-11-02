<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->
<!--
  🍉 This view will be shown in the StorefrontLayout.vue ▶ <router-view> component.

  Header
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃ Top Shop Menu                      ┃
  ┃  + <s-storefront-primary-header>   ┃
  ┃  + <s-storefront-top-menu>         ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  Primary Footer
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃ Show Vendor Info                   ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  Products Listing
  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃ ⬜⬜⬜ ┃ 🟨   🟨   🟨   🟨   🟨  ┃
  ┃ ⬜⬜⬜ ┃ 🟨   ⬛   ⬛   ⬛   ⬛  ┃
  ┃ ⬜⬜⬜ ┃ ⬛   ⬛   ⬛   ⬛   ⬛  ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  -->
<template>
  <div>
    <v-card
      :flat="isMobile"
      class="s--shop-card s--shadow-no-padding -hide1720 pb-16"
    >
      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Top Shop Menu ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <div
        :class="{
          'add-marginal-side-menu-open':
            show_filter_menu && $vuetify.display.smAndUp,
        }"
        style="transition: all 400ms ease"
      >
        <slot name="header" :center="true"></slot>
      </div>

      <!--
        One page, three Kalio states. Selldone routes the catalogue root, every
        aisle and every seller to this same component, so the market front,
        the aisle sign and the seller storefront are chosen here by route and
        then hand over to the same live listing below.
      -->

      <div
        :class="{
          'add-marginal-side-menu-open':
            show_filter_menu && $vuetify.display.smAndUp,
        }"
        style="transition: all 400ms ease"
      >
      <!-- ▆▆▆▆▆▆▆▆ Seller: hero + shelf ▆▆▆▆▆▆▆▆ -->
      <!-- Replaces Selldone's one-line s-shop-vendor-header, which carries only
           the seller's name and avatar — no commerce state — so nothing is lost. -->
      <kalio-seller-hero v-if="vendor_id" :vendor-id="vendor_id" />
      <kalio-seller-shelf v-if="vendor_id" :vendor-id="vendor_id" />

      <!-- ▆▆▆▆▆▆▆▆ Aisle: the sign over a category page ▆▆▆▆▆▆▆▆ -->
      <kalio-aisle-header
        v-if="category_name && !vendor_id"
        :category-name="category_name"
      />

      <!-- ▆▆▆▆▆▆▆▆ Root: the market front ▆▆▆▆▆▆▆▆ -->
      <!-- Shown on the bare catalogue root only. Every narrowing action the
           listing performs travels as a query parameter, so the front gets
           out of the way the moment a shopper starts filtering. -->
      <kalio-market-front v-if="show_market_front" />
      </div>

      <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Products Listing ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
      <s-products-listing
        :key="$route.path"
        :vendor-id="vendor_id"
        has-breadcrumb
        has-filter
        has-sort
        load-more
        route-mode
        update-route
        @fetch-products="updateProductsSeo"
      ></s-products-listing>
    </v-card>
  </div>
</template>

<script lang="ts">
import SProductsListing from "@selldone/components-vue/storefront/products/listing/SProductsListing.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import KalioMarketFront from "../../components/kalio/KalioMarketFront.vue";
import KalioAisleHeader from "../../components/kalio/KalioAisleHeader.vue";
import KalioSellerShelf from "../../components/kalio/KalioSellerShelf.vue";
import KalioSellerHero from "../../components/kalio/KalioSellerHero.vue";
import {StorefrontSeo} from "../../helpers/StorefrontSeo";

export default {
  name: "StorefrontPageProducts",
  components: {
    SProductsListing,
    KalioMarketFront,
    KalioAisleHeader,
    KalioSellerShelf,
    KalioSellerHero,
  },
  mixins: [TemplateMixin],

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Data
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  data: () => ({
    vendor_id: null /*Show only for this vendor! */,
    seoNavigation: StorefrontSeo.captureNavigation(),
  }),
  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Compute Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  computed: {
    shop_theme() {
      return this.getShop()?.theme;
    },
    show_filter_menu() {
      return this.$store.getters.getShowFilterMenu;
    },

    category_name() {
      return this.$route.params?.category_name || null;
    },

    show_market_front() {
      return (
        String(this.$route.name || "").startsWith(window.$storefront.routes.SHOP_PAGE) &&
        !this.vendor_id &&
        !Object.keys(this.$route.query || {}).length
      );
    },
  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Watch Section
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  watch: {
    /* Layout default: on a grocery shelf "add to basket" belongs on the card.
       The listing shows Quick Buy only when the shop theme sets hover_actions.
       A merchant who has set it either way is respected; one who never
       touched it gets the grocery default. A watcher, not a one-shot write in
       created(): the storefront swaps in a fresh shop object when it refreshes
       the shop, and that swap silently discarded the earlier write. */
    shop_theme: {
      handler(theme) {
        if (theme && theme.hover_actions === undefined) theme.hover_actions = true;
      },
      immediate: true,
    },
    "$route.path"() {
      this.seoNavigation = StorefrontSeo.captureNavigation();
    },
  },

  /**
   * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   *  🔷 Component Lifecycle
   * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
   */
  created() {
    // ━━━━━━━ Initialize by query ━━━━━━━

    /*First load keep vendor ID to show products for this vendor.*/
    this.vendor_id = this.$route.params?.vendor_id
      ? this.$route.params?.vendor_id
      : this.$route.query?.vendor_id;


    this.setPageTitle(); // Set Page Title!
  },
  methods: {
    updateProductsSeo(data) {
      StorefrontSeo.updateProducts(data, this.getShop(), this.seoNavigation);
    },
  },
};
</script>
