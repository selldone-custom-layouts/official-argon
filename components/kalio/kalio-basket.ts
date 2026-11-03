/*
 * Kalio — the basket from a card or the product page.
 *
 * Small helpers over the storefront's own basket methods (StorefrontMixin:
 * getBasket, AddToBasket, RemoveFromBasket), which every Kalio component
 * has through the app's global mixin. A count sent to AddToBasket is the
 * line's new total, not an increment.
 *
 * quickAdd() is what a card's "+" does: a product with sizes opens the
 * quick-buy sheet so a size is chosen; any other goes straight into the
 * basket, from the cheapest offer that has stock (the offer the card's price
 * is). A guest is asked to sign in first unless the shop takes guest
 * orders, as Selldone's own buy button does.
 */

import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";

/** The basket line for a product (and size), or null. */
export function basketLine(vm: any, product: any, variant: any = null): any {
  if (!product) return null;
  const basket = vm.getBasket(product.type || "PHYSICAL");
  return (
    basket?.items?.find(
      (item: any) => item.product_id === product.id && (variant ? item.variant_id === variant.id : true),
    ) || null
  );
}

export function hasSizes(product: any): boolean {
  return !!(product?.variants && product.variants.length);
}

/** The guest gate of Selldone's buy button; false when sign-in was asked for
 *  (through the app's "need-login" event, which opens KalioSignIn). */
export function mayBuy(vm: any): boolean {
  if (vm.USER() || ShopOptionsHelper.HasGuestCheckout(vm.getShop())) return true;
  EventBus.$emit("need-login", true);
  return false;
}

/** The cheapest enabled offer with stock, for a product sold without sizes. */
export function cheapestOffer(product: any): any {
  const offers = (product?.vendor_products || []).filter(
    (offer: any) => !offer.variant_id && offer.enable !== false && offer.quantity > 0,
  );
  if (!offers.length) return null;
  return offers.reduce((best: any, offer: any) =>
    offer.price - (offer.discount || 0) < best.price - (best.discount || 0) ? offer : best,
  );
}

function add(vm: any, product: any, variant: any, count: number, offer: any): Promise<any> {
  return new Promise((resolve, reject) => {
    vm.AddToBasket(vm.getShop().name, product, variant, count, reject, resolve, null, offer, null);
  });
}

/** Set a basket line to `count`; 0 removes it. */
export function setCount(vm: any, product: any, line: any, count: number): Promise<any> {
  if (count <= 0) {
    return new Promise((resolve, reject) => {
      vm.RemoveFromBasket(product.id, line.variant_id || null, reject, resolve);
    });
  }
  const variant = line.variant_id ? { id: line.variant_id } : null;
  const offer = line.vendor_product_id ? { id: line.vendor_product_id } : null;
  return add(vm, { id: product.id, type: product.type }, variant, count, offer);
}

const fullProducts = new Map<number, Promise<any>>();

function full(product: any): Promise<any> {
  if (!fullProducts.has(product.id)) {
    fullProducts.set(
      product.id,
      window.$storefront.products
        .optimize(60)
        .get(product.id, { no_article: true })
        .then(({ product: loaded }: any) => loaded)
        .catch((error: any) => {
          fullProducts.delete(product.id);
          throw error;
        }),
    );
  }
  return fullProducts.get(product.id)!;
}

/** A card's "+": straight into the basket, or the sheet for a sized product. */
export function quickAdd(vm: any, product: any, openSheet: (product: any) => void): Promise<any> {
  if (hasSizes(product)) {
    openSheet(product);
    return Promise.resolve(null);
  }
  if (!mayBuy(vm)) return Promise.resolve(null);
  return full(product).then((loaded) => {
    if (hasSizes(loaded)) {
      openSheet(product);
      return null;
    }
    const line = basketLine(vm, loaded);
    if (line) return setCount(vm, loaded, line, line.count + 1);
    return add(vm, loaded, null, 1, cheapestOffer(loaded));
  });
}
