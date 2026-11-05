<!--
  Kalio — an official page the shop has not written yet (5 November 2026).

  About us, Terms and Privacy come from the shop's profiles in the
  dashboard. Where a profile is missing Selldone showed the heading over an
  empty page and a "Store profile not found." error; here the page says so
  plainly and points to the shop's contact page and questions.
-->
<template>
  <div class="k-official__missing">
    <v-icon size="30">{{ words.icon }}</v-icon>
    <h2>{{ words.title }}</h2>
    <p>{{ words.text }}</p>
    <div class="k-official__missingacts">
      <router-link :to="{ name: window.$storefront.routes.SHOP_CONTACT_US }" class="k-btn k-btn--solid">Contact the shop</router-link>
      <router-link :to="{ name: 'ShopFAQ' }" class="k-btn k-btn--line">Questions and answers</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "KalioOfficialMissing",
  inject: ["$shop"],

  props: {
    /** about | terms | privacy */
    kind: { type: String, required: true },
  },

  computed: {
    words() {
      const shop = this.$shop?.title || "This shop";
      if (this.kind === "about")
        return {
          icon: "storefront",
          title: `${shop}’s story is coming soon`,
          text: `${shop} is a grocery marketplace: independent sellers, one basket. Until the shop writes more here, ask it anything.`,
        };
      if (this.kind === "privacy")
        return {
          icon: "privacy_tip",
          title: "The privacy policy is on its way",
          text: `${shop} has not published it here yet. To ask how your details are used, write to the shop. Your cookie choices are below.`,
        };
      return {
        icon: "gavel",
        title: "The terms of use are on their way",
        text: `${shop} has not published them here yet. Ask the shop about delivery, returns or payment before you order.`,
      };
    },
  },
};
</script>
