<!--
  Argon — the wordmark: the brand name from kalio-brand.ts (the one line to
  change) in lower case, white and heavy, on a red rounded tile like a badge.
  The tile is the brand colour (--ar-brand), so a palette or a merchant's
  brand colour repaints it. With no brand name set, the shop's own title is
  drawn the same way.
-->
<template>
  <component :is="to ? 'router-link' : 'span'" :aria-label="t('argon.logo.home', '{name} home', { name: word })" :to="to" class="ar-logo">
    <span class="ar-logo__w">{{ word }}</span>
  </component>
</template>

<script>
import { BRAND } from "../kalio/kalio-brand";

export default {
  name: "ArgonLogo",
  inject: { $shop: { default: null } },
  props: {
    to: { type: [Object, String], default: () => ({ path: "/" }) },
  },
  computed: {
    word() {
      return (BRAND.name || this.$shop?.title || "").toLowerCase();
    },
  },
};
</script>
