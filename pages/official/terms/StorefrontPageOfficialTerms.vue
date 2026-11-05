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
  Kalio: the shop's terms page in design A (KalioLegalPage), chosen by the
  owner on 5 November 2026. Sample text, marked as a test, stands in while
  the shop has not written it.
-->
<template>
  <kalio-legal-page kind="terms" />
</template>

<script lang="ts">
import KalioLegalPage from "@app-storefront/components/kalio/pages/KalioLegalPage.vue";

export default {
  name: "StorefrontPageOfficialTerms",
  components: { KalioLegalPage },
};
</script>
