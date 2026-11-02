<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
<template>
  <!-- Kalio: a wrong turn in the market hall. Same platform data (the shop
       title, the home route); Selldone's gradient tile and black bar
       become an aisle sign with the way back. -->
  <section class="k-404">
    <p class="k-eyebrow">Page not found · 404</p>
    <h1 class="k-404__title">This aisle doesn't exist.</h1>
    <p class="k-404__lede">
      The link may be out of date, or the address may have a typo.
    </p>
    <div class="k-404__acts">
      <router-link :to="{ path: '/' }" class="k-btn k-btn--solid">
        Back to {{ shop ? shop.title : $t("global.commons.home") }}
      </router-link>
    </div>
  </section>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "StorefrontPageError404",


  computed: {
    shop() {
      return this.getShop();
    },
  },
});
</script>

<style scoped lang="scss"></style>
