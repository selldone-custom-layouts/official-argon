<!--
  Argon — the results page's filter row, after a big catalogue store's: no
  side column; a row of dropdown buttons over the grid — Sort by, Category,
  Price, Brands, Colour, the category's first spec filters and On sale —
  and an "All filters" button that opens a side sheet with every filter
  (Show results applies them). The result count sits at the right.

  Each dropdown applies at once (ticks, swatches, the price slider and its
  two short boxes). The groups are the listing's live Selldone filter record
  (walio-filters.ts: brands, variant values, the merchant's spec keys); the
  page hands every change to the listing. The side sheet is a plain panel
  teleported to the body (a fixed panel inside a v-dialog lands off-screen
  on a phone).
-->
<template>
  <div class="ar-fbar">
    <div class="ar-fbar__row">
      <!-- Sort by -->
      <v-menu :close-on-content-click="true" location="bottom start" offset="6">
        <template v-slot:activator="{ props, isActive }">
          <button :class="{ '-open': isActive }" class="ar-fbtn -sort" type="button" v-bind="props">
            <span class="ar-fbtn__k">Sort by</span><b>{{ sortName(sort, sortFallback) }}</b><span class="ms">expand_more</span>
          </button>
        </template>
        <div class="ar-fdd" role="listbox">
          <button
            v-for="s in SORTS"
            :key="s.val"
            :aria-selected="s.val === sort ? 'true' : 'false'"
            :class="{ '-on': s.val === sort }"
            class="ar-fdd__opt"
            role="option"
            type="button"
            @click="$emit('update:sort', s.val)"
          >
            {{ s.name }}<span v-if="s.val === sort" class="ms">check</span>
          </button>
        </div>
      </v-menu>

      <!-- Category -->
      <v-menu v-if="cats.length" location="bottom start" offset="6">
        <template v-slot:activator="{ props, isActive }">
          <button :class="{ '-open': isActive, '-set': !!current }" class="ar-fbtn" type="button" v-bind="props">
            {{ currentCat ? currentCat.title || currentCat.name : "Category" }}<span class="ms">expand_more</span>
          </button>
        </template>
        <div class="ar-fdd -cats">
          <router-link :class="{ '-on': !current }" :to="allTo" class="ar-fdd__opt">All categories</router-link>
          <router-link v-for="c in cats" :key="c.id" :class="{ '-on': c.name === current }" :to="catTo(c)" class="ar-fdd__opt">
            {{ c.title || c.name }}<span v-if="c.name === current" class="ms">check</span>
          </router-link>
        </div>
      </v-menu>

      <!-- Price -->
      <v-menu v-if="has_price" :close-on-content-click="false" location="bottom start" offset="6">
        <template v-slot:activator="{ props, isActive }">
          <button :class="{ '-open': isActive, '-set': priceSet }" class="ar-fbtn" type="button" v-bind="props">
            Price<span class="ms">expand_more</span>
          </button>
        </template>
        <div class="ar-fdd -price">
          <v-range-slider
            v-model="price_draft"
            :max="price_max"
            :min="price_min"
            :step="price_step"
            class="ar-fdd__slider"
            color="primary"
            hide-details
            thumb-size="18"
            track-size="3"
            @end="applyPrice(price_draft)"
          ></v-range-slider>
          <div class="ar-prange">
            <label><span>$</span><input :value="Math.round(price_draft[0])" aria-label="Lowest price" inputmode="numeric" @change="typed(0, $event)" /></label>
            <em>to</em>
            <label><span>$</span><input :value="Math.round(price_draft[1])" aria-label="Highest price" inputmode="numeric" @change="typed(1, $event)" /></label>
          </div>
          <button v-if="priceSet" class="ar-fdd__clear" type="button" @click="applyPrice([price_min, price_max])">Any price</button>
        </div>
      </v-menu>

      <!-- Brands, Colour, then the category's first spec filters -->
      <v-menu v-for="group in barGroups" :key="group.kind + group.key" :close-on-content-click="false" location="bottom start" offset="6">
        <template v-slot:activator="{ props, isActive }">
          <button :class="{ '-open': isActive, '-set': picked(group).length }" class="ar-fbtn" type="button" v-bind="props">
            {{ groupLabel(group) }}<b v-if="picked(group).length" class="ar-fbtn__n">{{ picked(group).length }}</b><span class="ms">expand_more</span>
          </button>
        </template>
        <div class="ar-fdd">
          <div v-if="group.key === 'colors'" class="ar-swfilter">
            <button
              v-for="v in group.values"
              :key="v"
              :aria-label="colourName(v)"
              :aria-pressed="picked(group).includes(v) ? 'true' : 'false'"
              :class="{ '-on': picked(group).includes(v) }"
              :style="{ '--sw': swatchBg(v) }"
              :title="colourName(v)"
              type="button"
              @click="toggle(group, v)"
            ></button>
          </div>
          <template v-else>
            <label v-for="v in group.values" :key="v" :title="valueLabel(v)" class="t-check">
              <input :checked="picked(group).includes(v)" type="checkbox" @change="toggle(group, v)" />
              <span class="t-check__box"><v-icon size="16">check</v-icon></span>
              <span class="t-check__t">{{ valueLabel(v) }}</span>
            </label>
          </template>
          <button v-if="picked(group).length" class="ar-fdd__clear" type="button" @click="emit(withGroup(modelValue, group, []))">Clear</button>
        </div>
      </v-menu>

      <!-- On sale -->
      <button
        v-if="!ignore.includes('discount')"
        :aria-pressed="value.only_has_discount ? 'true' : 'false'"
        :class="{ '-set': value.only_has_discount }"
        class="ar-fbtn -sale"
        type="button"
        @click="toggleDeals"
      >
        <span class="ms">sell</span>On sale
      </button>

      <button class="ar-fbtn -all" type="button" @click="panel = true">
        <span class="ms">tune</span>All filters<b v-if="on_count" class="ar-fbtn__n">{{ on_count }}</b>
      </button>
    </div>
    <p v-if="total !== null" class="ar-fbar__count">{{ total }} {{ total === 1 ? "result" : "results" }}</p>
  </div>

  <!-- ▆▆▆▆ All filters: a side sheet ▆▆▆▆ -->
  <teleport to="body">
    <transition name="ar-fade">
      <div v-if="panel" aria-hidden="true" class="ar-sheet-scrim" @click="panel = false"></div>
    </transition>
    <transition name="ar-slide-r">
      <div v-if="panel" aria-label="All filters" aria-modal="true" class="ar-sheet" role="dialog" @keydown.esc="panel = false">
        <header class="ar-sheet__h">
          <b>All filters</b>
          <button ref="sheetX" aria-label="Close" class="ar-x" type="button" @click="panel = false"><span class="ms">close</span></button>
        </header>
        <div class="ar-sheet__b">
          <section class="ar-sgrp">
            <h5>Sort by</h5>
            <div class="ar-sgrp__opts">
              <button v-for="s in SORTS" :key="s.val" :aria-pressed="draft_sort === s.val" :class="{ '-on': draft_sort === s.val }" class="ar-opt" type="button" @click="draft_sort = s.val">
                {{ s.name }}
              </button>
            </div>
          </section>
          <section v-if="!ignore.includes('discount')" class="ar-sgrp">
            <label class="t-switch">
              <span>On sale only</span>
              <input v-model="draft.only_has_discount" type="checkbox" />
              <i></i>
            </label>
          </section>
          <section v-if="has_price" class="ar-sgrp">
            <h5>Price</h5>
            <v-range-slider v-model="draft_price" :max="price_max" :min="price_min" :step="price_step" color="primary" hide-details thumb-size="18" track-size="3" />
            <div class="ar-prange -static">
              <span>{{ money(draft_price[0]) }}</span><em>to</em><span>{{ money(draft_price[1]) }}</span>
            </div>
          </section>
          <section v-for="group in ordered" :key="'p' + group.kind + group.key" class="ar-sgrp">
            <h5>{{ groupLabel(group) }}</h5>
            <div v-if="group.key === 'colors'" class="ar-swfilter">
              <button
                v-for="v in group.values"
                :key="v"
                :aria-label="colourName(v)"
                :aria-pressed="draftPicked(group).includes(v) ? 'true' : 'false'"
                :class="{ '-on': draftPicked(group).includes(v) }"
                :style="{ '--sw': swatchBg(v) }"
                :title="colourName(v)"
                type="button"
                @click="draftToggle(group, v)"
              ></button>
            </div>
            <div v-else class="ar-sgrp__opts">
              <button
                v-for="v in group.values"
                :key="v"
                :aria-pressed="draftPicked(group).includes(v)"
                :class="{ '-on': draftPicked(group).includes(v) }"
                class="ar-opt"
                type="button"
                @click="draftToggle(group, v)"
              >
                {{ valueLabel(v) }}
              </button>
            </div>
          </section>
        </div>
        <footer class="ar-sheet__f">
          <button class="ar-btn -line" type="button" @click="draftClear">Clear all</button>
          <button class="ar-btn" type="button" @click="draftApply">Show results</button>
        </footer>
      </div>
    </transition>
  </teleport>
</template>

<script>
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { PriceHelper } from "@selldone/core-js/helper";
import { SORTS, clone, countOn, groupsOf, picked, sortName, valueLabel, withGroup } from "../../walio/shop/walio-filters";
import { colourName, moneyText, swatchBg } from "../argon";
import { aisleRoute, catalogueRoute } from "../../kalio/kalio-catalog";

export default {
  name: "ArgonFilterBar",
  mixins: [CurrencyMixin],
  inject: ["$shop"],
  emits: ["update:modelValue", "update:sort"],

  props: {
    filters: { type: Object, default: null },
    modelValue: { type: Object, default: null },
    sort: { type: String, default: null },
    sortFallback: { type: String, default: "Relevance" },
    cats: { type: Array, default: () => [] },
    current: { type: String, default: null },
    total: { type: Number, default: null },
  },

  data() {
    return {
      SORTS,
      panel: false,
      price_draft: [0, 0],
      draft: clone(null),
      draft_price: [0, 0],
      draft_sort: null,
    };
  },

  computed: {
    value() {
      return clone(this.modelValue);
    },
    ignore() {
      return this.filters?.ignore || [];
    },
    groups() {
      return groupsOf(this.filters);
    },
    /* Brands, colours, the other variant values, then the spec keys. */
    ordered() {
      const rank = (x) => (x.kind === "brand" ? 0 : x.key === "colors" ? 1 : x.kind === "variant" ? 2 : 3);
      return [...this.groups].sort((a, b) => rank(a) - rank(b));
    },
    /* On the row: Brands, Colour, then two more (capacity or the first spec keys). */
    barGroups() {
      const brand = this.ordered.filter((g) => g.kind === "brand");
      const colour = this.ordered.filter((g) => g.key === "colors");
      const rest = this.ordered.filter((g) => g.kind !== "brand" && g.key !== "colors");
      return [...brand, ...colour, ...rest.slice(0, 2)];
    },
    currentCat() {
      return this.cats.find((c) => c.name === this.current) || null;
    },
    allTo() {
      return catalogueRoute();
    },
    on_count() {
      return countOn(this.modelValue);
    },
    currency() {
      return this.GetUserSelectedCurrency()?.code;
    },
    price_rows() {
      return (this.filters?.prices || []).filter((row) => this.rate(row.currency, true));
    },
    has_price() {
      return !this.ignore.includes("price") && this.price_rows.length && this.price_max > this.price_min;
    },
    price_min() {
      const values = this.price_rows.map((row) => row.min * this.rate(row.currency, true));
      return values.length ? Math.floor(Math.min(...values)) : 0;
    },
    price_max() {
      const values = this.price_rows.map((row) => row.max * this.rate(row.currency, true));
      return values.length ? Math.ceil(Math.max(...values)) : 0;
    },
    price_step() {
      const span = this.price_max - this.price_min;
      return span > 200 ? 5 : span > 40 ? 1 : 0.5;
    },
    priceSet() {
      return !!(this.modelValue?.prices && Object.keys(this.modelValue.prices).length);
    },
  },

  watch: {
    modelValue: {
      handler(v) {
        this.price_draft = this.rangeOf(v);
      },
      immediate: true,
    },
    price_max() {
      this.price_draft = this.rangeOf(this.modelValue);
    },
    panel(open) {
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) {
        this.draft = clone(this.modelValue);
        this.draft_price = this.rangeOf(this.modelValue);
        this.draft_sort = this.sort;
        this.$nextTick(() => this.$refs.sheetX?.focus());
      }
    },
    $route() {
      this.panel = false;
    },
  },

  beforeUnmount() {
    if (this.panel) document.documentElement.style.overflow = "";
  },

  methods: {
    sortName,
    valueLabel,
    swatchBg,
    colourName,
    withGroup,
    money(n) {
      return moneyText(n, this.currency, true);
    },
    groupLabel(group) {
      if (group.kind === "brand") return "Brands";
      return group.label;
    },
    catTo(c) {
      return aisleRoute(c);
    },
    typed(i, e) {
      const n = Number(String(e.target.value).replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(n)) return;
      const next = [...this.price_draft];
      next[i] = Math.min(this.price_max, Math.max(this.price_min, n));
      if (next[0] > next[1]) next.reverse();
      this.applyPrice(next);
    },
    picked(group) {
      return picked(this.modelValue, group);
    },
    draftPicked(group) {
      return picked(this.draft, group);
    },
    rate(currency, toUser) {
      return toUser
        ? PriceHelper.getExchangeRateValue(this.$shop, currency, this.currency, null)
        : PriceHelper.getExchangeRateValue(this.$shop, this.currency, currency, null);
    },
    pricesFor([lo, hi]) {
      if (lo <= this.price_min && hi >= this.price_max) return null;
      const out = {};
      for (const row of this.price_rows) {
        const r = this.rate(row.currency, false) || 1;
        out[row.currency] = [lo * r, hi * r];
      }
      return out;
    },
    rangeOf(filter) {
      const row = this.price_rows[0];
      const set = row && filter?.prices?.[row.currency];
      if (!set) return [this.price_min, this.price_max];
      const r = this.rate(row.currency, true) || 1;
      return [Math.max(this.price_min, set[0] * r), Math.min(this.price_max, set[1] * r)];
    },
    emit(next) {
      this.$emit("update:modelValue", next);
    },
    toggleDeals() {
      const next = clone(this.modelValue);
      next.only_has_discount = !next.only_has_discount;
      this.emit(next);
    },
    toggle(group, v) {
      const now = this.picked(group);
      this.emit(withGroup(this.modelValue, group, now.includes(v) ? now.filter((x) => x !== v) : [...now, v]));
    },
    applyPrice(range) {
      const next = clone(this.modelValue);
      next.prices = this.pricesFor(range);
      this.price_draft = [...range];
      this.emit(next);
    },
    draftToggle(group, v) {
      const now = this.draftPicked(group);
      this.draft = withGroup(this.draft, group, now.includes(v) ? now.filter((x) => x !== v) : [...now, v]);
    },
    draftClear() {
      this.draft = clone(null);
      this.draft_price = [this.price_min, this.price_max];
    },
    draftApply() {
      const next = clone(this.draft);
      next.prices = this.has_price ? this.pricesFor(this.draft_price) : null;
      this.panel = false;
      if (this.draft_sort !== this.sort) this.$emit("update:sort", this.draft_sort);
      this.emit(next);
    },
  },
};
</script>
