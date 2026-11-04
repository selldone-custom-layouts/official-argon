<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -
  - Kalio (4 November 2026): the account's frame is Kalio's
  - (components/kalio/account/KalioAccountShell.vue): design B, a greeting
  - and tabs; design A, a side rail. Selldone's row of round buttons is gone;
  - every section it linked to is in the frame.
  -->

<template>
  <kalio-account-shell class="mb-16" />
</template>

<script lang="ts">
import KalioAccountShell from "../../components/kalio/account/KalioAccountShell.vue";

export default {
  name: "StorefrontPageUser",
  components: { KalioAccountShell },
};
</script>
