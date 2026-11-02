<!--
  Kalio — Market front.

  The merchandised front matter of the marketplace: a dark banner, the live
  aisle ribbon, what the market promises, three product rails and the seller
  strip. It is shown above the catalogue on the bare shop page only, and it
  disappears the moment a shopper enters an aisle, picks a seller or applies a
  filter — at that point they are shopping, not browsing the front.

  Rules this markup follows, from Kalio's own contract:
  - No product, price, brand or image is named here. Everything is live.
  - No counts in customer copy. The aisle count and the catalogue size are
    both available and both deliberately unused.
  - No delivery-time or pickup promise: the shop has not published one, and an
    invented one reads exactly like a real one.
  - Seller attribution comes from the real vendor records, never from a guess.
-->
<template>
  <div class="k-front">
    <!-- ▆▆▆▆▆▆▆▆ Banner ▆▆▆▆▆▆▆▆ -->
    <section class="k-band">
      <div class="k-band__inner">
        <p class="k-eyebrow k-eyebrow--onink">{{ shopTitle }} · marketplace</p>
        <h1 class="k-band__title">Everything for the weekly shop</h1>
        <p class="k-band__lede">
          Fresh aisles and independent sellers, in one basket.
        </p>
        <div class="k-band__acts">
          <a class="k-btn k-btn--lift" href="#k-catalogue">Start shopping</a>
          <a class="k-btn k-btn--ghost" href="#k-aisles">Browse the aisles</a>
        </div>
      </div>
    </section>

    <!-- ▆▆▆▆▆▆▆▆ What the market promises ▆▆▆▆▆▆▆▆ -->
    <section class="k-promise">
      <article v-for="card in promises" :key="card.title" class="k-promise__card">
        <v-icon class="k-promise__mark" size="22">{{ card.icon }}</v-icon>
        <h3 class="k-promise__title">{{ card.title }}</h3>
        <p class="k-promise__copy">{{ card.copy }}</p>
      </article>
    </section>

    <!-- ▆▆▆▆▆▆▆▆ Aisles ▆▆▆▆▆▆▆▆ -->
    <div id="k-aisles">
      <kalio-aisle-ribbon />
    </div>

    <!-- ▆▆▆▆▆▆▆▆ Rails ▆▆▆▆▆▆▆▆ -->
    <kalio-rail
      eyebrow="New in the hall"
      title="Just landed"
      sort="newest"
      :limit="12"
      :more-to="shopRoute"
      more-label="See everything new"
    />

    <kalio-rail
      eyebrow="What the hall is buying"
      title="Market favourites"
      sort="bestselling"
      :limit="12"
      :more-to="shopRoute"
    />

    <kalio-rail
      eyebrow="Kind to the basket"
      title="Everyday value"
      sort="cheapest"
      :limit="12"
      :more-to="shopRoute"
    />

    <!-- ▆▆▆▆▆▆▆▆ Sellers ▆▆▆▆▆▆▆▆ -->
    <section v-if="vendors.length" class="k-sellers">
      <div class="k-sellers__head">
        <p class="k-eyebrow">Under this roof</p>
        <h2 class="k-sellers__title">The sellers</h2>
      </div>
      <div class="k-sellers__row">
        <router-link
          v-for="vendor in vendors"
          :key="vendor.id"
          :to="vendorLink(vendor)"
          class="k-seller"
        >
          <span class="k-seller__art">
            <img
              v-if="vendor.icon"
              :alt="vendor.name"
              :src="vendorIcon(vendor)"
              height="72"
              loading="lazy"
              width="72"
            />
            <v-icon v-else size="26">storefront</v-icon>
          </span>
          <span class="k-seller__body">
            <span class="k-seller__name">{{ vendor.name }}</span>
            <span class="k-seller__meta">
              {{ vendor.description || "Visit the storefront" }}
            </span>
          </span>
          <v-icon class="k-seller__go" size="18">arrow_forward</v-icon>
        </router-link>
      </div>
    </section>

    <!-- The catalogue proper starts below; the anchor is the banner's target. -->
    <div id="k-catalogue" class="k-front__seam">
      <p class="k-eyebrow">The whole catalogue</p>
      <h2 class="k-front__seam-title">Shop every aisle</h2>
    </div>
  </div>
</template>

<script>
import KalioAisleRibbon from "./KalioAisleRibbon.vue";
import KalioRail from "./KalioRail.vue";

export default {
  name: "KalioMarketFront",
  components: { KalioAisleRibbon, KalioRail },

  data() {
    return {
      vendors: [],
      promises: [
        {
          icon: "grid_view",
          title: "Aisle-first",
          copy: "Produce, dairy, bakery, pantry and the rest — browse the way you walk a market, not a search box.",
        },
        {
          icon: "storefront",
          title: "Sellers you can see",
          copy: "Every product that has a seller assigned says who sells it, and each seller has a storefront of their own.",
        },
        {
          icon: "lock",
          title: "Secure checkout",
          copy: "Basket, payment and order records are handled through Selldone. Totals always come from the live order.",
        },
      ],
    };
  },

  computed: {
    shopTitle() {
      return this.$shop?.title || "Kalio";
    },

    shopRoute() {
      return { name: window.$storefront.routes.SHOP_PAGE };
    },
  },

  mounted() {
    this.fetchVendors();
  },

  methods: {
    /* The SDK wraps a single vendor; the shop's vendor list is fetched through
       the same axios transport rather than a second HTTP layer of our own. */
    fetchVendors() {
      window.axios
        .get(window.XAPI.GET_VENDORS(window.$storefront.name))
        .then(({ data }) => {
          if (data?.error) return;
          this.vendors = data?.vendors || [];
        })
        .catch(() => {
          this.vendors = [];
        });
    },

    vendorIcon(vendor) {
      return window.CDN.GET_SHOP_IMAGE_PATH(vendor.icon, 128);
    },

    vendorLink(vendor) {
      return {
        name: window.$storefront.routes.SHOP_VENDOR_PAGE,
        params: { slug: vendor.name, vendor_id: vendor.id },
      };
    },
  },
};
</script>
