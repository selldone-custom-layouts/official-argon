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
  Kalio — About us, design B "A letter", chosen by the owner on 5 November
  2026.

  Beside the letter: three of the shop's best sellers on a warm ground and
  the facts read from the shop itself — its sellers, its aisles, how many
  products it stocks — with the way to reach it. The letter is the shop's
  own About profile (Selldone dashboard › Shop › Profile) when it has one;
  until then a sample letter, marked as a test, with its values, a
  timeline (marked as examples) and a signature.
-->
<template>
  <div class="k-story">
    <aside class="k-story__side">
      <div class="k-story__pic">
        <img v-for="product in packs" :key="product.id" :src="picture(product)" alt="" />
      </div>
      <dl class="k-story__facts">
        <template v-if="sellers.length">
          <dt>{{ sellers.length === 1 ? "Seller" : "Sellers" }}</dt>
          <dd>{{ sellers.map((it) => it.name).join(" · ") }}</dd>
        </template>
        <template v-if="aisleList.length">
          <dt>Aisles</dt>
          <dd>{{ aisleLine }}</dd>
        </template>
        <template v-if="productCount">
          <dt>Products</dt>
          <dd>About {{ productCount }}, in one basket</dd>
        </template>
        <dt>Contact</dt>
        <dd>
          <router-link :to="{ name: window.$storefront.routes.SHOP_CONTACT_US }">Contact the shop</router-link>
        </dd>
      </dl>
    </aside>

    <div class="k-story__main">
      <p class="k-eyebrow">A note from {{ shopTitle }}</p>
      <h1 class="k-story__title">{{ missing || busy ? sample.title : `About ${shopTitle}` }}</h1>

      <div v-if="busy" aria-hidden="true" class="k-legal__loading"><span></span><span></span><span></span></div>

      <template v-else-if="missing">
        <kalio-sample-note>
          This letter is general text written to show the page. It is not {{ shopTitle }}'s real story; the timeline is an example.
        </kalio-sample-note>
        <p class="k-story__lead">{{ sample.lead }}</p>
        <div class="k-prose">
          <p v-for="text in sample.text" :key="text">{{ text }}</p>
        </div>
        <div class="k-story__values">
          <div v-for="(value, i) in sample.values" :key="value.title">
            <h2><em>{{ String(i + 1).padStart(2, "0") }}</em>{{ value.title }}</h2>
            <p>{{ value.text }}</p>
          </div>
        </div>
        <ol class="k-story__time">
          <li v-for="step in sample.timeline" :key="step.when"><b>{{ step.when }}</b><span>{{ step.text }}</span></li>
        </ol>
        <p class="k-story__sign">{{ sample.sign }}</p>
      </template>

      <!-- The shop's own page, as written in its dashboard. -->
      <div v-else class="k-story__real k-prose" v-html="profile.body"></div>

      <div v-if="!busy" class="k-story__acts">
        <router-link :to="catalogueRoute" class="k-btn k-btn--solid">Start shopping</router-link>
        <router-link :to="{ name: window.$storefront.routes.SHOP_CONTACT_US }" class="k-btn k-btn--line">Contact the shop</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import KalioSampleNote from "@app-storefront/components/kalio/pages/KalioSampleNote.vue";
import { aboutSample, plainText } from "@app-storefront/components/kalio/pages/kalio-sample-pages";
import { aisles, catalogueRoute, countProducts, productImage, vendors } from "@app-storefront/components/kalio/kalio-catalog";

export default {
  name: "StorefrontPageOfficialAboutUs",
  components: { KalioSampleNote },
  inject: ["$shop"],

  data: () => ({
    profile: null,
    missing: false,
    busy: true,
    packs: [],
    sellers: [],
    aisleList: [],
    productCount: null,
  }),

  computed: {
    shopTitle() {
      return this.$shop?.title || "This shop";
    },
    sample() {
      return aboutSample(this.shopTitle);
    },
    catalogueRoute() {
      return catalogueRoute();
    },
    aisleLine() {
      const names = this.aisleList.map((it) => it.title || it.name);
      if (names.length <= 3) return names.join(", ");
      return `${names.length}: ${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
    },
  },

  created() {
    this.setPageTitle?.("About us");

    window.axios
      .get(window.XAPI.GET_SHOP_PROFILE(this.$shop.name, "about-us"))
      .then(({ data }) => {
        this.profile = data?.error ? null : data?.profile || null;
        this.missing = !plainText(this.profile?.body);
      })
      .catch(() => (this.missing = true))
      .finally(() => (this.busy = false));

    window.$storefront.products
      .list(null, 0, 8, { products_only: true, available: true, sort: "bestselling" })
      .then(({ products }) => (this.packs = (products || []).filter((it) => it.icon).slice(0, 3)))
      .catch(() => {});
    vendors().then((list) => (this.sellers = list.filter((it) => it && it.name)));
    aisles().then((list) => (this.aisleList = list));
    countProducts(null).then((count) => (this.productCount = count));
  },

  methods: {
    picture(product) {
      return productImage(product);
    },
  },
};
</script>
