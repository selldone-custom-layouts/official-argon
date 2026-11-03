<!--
  Kalio — Seller shelf.

  Sits under the seller band on a vendor page: what this seller has on offer
  and what they added most recently, each a KalioRail scoped by vendor_id.
  Selldone's vendor page is the plain catalogue with a header; this gives a
  seller a storefront. Both rails self-empty: a seller with no discounts has
  no "on offer" row.
-->
<template>
  <div class="k-seller-shelf">
    <kalio-rail
      :filter="{ only_has_discount: true }"
      :title="`On offer from ${name}`"
      :vendor-id="vendorId"
      sort="bestselling"
    />
    <kalio-rail :title="`New from ${name}`" :vendor-id="vendorId" sort="newest" />
  </div>
</template>

<script>
import KalioRail from "./KalioRail.vue";
import { vendors } from "./kalio-catalog";

export default {
  name: "KalioSellerShelf",
  components: { KalioRail },

  props: {
    vendorId: { type: [Number, String], required: true },
  },

  data() {
    return {
      name: "this seller",
    };
  },

  mounted() {
    vendors().then((list) => {
      const vendor = list.find((item) => String(item.id) === String(this.vendorId));
      if (vendor) this.name = vendor.name;
    });
  },
};
</script>
