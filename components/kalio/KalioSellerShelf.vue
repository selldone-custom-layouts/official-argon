<!--
  Kalio — Seller shelf.

  Sits under the seller band on a vendor page: the seller's own bestsellers
  and newest arrivals, each a KalioRail scoped by vendor_id. Selldone's vendor
  page is the plain catalogue with a header; this gives a seller a storefront.

  Both rails self-empty. As of this build no Kalio product has a vendor_id,
  so on Mason's and Alina's pages the shelf renders nothing and the listing
  below shows its own empty state — the honest state of a seller with no
  range yet, rather than borrowed products under their name.
-->
<template>
  <div class="k-seller-shelf">
    <kalio-rail
      :vendor-id="vendorId"
      eyebrow="From this seller"
      title="Their bestsellers"
      sort="bestselling"
      :limit="12"
    />
    <kalio-rail
      :vendor-id="vendorId"
      eyebrow="From this seller"
      title="Newest from their stall"
      sort="newest"
      :limit="12"
    />
  </div>
</template>

<script>
import KalioRail from "./KalioRail.vue";

export default {
  name: "KalioSellerShelf",
  components: { KalioRail },
  props: {
    vendorId: { type: [Number, String], required: true },
  },
};
</script>
