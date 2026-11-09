<!--
  Besti — the home page (Home B "Department store", approved by the owner,
  digini-design/home-b.html).

  In order: a photo hero (one slide per category with a wide photo, a white
  card with the category's live "Up to $X off" / "From $Y") with two photo
  tiles beside it; Shop by department (two even rows, never a hole); the
  Deal of the Day; Top deals with category tabs (two rows of five); the
  "Everyday essentials" photo mosaic; Best sellers (from the shop's
  best-seller tag, hidden without it); a wide photo banner; New arrivals; one
  row of brands; a "<Tag> Items" row for every other tag in use; Recently
  viewed (this browser's history); and the four newest articles, last.

  Everything is read from the shop. The photos are matched to categories by
  their name slug; a category without one gets a collage of its products.
-->
<template>
  <div class="b-home">
    <!-- ▆▆▆▆ Hero ▆▆▆▆ -->
    <section v-if="slides.length || !ready" class="b-hero b-wrap" @mouseenter="pause = true" @mouseleave="pause = false">
      <div v-if="!slides.length" class="b-hero__main -skeleton"></div>
      <div v-else :aria-label="`${slide.title || slide.name} deals`" aria-roledescription="slide" class="b-hero__main" role="group">
        <transition mode="out-in" name="b-fade">
          <besti-photo
            :key="slide.id"
            :alt="slide.title || slide.name"
            :photo="photoOf(slide, 'wide')"
            :products="inCategory(slide).slice(0, 4)"
            class="b-hero__photo"
            eager
            sizes="(max-width: 900px) 100vw, 1100px"
          />
        </transition>
        <div class="b-hero__card">
          <small>{{ line(slide) }}</small>
          <h1>{{ slide.title || slide.name }} deals</h1>
          <p v-if="slide.description">{{ slide.description }}</p>
          <div class="b-hero__row">
            <router-link :to="catTo(slide)" class="b-btn">Shop now</router-link>
            <template v-if="slides.length > 1">
              <span class="b-hero__count">{{ at + 1 }} / {{ slides.length }}</span>
              <button aria-label="Previous slide" class="b-round" type="button" @click="go(-1)"><span class="ms">chevron_left</span></button>
              <button aria-label="Next slide" class="b-round" type="button" @click="go(1)"><span class="ms">chevron_right</span></button>
            </template>
          </div>
        </div>
      </div>
      <router-link v-for="c in sideTiles" :key="c.id" :to="catTo(c)" class="b-hero__side">
        <besti-photo :photo="sidePhoto(c)" :products="inCategory(c).slice(0, 3)" sizes="(max-width: 900px) 50vw, 320px" />
        <span>
          <b>{{ c.title || c.name }}</b>
          <small>{{ line(c) }}</small>
          <em>Shop<span class="ms">arrow_forward</span></em>
        </span>
      </router-link>
    </section>

    <!-- ▆▆▆▆ Shop by department: two even rows ▆▆▆▆ -->
    <section v-if="tiles.cats.length" class="b-sec b-wrap">
      <header class="b-head"><h2>Shop by department</h2></header>
      <div :style="{ '--cols': tiles.cols }" class="b-depts">
        <router-link v-for="c in tiles.cats" :key="c.id" :to="catTo(c)" class="b-dtile">
          <span><img v-if="c.icon" :src="catIcon(c)" alt="" loading="lazy" /><span v-else class="ms">category</span></span>
          <b>{{ c.title || c.name }}</b>
        </router-link>
        <router-link v-if="tiles.all" :to="allTo" class="b-dtile -all">
          <span><span class="ms">grid_view</span></span>
          <b>All departments</b>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ Deal of the Day ▆▆▆▆ -->
    <besti-deal-of-day v-if="dotd" :more="moreDeals" :product="dotd" class="b-wrap" @quick-buy="quickBuy" />

    <!-- ▆▆▆▆ Top deals, by category ▆▆▆▆ -->
    <section v-if="topDeals.length" class="b-sec b-wrap">
      <header class="b-head">
        <h2>Top deals</h2>
        <div class="b-tabs" role="tablist">
          <button :aria-selected="!tab" :class="{ '-on': !tab }" role="tab" type="button" @click="tab = null">All</button>
          <button
            v-for="c in dealTabs"
            :key="c.id"
            :aria-selected="tab === c.id"
            :class="{ '-on': tab === c.id }"
            role="tab"
            type="button"
            @click="tab = c.id"
          >
            {{ c.title || c.name }}
          </button>
        </div>
        <router-link :to="dealsTo" class="b-more">See all deals<span class="ms">chevron_right</span></router-link>
      </header>
      <div :class="'-n' + topDeals.length" class="b-grid">
        <besti-card v-for="p in topDeals" :key="p.id" :product="p" @quick-buy="quickBuy" />
      </div>
    </section>

    <!-- ▆▆▆▆ Everyday essentials: one big photo and four ▆▆▆▆ -->
    <section v-if="mosaic.length === 5" class="b-sec b-wrap">
      <header class="b-head"><h2>Everyday essentials</h2></header>
      <div class="b-mosaic">
        <router-link v-for="(c, i) in mosaic" :key="c.id" :class="'-m' + i" :to="catTo(c)" class="b-mo">
          <besti-photo :photo="photoOf(c, 'square')" :products="inCategory(c).slice(0, 4)" :sizes="i ? '(max-width: 900px) 50vw, 330px' : '(max-width: 900px) 100vw, 680px'" />
          <span><b>{{ c.title || c.name }}</b><small>{{ line(c) }}</small></span>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ Best sellers (the shop's best-seller tag) ▆▆▆▆ -->
    <section v-if="bento.big" class="b-sec b-wrap">
      <header class="b-head">
        <h2>Best sellers</h2>
        <router-link v-if="bento.tag" :to="tagTo(bento.tag)" class="b-more">See all<span class="ms">chevron_right</span></router-link>
      </header>
      <div :style="{ '--cols': bento.cols }" class="b-bento">
        <besti-card :product="bento.big" big class="b-bento__big" rank="Best seller" @quick-buy="quickBuy" />
        <besti-card v-for="p in bento.rest" :key="p.id" :product="p" @quick-buy="quickBuy" />
      </div>
    </section>

    <!-- ▆▆▆▆ A wide photo banner ▆▆▆▆ -->
    <section v-if="banner" class="b-wide b-wrap">
      <div class="b-wide__in">
        <besti-photo :photo="photoOf(banner.cat, 'wide')" :products="inCategory(banner.cat).slice(0, 4)" sizes="(max-width: 900px) 100vw, 1400px" />
        <div class="b-wide__txt">
          <small>{{ banner.eyebrow }}</small>
          <h2>{{ banner.title }}</h2>
          <p v-if="banner.cat.description">{{ banner.cat.description }}</p>
          <div class="b-wide__links">
            <router-link v-for="c in banner.links" :key="c.id" :to="catTo(c)"><b>{{ c.title || c.name }}</b><small>{{ line(c) }}</small></router-link>
          </div>
          <router-link :to="catTo(banner.cat)" class="b-btn">{{ banner.cta }}</router-link>
        </div>
      </div>
    </section>

    <!-- ▆▆▆▆ New arrivals ▆▆▆▆ -->
    <besti-rail :more-to="newTo" :products="newest" class="b-wrap" title="New arrivals" @quick-buy="quickBuy" />

    <!-- ▆▆▆▆ Shop by brand: one row, See all opens the rest ▆▆▆▆ -->
    <section v-if="brands.length" class="b-sec b-wrap">
      <header class="b-head">
        <h2>Shop by brand</h2>
        <button v-if="brands.length > brandRow" class="b-more" type="button" @click="all_brands = !all_brands">
          {{ all_brands ? "Show fewer" : "See all brands" }}<span class="ms">{{ all_brands ? "expand_less" : "chevron_right" }}</span>
        </button>
      </header>
      <div :style="{ '--cols': Math.min(brandRow, brands.length) }" class="b-brands">
        <router-link v-for="b in shownBrands" :key="b" :to="brandTo(b)">{{ b }}</router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ A row for every other tag in use ("<Tag> Items") ▆▆▆▆ -->
    <besti-rail
      v-for="t in tagRows"
      :key="t.tag"
      :more-to="tagTo(t.tag)"
      :products="t.products"
      :title="`${tagTitle(t.tag)} Items`"
      class="b-wrap"
      @quick-buy="quickBuy"
    />

    <!-- ▆▆▆▆ Recently viewed (this browser) ▆▆▆▆ -->
    <section v-if="recent.length" class="b-sec b-wrap">
      <header class="b-head">
        <h2>Recently viewed</h2>
        <button class="b-more" type="button" @click="clearRecent">Clear</button>
      </header>
      <div class="b-recent">
        <router-link v-for="p in recent" :key="p.id" :to="productTo(p)" class="b-mini -box">
          <img :src="thumb(p)" alt="" loading="lazy" />
          <span><b>{{ p.title }}</b><em><u-price :amount="nowOf(p)" :currency="currency" /></em></span>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ Tips and guides: the four newest articles, last ▆▆▆▆ -->
    <section v-if="posts.length" class="b-sec b-wrap">
      <header class="b-head">
        <h2>Tips and guides</h2>
        <router-link :to="blogTo" class="b-more">All articles<span class="ms">chevron_right</span></router-link>
      </header>
      <div class="b-blog">
        <router-link v-for="a in posts" :key="a.id" :to="postTo(a)" class="b-post">
          <div class="b-post__img">
            <img v-if="a.image" :src="postImage(a)" :srcset="postSrcset(a)" alt="" loading="lazy" sizes="(max-width: 600px) 78vw, (max-width: 1280px) 45vw, 340px" @error="dropSrcset" />
          </div>
          <time :datetime="a.created_at">{{ dateParts(a.created_at).full }}</time>
          <h3>{{ a.title }}</h3>
          <p v-if="a.desc || a.description">{{ a.desc || a.description }}</p>
        </router-link>
      </div>
    </section>

    <kalio-quick-buy v-model="sheet" :product="picked" />
  </div>
</template>

<script>
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import BestiCard from "./BestiCard.vue";
import BestiRail from "./BestiRail.vue";
import BestiPhoto from "./BestiPhoto.vue";
import BestiDealOfDay from "./BestiDealOfDay.vue";
import KalioQuickBuy from "../kalio/KalioQuickBuy.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute, dropSrcset, photoSrcset } from "../kalio/kalio-catalog";
import { dateParts, journalPage, journalRoute, postRoute } from "../kalio/pages/kalio-journal";
import {
  brandsOf,
  catalogue,
  categoryLine,
  catTiles,
  dealOfTheDay,
  dealsOf,
  forgetViewed,
  isBestSellerTag,
  isNewTag,
  mixByCategory,
  moneyOf,
  moneyText,
  photoOf,
  tagged,
  tagTitle,
  viewedIds,
  withPhoto,
} from "./besti";

const POWER = /power|batter|charg|energy|solar|\brv\b|generator/i;

export default {
  name: "BestiHome",
  components: { BestiCard, BestiRail, BestiPhoto, BestiDealOfDay, KalioQuickBuy },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  data: () => ({
    cats: [],
    products: [],
    tags: new Map(),
    ready: false,
    tags_ready: false,
    at: 0,
    pause: false,
    tab: null,
    all_brands: false,
    brandRow: 8,
    posts: [],
    recent_ids: [],
    sheet: false,
    picked: null,
  }),

  computed: {
    currency() {
      return this.GetUserSelectedCurrency()?.code;
    },
    allTo() {
      return catalogueRoute();
    },
    dealsTo() {
      return dealsRoute();
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
    blogTo() {
      return journalRoute();
    },
    withProducts() {
      const ids = new Set(this.products.map((p) => p.category_id));
      return this.cats.filter((c) => ids.has(c.id));
    },

    /* ── Hero ── */
    banner() {
      const wide = withPhoto(this.withProducts, "wide");
      const power = this.withProducts.filter((c) => POWER.test(`${c.title} ${c.name}`));
      const cat = power.find((c) => photoOf(c, "wide")) || (wide.length > 1 ? wide[wide.length - 1] : null) || power[0] || null;
      if (!cat) return null;
      const isPower = POWER.test(`${cat.title} ${cat.name}`);
      const links = (isPower ? power : [cat]).slice(0, 2);
      return {
        cat,
        links,
        eyebrow: isPower ? "Off-grid and on the road" : "Featured department",
        title: isPower ? "Power that goes where you go" : `${cat.title || cat.name}, picked for you`,
        cta: isPower ? "Shop portable power" : `Shop ${cat.title || cat.name}`,
      };
    },
    slides() {
      const wide = withPhoto(this.withProducts, "wide").filter((c) => !this.banner || c.id !== this.banner.cat.id || withPhoto(this.withProducts, "wide").length < 2);
      if (wide.length) return wide;
      /* No wide photos at all: the categories with the biggest deals, as collages. */
      return this.withProducts.slice(0, 4);
    },
    slide() {
      return this.slides[this.at % Math.max(1, this.slides.length)];
    },
    sideTiles() {
      const used = new Set(this.slides.map((c) => c.id));
      const pool = this.withProducts.filter((c) => !used.has(c.id));
      const tall = withPhoto(pool, "portrait");
      const square = withPhoto(pool, "square");
      return [...tall, ...square, ...pool].filter((c, i, all) => all.indexOf(c) === i).slice(0, 2);
    },

    /* ── Departments ── */
    tiles() {
      return catTiles(this.cats);
    },

    /* ── Deals ── */
    deals() {
      return dealsOf(this.$shop, this.products);
    },
    dotd() {
      return dealOfTheDay(this.$shop, this.products);
    },
    moreDeals() {
      if (!this.dotd) return [];
      return mixByCategory(this.deals.filter((p) => p.id !== this.dotd.id && p.category_id !== this.dotd.category_id), 3);
    },
    dealTabs() {
      const ids = new Set(this.deals.map((p) => p.category_id));
      return this.cats.filter((c) => ids.has(c.id)).slice(0, 6);
    },
    topDeals() {
      const pool = this.deals.filter((p) => !this.dotd || p.id !== this.dotd.id);
      const list = this.tab ? pool.filter((p) => p.category_id === this.tab) : mixByCategory(pool, 10);
      /* Full rows only: five to a row on a computer (CSS hides a short row's spill). */
      return list.slice(0, 10);
    },

    /* ── Mosaic ── */
    mosaic() {
      const used = new Set([...this.slides, ...this.sideTiles].map((c) => c.id));
      const pool = this.withProducts.filter((c) => !used.has(c.id));
      const sq = withPhoto(pool, "square");
      const rest = pool.filter((c) => !sq.includes(c));
      const list = [...sq, ...rest].slice(0, 5);
      return list.length === 5 ? list : [];
    },

    /* ── Best sellers ── */
    bento() {
      const tag = [...this.tags.keys()].find(isBestSellerTag);
      const list = tag ? this.tags.get(tag).filter((p) => p.icon) : [];
      if (!list.length) return { big: null, rest: [], cols: 4, tag: null };
      const [big, ...others] = list;
      /* Two even rows beside the big card: 2 × 4, or fewer columns when there are fewer. */
      const cols = Math.max(1, Math.min(4, Math.floor(others.length / 2)));
      return { big, rest: others.slice(0, cols * 2), cols, tag };
    },

    /* ── New arrivals: the shop's new-arrival tag, else the newest ── */
    newest() {
      if (!this.ready) return null;
      const tag = [...this.tags.keys()].find(isNewTag);
      const tagged = tag ? this.tags.get(tag) : [];
      if (tagged.length >= 4) return mixByCategory(tagged, 12);
      return mixByCategory(
        [...this.products].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || b.id - a.id),
        12,
      );
    },

    /* ── Brands ── */
    brands() {
      return brandsOf(this.products);
    },
    shownBrands() {
      return this.all_brands ? this.brands : this.brands.slice(0, this.brandRow);
    },

    /* ── Every other tag: "<Tag> Items" ── */
    tagRows() {
      return [...this.tags.entries()]
        .filter(([t, list]) => !isBestSellerTag(t) && !isNewTag(t) && list.length)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 6)
        .map(([tag, list]) => ({ tag, products: mixByCategory(list, 12) }));
    },

    /* ── Recently viewed ── */
    recent() {
      const map = new Map(this.products.map((p) => [p.id, p]));
      return this.recent_ids.map((id) => map.get(id)).filter(Boolean).slice(0, 6);
    },
  },

  watch: {
    slides(list) {
      if (this.at >= list.length) this.at = 0;
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
    catalogue().then((list) => {
      this.products = list;
      this.ready = true;
    });
    tagged().then((map) => {
      this.tags = map;
      this.tags_ready = true;
    });
    this.recent_ids = viewedIds();
    journalPage({ page: 1, limit: 8 })
      .then(({ articles }) => (this.posts = articles.slice(0, 4)))
      .catch(() => (this.posts = []));
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (!still) {
      this.timer = setInterval(() => {
        if (!this.pause && !document.hidden && this.slides.length > 1) this.at = (this.at + 1) % this.slides.length;
      }, 7000);
    }
  },

  beforeUnmount() {
    clearInterval(this.timer);
  },

  methods: {
    photoOf,
    tagTitle,
    dateParts,
    dropSrcset,
    go(d) {
      const n = this.slides.length;
      this.at = (this.at + d + n) % n;
    },
    catTo(c) {
      return aisleRoute(c);
    },
    catIcon(c) {
      return window.CDN.GET_CATEGORY_ICON(c.id, 256);
    },
    inCategory(c) {
      return this.products.filter((p) => p.category_id === c.id);
    },
    sidePhoto(c) {
      return photoOf(c, "portrait") || photoOf(c, "square");
    },
    line(c) {
      return categoryLine(this.$shop, this.products, c.id, this.currency, (n) => moneyText(n, this.currency, Math.round(n) === n));
    },
    tagTo(tag) {
      return { name: window.$storefront.routes.SHOP_PAGE, query: { search: tag } };
    },
    brandTo(b) {
      return { name: window.$storefront.routes.SHOP_PAGE, query: { search: b } };
    },
    productTo(p) {
      return { name: window.$storefront.routes.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    thumb(p) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 128);
    },
    nowOf(p) {
      return moneyOf(this.$shop, p, null, this.currency).now;
    },
    clearRecent() {
      forgetViewed();
      this.recent_ids = [];
    },
    postTo(a) {
      return postRoute(a);
    },
    postImage(a) {
      return window.CDN.GET_SHOP_IMAGE_PATH(a.image, null);
    },
    postSrcset(a) {
      return photoSrcset(this.postImage(a));
    },
    quickBuy(p) {
      this.picked = p;
      this.sheet = true;
    },
  },
};
</script>
