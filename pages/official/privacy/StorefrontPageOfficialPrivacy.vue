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

<template>
  <div>
    <v-container>
      <h1 class="k-official__title">
        {{ $t("official_pages.privacy") }}
      </h1>
      <u-loading-progress v-if="busy"></u-loading-progress>

      <div class="text-start px-lg-5 px-md-4 px-3 master-article-container">
        <s-article-editor
          v-if="profile"
          :body="profile.body"
          :edit="false"
          :enableTitle="false"
          :only-view="true"
          class="p-lg-5 p-md-4 p-3 article"
        />
      </div>

      <!-- Kalio: the shop has not written this page yet -->
      <kalio-official-missing v-if="missing" kind="privacy" />

      <s-cookie-preferences
        class="s--shadow-no-padding text-start my-16"
      ></s-cookie-preferences>
    </v-container>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import SArticleEditor from "@selldone/components-vue/article/SArticleEditor.vue";
import KalioOfficialMissing from "../../../components/kalio/KalioOfficialMissing.vue";
import SCookiePreferences from "@selldone/components-vue/storefront/cookie/preferences/SCookiePreferences.vue";

export default {
  name: "StorefrontPageOfficialPrivacy",
  components: { SCookiePreferences, SArticleEditor, KalioOfficialMissing },
  inject: ["$shop"],
  data: () => ({
    state: "editing",
    profile: null,
    missing: false, // Kalio: no text for this page in the shop's profiles
    busy: false,
  }),
  computed: {
    shop() {
      return this.getShop();
    },
  },
  watch: {},
  created() {
    this.setPageTitle("Privacy"); // Set Page Title!

    this.fetchProfile();
  },
  methods: {
    fetchProfile() {
      this.busy = true;

      axios
        .get(window.XAPI.GET_SHOP_PROFILE(this.$shop.name, "privacy"))
        .then(({ data }) => {
          // Kalio: a page the shop has not written is said on the page,
          // not as an error.
          if (data.error) return (this.missing = true);
          this.profile = data.profile;
          this.missing = !String(data.profile?.body || "").replace(/<[^>]*>/g, "").trim();
        })
        .catch((error) => {
          this.missing = true;
          if (error?.response?.status !== 404) NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
