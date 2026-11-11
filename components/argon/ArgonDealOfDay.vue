<!--
  Argon — the Deal of the Day, wide.

  A yellow block with the saving in percent and "Ends in" over the days,
  hours, minutes and seconds left on this deal (its own end date, the picked
  colour's when that colour has its own pricing; no end date, no clock), the
  product big, its colours, the price, Add to cart and Compare, and "More top
  deals" beside it. The deal is one of the shop's biggest savings, a
  different one each day (argon.ts dealOfTheDay).
-->
<template>
  <section :aria-label="t('argon.dotd.title', 'Deal of the Day')" class="ar-dotd">
    <div class="ar-dotd__badge">
      <small>{{ t("argon.dotd.title", "Deal of the Day") }}</small>
      <b v-if="off > 0">{{ t("argon.dotd.off", "{off}% off", { off }) }}</b>
      <argon-deal-clock :end="dealEndsAt" mode="blocks" />
    </div>
    <router-link :to="productTo" class="ar-dotd__img">
      <img :alt="product.title" :src="picture" :srcset="srcset" sizes="(max-width: 900px) 40vw, 320px" @error="dropSrcset" />
    </router-link>
    <div class="ar-dotd__info">
      <span v-if="product.brand" class="ar-brand">{{ product.brand }}</span>
      <router-link :to="productTo" class="ar-dotd__t">{{ product.title }}</router-link>
      <div v-if="colours.length" :aria-label="t('argon.card.colourOf', 'Colour of {name}', { name: product.title })" class="ar-swrow -big" role="radiogroup">
        <button
          v-for="(v, i) in colours.slice(0, 6)"
          :key="i"
          :aria-checked="i === pick ? 'true' : 'false'"
          :aria-label="colourName(v.color)"
          :class="{ '-on': i === pick, '-out': v.quantity === 0 }"
          :style="{ '--sw': swatchBg(v.color) }"
          :title="colourName(v.color)"
          class="ar-sw"
          role="radio"
          type="button"
          @click="pick = i"
        ></button>
      </div>
      <div v-else-if="chips.length" class="ar-caps"><span v-for="c in chips.slice(0, 4)" :key="c">{{ c }}</span></div>
      <div class="ar-price -lg">
        <u-price :amount="money.now" :currency="currency" class="ar-price__now" />
        <span v-if="money.save > 0" class="ar-save">{{ t("argon.price.save", "Save {amount}", { amount: moneyWhole(money.save) }) }}</span>
      </div>
      <div class="ar-was"><template v-if="money.was">{{ t("argon.price.was", "Was") }} <s><u-price :amount="money.was" :currency="currency" /></s></template></div>
      <div class="ar-dotd__buy">
        <div v-if="shown > 0" :class="{ '-busy': busy }" :aria-label="t('card.qtyInBasket', 'Quantity in cart')" class="ar-step" role="group">
          <button :aria-label="shown > 1 ? t('cart.qty.fewer', 'One fewer') : t('cart.qty.remove', 'Remove from cart')" type="button" @click="step(-1)"><span class="ms">{{ shown > 1 ? "remove" : "delete" }}</span></button>
          <output aria-live="polite"><b>{{ shown }}</b><small> {{ t("card.inBasket", "in cart") }}</small></output>
          <button :aria-label="t('cart.qty.more', 'One more')" type="button" @click="step(1)"><span class="ms">add</span></button>
        </div>
        <button v-else-if="soldOut" class="ar-btn -off" disabled type="button">{{ t("argon.buy.outOfStock", "Out of stock") }}</button>
        <button v-else-if="choose" class="ar-btn" type="button" @click="$emit('quick-buy', product)"><span class="ms">tune</span>{{ t("argon.buy.choose", "Choose {what}", { what: dimension.word }) }}</button>
        <button v-else class="ar-btn" type="button" @click="add"><span class="ms">add_shopping_cart</span>{{ t("card.addToBasket", "Add to cart") }}</button>
        <button :aria-pressed="comparing ? 'true' : 'false'" :class="{ '-on': comparing }" class="ar-link" type="button" @click="toggleCompare">
          <span class="ms">{{ comparing ? "check_box" : "compare_arrows" }}</span>{{ comparing ? t("card.compare.on", "Comparing") : t("argon.footer.compare", "Compare") }}
        </button>
      </div>
    </div>
    <div v-if="more.length" class="ar-dotd__more">
      <h3>{{ t("argon.dotd.more", "More top deals") }}</h3>
      <router-link v-for="p in more" :key="p.id" :to="{ name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } }" class="ar-mini">
        <span class="ar-mini__ph"><img :src="thumb(p)" alt="" loading="lazy" /></span>
        <span><b>{{ p.title }}</b><em><u-price :amount="nowOf(p).now" :currency="currency" /><s v-if="nowOf(p).was"><u-price :amount="nowOf(p).was" :currency="currency" /></s></em></span>
      </router-link>
    </div>
  </section>
</template>

<script>
import BuyMixin from "./argon-buy";
import { dropSrcset, productSrcset } from "../kalio/kalio-catalog";
import ArgonDealClock from "./ArgonDealClock.vue";
import { moneyOf } from "./argon";

export default {
  name: "ArgonDealOfDay",
  components: { ArgonDealClock },
  mixins: [BuyMixin],
  props: {
    product: { type: Object, required: true },
    more: { type: Array, default: () => [] },
  },
  computed: {
    picture() {
      return this.pictureIcon ? window.CDN.GET_SHOP_IMAGE_PATH(this.pictureIcon, null) : null;
    },
    srcset() {
      return productSrcset(this.product, this.variant?.image || null);
    },
  },
  methods: {
    dropSrcset,
    thumb(p) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 128);
    },
    nowOf(p) {
      return moneyOf(this.shop, p, null, this.currency);
    },
  },
};
</script>
