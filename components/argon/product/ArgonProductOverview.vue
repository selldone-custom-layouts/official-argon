<!--
  Argon — the top of a product page, after a big catalogue store's: two
  columns on a light-grey ground.

  Left: a white card with the gallery (the picture with its arrows, counter
  and zoom, the thumbnails in one row under it), then whatever the page puts
  under it (About this product, the specifications, reviews: the
  "below" slot).
  Right, stacked white cards that stay in view while the left scrolls:
  1. the name, the product code, the price with a red "Save $X" and "Was",
     and the deal's own clock;
  2. "Colour: <name>" (or Capacity…) as tiles with their own photo and,
     when they have one, their own price;
  3. the quantity and a big green "Add to cart" (once it is in the cart:
     "− n +" and Checkout), then Add to wishlist and Compare;
  4. "Complete your purchase with…" (ArgonComplete).

  In the quick-buy sheet (quickBuyMode) only the photo, the price, the
  choice and the buy card show. Every behaviour is Kalio's overview, which
  is Selldone's SProductOverview (extends): variants, stock, the cart, the
  sticky buy bar on a phone. A product whose variants differ in more than
  one way keeps Selldone's own variant picker; a product with a service,
  valuation, subscription or extra pricing keeps Selldone's own buy button.
-->
<template>
  <div :class="{ '-quick': quickBuyMode }" class="ar-pdp">
    <div class="ar-pdp__left">
      <!-- ▆▆▆▆ Gallery ▆▆▆▆ -->
      <section v-if="showCover" :aria-label="t('argon.pdp.images', 'Product images')" class="ar-pcard ar-pdp__media">
        <!-- The thumbnails in one row under the picture, never a side column.
             Argon's own arrows, counter ("1/8") and zoom over the picture
             drive Selldone's slideshow. -->
        <div class="ar-gal">
          <s-shop-product-slide-show ref="gallery" :current-variant="current_variant" :vertical="false" />
          <template v-if="galN > 1">
            <button :aria-label="t('argon.pdp.prevPicture', 'Previous picture')" class="ar-arrow ar-gal__prev" type="button" @click="galGo(-1)"><span class="ms k-flip">chevron_left</span></button>
            <button :aria-label="t('argon.pdp.nextPicture', 'Next picture')" class="ar-arrow ar-gal__next" type="button" @click="galGo(1)"><span class="ms k-flip">chevron_right</span></button>
            <span aria-live="polite" class="ar-gal__n">{{ galAt + 1 }}/{{ galN }}</span>
          </template>
          <button :aria-label="t('argon.pdp.zoom', 'Zoom in')" class="ar-round ar-gal__zoom" type="button" @click="galZoom"><span class="ms">zoom_in</span></button>
        </div>
      </section>
      <slot name="below"></slot>
    </div>

    <div class="ar-pdp__right">
      <!-- ▆▆▆▆ 1. Name and price ▆▆▆▆ -->
      <section class="ar-pcard ar-pdp__head">
        <router-link v-if="$product.brand && !quickBuyMode" :to="brandTo" class="ar-pdp__brand">{{ $product.brand }}</router-link>
        <h1 class="ar-pdp__title">{{ $product.title }}</h1>
        <div class="ar-pdp__meta">
          <span>{{ t("argon.pdp.code", "Product code {code}", { code: $product.sku || $product.id }) }}</span>
          <a v-if="$product.rate_count && $product.rate" class="ar-pdp__rate" href="#ar-reviews" @click.prevent="toReviews">
            <span :style="{ '--k-rate': $product.rate }" class="k-stars"></span>
            <b>{{ Number($product.rate).toFixed(1) }}</b>
            ({{ t("argon.pdp.reviews", { one: "{n} review", other: "{n} reviews" }, { n: $product.rate_count }) }})
          </a>
        </div>

        <p v-if="!has_original_warranty" class="ar-pdp__warn">
          <span class="ms">error</span>{{ $t("product_info.fake") }}
        </p>

        <div v-if="isSubscription" class="ar-pdp__sub">
          <s-subscription-price-select
            v-model="selected_subscription_price"
            :class="{ pen: !!corresponding_basket_item?.subscription_price_id || !!membership_subscribed_plan }"
            :disabled="!$product.quantity"
            :subscription-prices="subscription_prices"
            return-object
          ></s-subscription-price-select>
        </div>
        <template v-else>
          <div class="ar-price -lg">
            <u-price :amount="money.now" :currency="currency" class="ar-price__now" />
          </div>
          <div v-if="money.save > 0" class="ar-was">
            <span class="ar-save">{{ t("argon.price.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</span>
            <span class="ar-was__t">{{ t("argon.price.was", "Was") }} <s><u-price :amount="money.was" :currency="currency" /></s></span>
          </div>
          <!-- The deal's own end (the chosen variant's when it has its own
               pricing); no end date, no clock. -->
          <div v-if="dealEndsAt" class="ar-pdp__deal">
            <span class="ar-pdp__dealt"><span class="ms">schedule</span>{{ t("argon.pdp.dealEndsIn", "Deal ends in") }}</span>
            <argon-deal-clock :end="dealEndsAt" mode="blocks" />
          </div>
        </template>
        <s-product-section-tax></s-product-section-tax>
        <p :class="stock > 0 ? '-ok' : '-no'" class="ar-pdp__stock">
          <span class="ms">{{ stock > 0 ? "check_circle" : "cancel" }}</span>
          <template v-if="stock > 0 && stock <= 5">{{ t("argon.pdp.onlyLeft", "Only {n} left", { n: stock }) }}</template>
          <template v-else-if="stock > 0">{{ t("argon.pdp.inStock", "In stock") }}</template>
          <template v-else>{{ t("argon.buy.outOfStock", "Out of stock") }}</template>
        </p>
      </section>

      <!-- ▆▆▆▆ 2. The choice ▆▆▆▆ -->
      <section v-if="tiles.length" class="ar-pcard ar-pdp__choice">
        <p class="ar-lbl">
          {{ dimWord }}: <b>{{ currentLabel }}</b>
        </p>
        <div :aria-label="dimWord" :class="{ '-text': !tilesHavePhotos }" class="ar-vtiles" role="radiogroup">
          <button
            v-for="tile in tiles"
            :key="tile.v.id"
            :aria-checked="current_variant && current_variant.id === tile.v.id ? 'true' : 'false'"
            :class="{ '-on': current_variant && current_variant.id === tile.v.id, '-out': !(tile.v.quantity > 0) }"
            class="ar-vtile"
            role="radio"
            type="button"
            @click="current_variant = tile.v"
          >
            <span v-if="tilesHavePhotos" class="ar-vtile__ph"><img :src="tile.img" alt="" loading="lazy" /></span>
            <span class="ar-vtile__l">
              <i v-if="tile.swatch" :style="{ background: tile.swatch }" aria-hidden="true"></i>{{ tile.label }}
            </span>
            <small v-if="tile.price !== null"><u-price :amount="tile.price" :currency="currency" /></small>
            <small v-if="!(tile.v.quantity > 0)" class="-out">{{ t("argon.buy.outOfStock", "Out of stock") }}</small>
          </button>
        </div>
      </section>
      <section v-else-if="product_variants.length" class="ar-pcard ar-pdp__choice -selldone">
        <s-product-section-variants
          v-model:current-variant="current_variant"
          v-model:filter="filter"
          v-model:selection-values="selection_values"
        ></s-product-section-variants>
      </section>

      <!-- ▆▆▆▆ 3. Buy ▆▆▆▆ -->
      <section ref="buyCard" class="ar-pcard ar-pdp__buy">
        <div class="ar-pdp__more">
          <s-product-section-service v-model:preferences="preferences"></s-product-section-service>
          <s-product-section-valuation
            v-if="preferences && preferences.valuation"
            :correspondingBasketItem="corresponding_basket_item"
            :current-variant="current_variant"
            :preferences="preferences"
          ></s-product-section-valuation>
        </div>

        <s-product-section-extra-pricings
          :current-variant="current_variant"
          :preferences="preferences"
          :quantity="corresponding_basket_item?.count"
          :selected-vendor-product="selected_vendor_product"
          @select="(val) => $refs.buy_section?.triggerBuyButton(val.min)"
        ></s-product-section-extra-pricings>

        <kalio-basket-line
          v-if="canBuy && corresponding_basket_item"
          :line="corresponding_basket_item"
          :product="$product"
          :stock="current_variant ? current_variant.quantity : $product.quantity"
          class="ar-pdp__line"
        />
        <!-- A plain physical product: the quantity, then Add to cart. -->
        <div v-else-if="simpleBuy" class="ar-pdp__add">
          <label class="ar-qty">
            <span class="k-sr">{{ t("argon.pdp.qty", "Quantity") }}</span>
            <select v-model.number="qty" :aria-label="t('argon.pdp.qty', 'Quantity')" :disabled="stock <= 0">
              <option v-for="n in qtyOptions" :key="n" :value="n">{{ n }}</option>
            </select>
            <span aria-hidden="true" class="ms">expand_more</span>
          </label>
          <button :disabled="stock <= 0 || adding" class="ar-btn -buy" type="button" @click="addToCart">
            {{ stock > 0 ? t("card.addToBasket", "Add to cart") : t("argon.buy.outOfStock", "Out of stock") }}
          </button>
        </div>
        <s-product-section-buy-button
          v-else
          ref="buy_section"
          :can-buy="canBuy"
          :current-variant="current_variant"
          :hss-sticky-but-button="hssStickyButButton"
          :preferences="preferences"
          :quick-buy-mode="quickBuyMode"
          :selected-subscription-price="selected_subscription_price"
          :selected-vendor-product="selected_vendor_product"
          class="ar-pdp__selldone-buy"
        ></s-product-section-buy-button>

        <div class="ar-pdp__acts">
          <button :aria-pressed="isSaved ? 'true' : 'false'" :class="{ '-on': isSaved }" class="ar-textbtn" type="button" @click="toggleSave">
            <span :class="{ fill: isSaved }" class="ms">favorite</span>{{ isSaved ? t("argon.pdp.inWishlist", "In your wishlist") : t("argon.pdp.addWishlist", "Add to wishlist") }}
          </button>
          <button :aria-pressed="comparing ? 'true' : 'false'" :class="{ '-on': comparing }" class="ar-textbtn" type="button" @click="toggleCompare">
            <span class="ms">{{ comparing ? "check_box" : "check_box_outline_blank" }}</span>{{ t("argon.footer.compare", "Compare") }}
          </button>
        </div>

        <ul v-if="!quickBuyMode" class="ar-pdp__ways">
          <li v-for="w in ways" :key="w.key">
            <span class="ms">{{ w.icon === "storefront" ? "storefront" : "local_shipping" }}</span>
            <span>
              {{ w.word }}<template v-if="w.free"> · {{ t("shipping.free", "Free") }}</template
              ><template v-else-if="w.freeOver"> · {{ t("shipping.freeOver", "Free over {amount}", { amount: moneyFrom(w.freeOver, w.currency, { short: "auto" }) }) }}</template>
            </span>
          </li>
          <li v-if="!ways.length"><span class="ms">local_shipping</span><span>{{ t("argon.pdp.waysAtCheckout", "Delivery options at checkout") }}</span></li>
          <!-- Selldone's stock nudge ("Almost out of stock…"), as a row of the
               same list: one left edge, one 24px icon box, wrapped words under
               the words (its own row had an emoji, other padding and size). -->
          <li v-if="incentHtml" class="-nudge"><span class="ms">{{ incentIcon }}</span><span v-html="incentHtml"></span></li>
        </ul>

        <!-- Selldone's nudge is read from here (hidden) and drawn in the list above. -->
        <s-product-section-incentivise
          ref="incent"
          :variant="current_variant"
          :vendorProduct="selected_vendor_product"
          class="ar-incent-src"
        ></s-product-section-incentivise>
        <s-storefront-coupons-list :product-id="$product.id" :variant-id="current_variant ? current_variant.id : undefined"></s-storefront-coupons-list>

        <router-link v-if="quickBuyMode" :to="productTo" class="ar-link ar-pdp__full">{{ t("argon.pdp.fullDetails", "See full details") }}<span class="ms k-flip">chevron_right</span></router-link>
      </section>

      <!-- ▆▆▆▆ 4. Complete your purchase ▆▆▆▆ -->
      <argon-complete v-if="!quickBuyMode" :product="$product" :variant="current_variant" />

      <p v-if="!quickBuyMode" class="ar-pdp__ask">
        <span class="ms">support_agent</span>{{ t("argon.pdp.questions", "Questions about it?") }}
        <router-link :to="{ name: window.$storefront.routes.SHOP_CONTACT_US }">{{ t("argon.footer.contact", "Contact us") }}</router-link>
      </p>
    </div>

    <!-- Phone: a buy bar at the foot of the screen once the buy card has
         scrolled away (the price, and Add to cart, or the count in the cart
         and Checkout). A plain panel teleported to the body. -->
    <teleport to="body">
      <transition name="ar-bar">
        <div v-if="showBar" :aria-label="t('argon.pdp.buy', 'Buy')" class="ar-buybar" role="region">
          <div class="ar-buybar__p">
            <u-price :amount="money.now" :currency="currency" class="ar-buybar__now" />
            <small v-if="money.save > 0">{{ t("argon.price.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</small>
          </div>
          <router-link v-if="corresponding_basket_item" :to="cartTo" class="ar-btn ar-buybar__go">
            <span class="ms">shopping_cart</span>{{ t("argon.pdp.inCartCheckout", "{n} in cart · Checkout", { n: corresponding_basket_item.count }) }}
          </router-link>
          <button v-else-if="simpleBuy" :disabled="stock <= 0 || adding" class="ar-btn ar-buybar__go" type="button" @click="addToCart">
            {{ stock > 0 ? t("card.addToBasket", "Add to cart") : t("argon.buy.outOfStock", "Out of stock") }}
          </button>
          <button v-else class="ar-btn ar-buybar__go" type="button" @click="toBuy">{{ t("card.seeOptions", "Choose options") }}</button>
        </div>
      </transition>
    </teleport>

    <basket-item-user-message-form
      v-if="basket"
      :basket="basket"
      :product="$product"
      :variant-id="current_variant ? current_variant.id : null"
      class="ar-pdp__note"
    ></basket-item-user-message-form>
  </div>
</template>

<script>
import { currentCurrency, money as moneyFrom } from "../../region-switcher/region";
import { t } from "../../kalio/i18n/kalio-i18n";
import KalioProductOverview from "../../kalio/product/KalioProductOverview.vue";
import ArgonDealClock from "../ArgonDealClock.vue";
import ArgonComplete from "./ArgonComplete.vue";
import { addCount } from "../../kalio/kalio-basket";
import { waysOf } from "../../walio/walio-home";
import { brandRoute, colourName, dealEnd, moneyOf, moneyText, saved, swatchBg, toggleSaved, variantDimension } from "../argon";

export default {
  name: "ArgonProductOverview",
  extends: KalioProductOverview,
  components: { ArgonDealClock, ArgonComplete },

  data() {
    return { compact: false, qty: 1, adding: false, galAt: 0, galN: 0, incentRaw: "", buyInView: true };
  },

  computed: {
    currency() {
      return currentCurrency();
    },
    productTo() {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: this.$product.id } };
    },
    brandTo() {
      return brandRoute(this.$product.brand);
    },
    ways() {
      return waysOf(this.shop || this.$shop).slice(0, 3);
    },
    enabledVariants() {
      return this.product_variants.filter((v) => v.enable !== false && v.enable !== 0);
    },
    dimension() {
      return variantDimension(this.enabledVariants);
    },
    dimWord() {
      const w = this.dimension?.word || t("argon.variant.option", "option");
      return w[0].toLocaleUpperCase() + w.slice(1);
    },
    /* One dimension: a tile per variant with its own photo and price. */
    tiles() {
      const d = this.dimension;
      if (!d || d.key === "mixed") return [];
      return this.enabledVariants.map((v) => {
        const own = v.pricing && v.price != null;
        return {
          v,
          img: window.CDN.GET_SHOP_IMAGE_PATH(v.image || this.$product.icon, 128),
          swatch: d.key === "color" ? swatchBg(v.color) : null,
          label: d.key === "color" ? colourName(v.color) || t("argon.filter.colour", "Colour") : v[d.key],
          price: own ? moneyOf(this.shop, this.$product, v, this.currency).now : null,
        };
      });
    },
    tilesHavePhotos() {
      return this.dimension?.key === "color" || this.enabledVariants.some((v) => v.image);
    },
    currentLabel() {
      const tile = this.tiles.find((x) => this.current_variant && x.v.id === this.current_variant.id);
      return tile ? tile.label : "";
    },
    money() {
      return moneyOf(this.shop, this.$product, this.current_variant, this.currency);
    },
    dealEndsAt() {
      return dealEnd(this.$product, this.current_variant);
    },
    stock() {
      if (this.current_variant) return this.current_variant.quantity || 0;
      return this.$product.quantity || 0;
    },
    incentLead() {
      const m = this.incentRaw.match(/^(\p{Extended_Pictographic}️?)\s*/u);
      return m ? m[1] : "";
    },
    incentHtml() {
      return this.incentRaw.replace(/^(\p{Extended_Pictographic}️?)\s*/u, "").trim();
    },
    incentIcon() {
      const e = this.incentLead;
      if (/[⌛⏳]/u.test(e)) return "hourglass_bottom";
      if (/\u{1F6D2}/u.test(e)) return "shopping_cart";
      if (/\u{1F525}/u.test(e)) return "local_fire_department";
      if (/⚡/u.test(e)) return "bolt";
      return "trending_up";
    },
    showBar() {
      return this.compact && !this.quickBuyMode && !this.buyInView && !this.isSubscription && (this.simpleBuy || !!this.corresponding_basket_item);
    },
    cartTo() {
      return { name: window.$storefront.routes.BASKET_PAGE, params: { type: (this.$product.type || "PHYSICAL").toUpperCase() } };
    },
    /* A plain physical product gets Argon's quantity menu and Add to cart;
       anything Selldone's own button knows more about keeps that button. */
    simpleBuy() {
      const p = this.$product;
      if (!this.canBuy || !p || this.isSubscription) return false;
      if ((p.type || "PHYSICAL") !== "PHYSICAL") return false;
      if (this.preferences && (this.preferences.valuation || this.preferences.service)) return false;
      if (p.valuation || (p.extra_pricings && p.extra_pricings.length)) return false;
      if (this.product_variants.length && !this.current_variant) return false;
      return true;
    },
    qtyOptions() {
      const max = Math.max(1, Math.min(10, this.stock || 1));
      return Array.from({ length: max }, (_, i) => i + 1);
    },
    comparing() {
      return (this.$store.getters.getProductsComparison || []).some((p) => p.id === this.$product.id);
    },
    isSaved() {
      return saved[this.$product.id] ?? !!this.$product.wishlist;
    },
  },

  mounted() {
    /* Selldone's slideshow keeps its own index; Argon's arrows and counter
       follow it. */
    this.$watch(
      () => [this.$refs.gallery?.index ?? 0, this.$refs.gallery?.images_list_embedded?.length ?? 0],
      ([at, n]) => {
        this.galAt = at;
        this.galN = n;
      },
      { immediate: true },
    );
    /* Selldone's stock nudge: its words, without the leading emoji (drawn
       as an icon in the list instead). */
    this.$watch(
      () => (this.$refs.incent ? this.$refs.incent.message || "" : ""),
      (m) => (this.incentRaw = String(m || "").trim()),
      { immediate: true },
    );
    this.onResize();
    window.addEventListener("resize", this.onResize, { passive: true });
    /* The phone's buy bar shows while the buy card is out of view. */
    if (typeof IntersectionObserver !== "undefined" && this.$refs.buyCard) {
      this.buyIo = new IntersectionObserver((entries) => (this.buyInView = entries.some((e) => e.isIntersecting)), { rootMargin: "0px 0px -40px 0px" });
      this.buyIo.observe(this.$refs.buyCard);
    }
  },
  beforeUnmount() {
    this.buyIo?.disconnect();
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    moneyFrom,
    onResize() {
      this.compact = window.innerWidth < 900;
    },
    moneyWhole(n) {
      return moneyText(n, this.currency, Math.round(n) === n);
    },
    toReviews() {
      document.getElementById("ar-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    toSpecs() {
      document.getElementById("ar-specs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    toBuy() {
      this.$refs.buyCard?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    galGo(d) {
      const g = this.$refs.gallery;
      if (!g || !this.galN) return;
      g.index = (g.index + d + this.galN) % this.galN;
    },
    galZoom() {
      const el = this.$refs.gallery?.$el;
      (el?.querySelector(".v-window-item--active .swiper-slide-image") || el?.querySelector(".swiper-slide-image"))?.click();
    },
    addToCart() {
      this.adding = true;
      addCount(this, this.$product, this.current_variant, this.qty).finally(() => {
        this.adding = false;
        this.qty = 1;
      });
    },
    toggleCompare() {
      if (this.comparing) this.removeFromProductComparison(this.$product, null);
      else this.addToProductComparison(this.$product, this.current_variant, true);
    },
    toggleSave() {
      toggleSaved(this, this.$product);
    },
  },
};
</script>
