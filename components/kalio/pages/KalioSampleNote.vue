<!--
  Kalio — "this is sample text" (5 November 2026).

  The owner asked for the journal, About us, Terms and Privacy to be full
  pages even before the shop writes them, with sample text that says plainly
  it is a test and not real. This amber note stands at the top of every such
  text. It is shown only while the page shows sample text: once the shop
  writes its own page in the dashboard, the note and the sample go together.
-->
<template>
  <aside class="k-sample" role="note">
    <v-icon size="20">science</v-icon>
    <p>
      <b>Sample text — {{ shopTitle }} is a test shop.</b>{{ " " }}<slot />
    </p>
  </aside>
</template>

<script>
export default {
  name: "KalioSampleNote",
  inject: ["$shop"],

  computed: {
    shopTitle() {
      return this.$shop?.title || "This shop";
    },
  },
};
</script>
