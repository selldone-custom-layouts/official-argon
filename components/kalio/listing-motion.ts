/*
 * Listing motion — how a results grid shows that it is loading (the owner,
 * 10 November 2026: the thin green line sliding over the cards was the only
 * sign; "a nicer animation").
 *
 * A small, reusable piece for every Kalio-based Layout (with
 * style/listing-motion.scss):
 *  - while a request runs, the cards stay in place, softly dimmed and not
 *    clickable, and a small "Updating results…" pill shows under the filter
 *    row (no layout jump);
 *  - new cards fade up into place, staggered (CSS, on insertion);
 *  - the first load shows skeleton cards in the grid's shape;
 *  - "load more" shows skeleton cards at the end;
 *  - with prefers-reduced-motion: only the dim and the pill.
 *
 * Selldone's SProductsListing keeps its state to itself, so this module adds
 * two things to it once, when first imported (no change in modules/): its
 * fetchData() notes whether a request is a "more" page, and a watcher on its
 * busy_fetch emits "lm-state" { busy, more, count }. The page listens with
 * listingMotion():
 *
 *   import { listingMotion } from "…/kalio/listing-motion";
 *   data: () => ({ lm: listingMotion() }),
 *   <s-products-listing :class="lm.gridClass()" @lm-state="lm.onState" … />
 *   <listing pill / skeletons from lm.state (see StorefrontPageProducts.vue)>
 */

import { reactive } from "vue";
import SProductsListing from "@selldone/components-vue/storefront/products/listing/SProductsListing.vue";

const L: any = SProductsListing;

if (!L.__listingMotion) {
  L.__listingMotion = true;
  const fetchData = L.methods?.fetchData;
  if (fetchData) {
    L.methods.fetchData = function (this: any, withParent = true, more = false) {
      this.lmMore = !!more;
      return fetchData.call(this, withParent, more);
    };
  }
  L.mixins = [
    ...(L.mixins || []),
    {
      watch: {
        busy_fetch(this: any, busy: boolean) {
          this.$emit("lm-state", { busy: !!busy, more: !!this.lmMore, count: (this.products || []).length });
        },
      },
    },
  ];
  if (Array.isArray(L.emits) && !L.emits.includes("lm-state")) L.emits.push("lm-state");
}

export interface ListingMotionState {
  /** A request is running. */
  busy: boolean;
  /** …and it is a "load more" page. */
  more: boolean;
  /** Cards shown when it started. */
  count: number;
  /** The first answer has arrived. */
  loaded: boolean;
}

export function listingMotion() {
  const state = reactive<ListingMotionState>({ busy: false, more: false, count: 0, loaded: false });
  return reactive({
    state,
    onState(e: { busy: boolean; more: boolean; count: number }) {
      state.busy = e.busy;
      state.more = e.busy && e.more;
      state.count = e.count;
      if (!e.busy) state.loaded = true;
    },
    /** The cards are dimmed (a new filter, sort or search on shown cards). */
    get updating(): boolean {
      return state.busy && !state.more && state.count > 0;
    },
    /** Nothing shown yet: skeleton cards in the grid's shape. */
    get first(): boolean {
      return state.busy && state.count === 0;
    },
    /** A "load more" page: skeleton cards at the end. */
    get loadingMore(): boolean {
      return state.busy && state.more;
    },
    /** Classes for the listing element. */
    gridClass(): Record<string, boolean> {
      return { "lm-grid": true, "-lm-busy": state.busy && !state.more && state.count > 0, "-lm-more": state.busy && state.more };
    },
  });
}
