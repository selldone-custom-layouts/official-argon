<!--
  Kalio — Quick-buy sheet.

  The sheet a "+" opens anywhere outside a product card: the hero, the shelf.
  It is the same flow the catalogue grid and the rails use — fetch the full
  product, provide it as $product, render SProductOverview in quick-buy mode
  — so variants, sellers and the basket behave exactly as on the product
  page. Pass the product summary that was tapped; the sheet does the rest.
-->
<template>
  <v-bottom-sheet
    :model-value="modelValue"
    :max-width="1480"
    content-class="rounded-t-xl k-quickbuy"
    max-height="90vh"
    width="98vw"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="position-relative" rounded="t-xl">
      <v-card-text class="pt-5 thin-scroll">
        <s-product-overview-loading v-if="busy && !full" />
        <s-product-overview v-if="full" can-buy quick-buy-mode show-cover />
        <v-btn
          aria-label="Close"
          class="absolute-top-end z1"
          icon
          size="large"
          variant="text"
          @click="$emit('update:modelValue', false)"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { computed } from "vue";
import SProductOverview from "@selldone/components-vue/storefront/product/overview/SProductOverview.vue";
import "./kalio-offer-price"; // the struck price follows the chosen seller
import SProductOverviewLoading from "@selldone/components-vue/storefront/product/overview/loading/SProductOverviewLoading.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "KalioQuickBuy",
  components: { SProductOverview, SProductOverviewLoading },

  props: {
    modelValue: Boolean,
    /** The product summary that was tapped. */
    product: { type: Object, default: null },
  },

  emits: ["update:modelValue"],

  /* SProductOverview injects $product; the listing provides it the same way. */
  provide() {
    return {
      $product: computed(() => this.full),
    };
  },

  data() {
    return {
      full: null,
      busy: false,
    };
  },

  watch: {
    modelValue(open) {
      if (open && this.product) this.load(this.product);
    },
  },

  methods: {
    load(product) {
      this.full = null;
      this.busy = true;

      const done = ({ product: full }) => {
        if (product === this.product) this.full = full;
      };

      window.$storefront.products
        .optimize(60)
        .get(product.id, { no_article: true })
        .cache(done)
        .then(done)
        .catch((error) => {
          NotificationService.showLaravelError(error);
          this.$emit("update:modelValue", false);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>
