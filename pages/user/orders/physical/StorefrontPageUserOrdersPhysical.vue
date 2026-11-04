<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Kalio (4 November 2026): the grocery orders are Kalio's list
  - (KalioOrdersBoard: rows in design B, cards in design A) in place of
  - Selldone's table (SOrdersList), which the other kinds of order keep.
  -->

<template>
  <kalio-orders-board />
</template>

<script lang="ts">
import KalioOrdersBoard from "../../../../components/kalio/account/KalioOrdersBoard.vue";

export default {
  name: "StorefrontPageUserOrdersPhysical",
  components: { KalioOrdersBoard },
};
</script>
