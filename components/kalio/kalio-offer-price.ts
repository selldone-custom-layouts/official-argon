/*
 * Kalio — the struck price follows the chosen seller.
 *
 * SProductSectionPrice (the product page and the quick-buy sheet) shows the
 * chosen seller's own price as the price to pay, but took the struck price
 * and the percent off from the product or its size. On a marketplace those
 * are not the same record: a seller with no discount of their own was shown
 * as "$7.25, now $6.04, 20% off", and on a product with two sellers the
 * struck price was one seller's price plus the size's discount.
 *
 * With a seller chosen, both now come from that seller's offer, the record
 * the basket charges. Without one (a shop that is not a marketplace),
 * nothing changes. The component's options are amended once, when the
 * first page that can show it loads (the product page, the quick-buy
 * sheets, the catalogue), before it is first rendered.
 */

import SProductSectionPrice from "@selldone/components-vue/storefront/product/section/price/SProductSectionPrice.vue";

const section: any = SProductSectionPrice;
const base = section.computed || {};

section.computed = {
  ...base,

  discount_value(this: any) {
    if (!this.selectedVendorProduct) return base.discount_value.call(this);
    return this.getProductDiscountAmount(this.$shop, this.selectedVendorProduct, null);
  },

  discount_percent(this: any) {
    if (!this.selectedVendorProduct) return base.discount_percent.call(this);
    if (this.embedMode && !this.is_valid_embed_price) return 0;
    return this.discountProductPercent(this.$shop, this.selectedVendorProduct, null);
  },
};
