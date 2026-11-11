<!--
  Argon — the home page, after a big catalogue store's sections
  (digini-design/argon-home.html):

   1. the category carousel: a "Today's deals" tile, then every category on
      a light-grey tile with its own packshot;
   2. three dark promo cards (Today's deals, New arrivals, Best sellers) and
      four black "<Category> offers" pills, the categories with most deals;
   3. a green strip: "Deal prices locked until <the deals' real end>";
   4. "Shop the latest tech": four categories as photo cards;
   5. a wide banner: "Up to X% off <Category>", the biggest saving;
   6. "Popular products on Argon", a sideways row of cards;
   7. the dark red compare banner;
   8. "Trending now": the shop's other tags (wireless, 4K…) as photo cards;
   9. "Explore our brands": the four brands with most products (hidden
      under four brands);
  10. "There's even more to Argon": order tracking, compare, help, contact;
  11. "More deals", another row;
  12. "Need a hand?" (FAQ and Contact);
  13. the four newest articles (the owner's rule: articles last), then the
      text about the shop and the footer.

  Everything is read from the shop. A tag with no products, a category
  with no photo or a brand list under four never leaves an empty box:
  category cards fall back to a collage of the category's products, and the
  other photo slots draw a named placeholder until their file is added
  (argon-photos.ts).
-->
<template>
  <div class="ar-home">
    <!-- ▆▆▆▆ 1. Categories ▆▆▆▆ -->
    <section :aria-label="t('argon.menu.shopByCategory', 'Shop by category')" class="ar-wrap ar-cats">
      <div ref="cats" class="ar-cats__track" @scroll.passive="measureCats">
        <router-link :to="dealsTo" class="ar-cat -deals">
          <span class="ar-cat__tile"><b>{{ t("argon.home.dealsTile", "Today’s deals") }}</b></span>
          <span class="ar-cat__t">{{ t("argon.header.deals", "Deals") }}</span>
        </router-link>
        <template v-if="cats.length">
          <router-link v-for="c in cats" :key="c.id" :to="catTo(c)" class="ar-cat">
            <span class="ar-cat__tile"><img v-if="c.icon" :alt="''" :src="catIcon(c)" loading="lazy" /></span>
            <span class="ar-cat__t">{{ c.title || c.name }}</span>
          </router-link>
        </template>
        <template v-else>
          <span v-for="n in 9" :key="'s' + n" aria-hidden="true" class="ar-cat -skeleton"><span class="ar-cat__tile"></span><span class="ar-cat__t"></span></span>
        </template>
      </div>
      <button v-show="!cats_start" :aria-label="t('argon.home.catsBack', 'Scroll categories back')" class="ar-arrow -l" type="button" @click="nudgeCats(-1)"><span class="ms k-flip">chevron_left</span></button>
      <button v-show="!cats_end" :aria-label="t('argon.home.catsMore', 'More categories')" class="ar-arrow -r" type="button" @click="nudgeCats(1)"><span class="ms k-flip">chevron_right</span></button>
    </section>

    <!-- ▆▆▆▆ 2. Promo cards and offer pills ▆▆▆▆ -->
    <section :aria-label="t('argon.home.highlights', 'Shop the highlights')" class="ar-wrap ar-promos">
      <div class="ar-promos__row">
        <router-link v-for="pc in promoCards" :key="pc.key" :to="pc.to" class="ar-promo">
          <argon-slot :place="pc.slot" class="ar-promo__ph" eager />
          <span class="ar-promo__tx">
            <b>{{ pc.title }}</b>
            <small>{{ pc.line }}</small>
          </span>
        </router-link>
      </div>
      <nav v-if="offerCats.length" :aria-label="t('argon.home.offersBy', 'Offers by category')" class="ar-offers">
        <router-link v-for="c in offerCats" :key="c.id" :to="offersTo(c)" class="ar-pill">{{ t("argon.home.offers", "{category} offers", { category: c.title || c.name }) }}</router-link>
      </nav>
    </section>

    <!-- ▆▆▆▆ 3. The deal strip ▆▆▆▆ -->
    <div v-if="deals.length" class="ar-wrap">
      <router-link :to="dealsTo" class="ar-gstrip">
        <span class="ms">verified</span>
        <b v-if="dealsUntil">{{ t("argon.home.dealsLocked", "Deal prices locked until {date}", { date: dealsUntil }) }}</b>
        <b v-else>{{ t("argon.perks.deals", "Today’s deals across the store") }}</b>
        <span class="ar-gstrip__go">{{ t("argon.common.seeAllDeals", "See all deals") }}<span class="ms k-flip">chevron_right</span></span>
      </router-link>
    </div>

    <!-- ▆▆▆▆ 4. Shop the latest tech ▆▆▆▆ -->
    <section v-if="latest.length" aria-labelledby="ar-latest-h" class="ar-sec ar-wrap">
      <header class="ar-head"><h2 id="ar-latest-h">{{ t("argon.home.latest", "Shop the latest tech") }}</h2></header>
      <div class="ar-tiles4">
        <router-link v-for="c in latest" :key="c.id" :to="catTo(c)" class="ar-ptile">
          <argon-photo
            :alt="c.title || c.name"
            :photo="tilePhoto(c)"
            :products="inCategory(c).slice(0, 3)"
            class="ar-ptile__ph"
            sizes="(max-width: 900px) 46vw, 330px"
          />
          <b class="ar-ptile__t">{{ c.title || c.name }}</b>
          <span class="ar-ptile__l">{{ line(c) }}</span>
          <span class="ar-ptile__go">{{ t("argon.common.shopNow", "Shop now") }}<span class="ms k-flip">chevron_right</span></span>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ 5. The wide banner ▆▆▆▆ -->
    <section v-if="banner" class="ar-sec ar-wrap">
      <router-link :to="catTo(banner.cat)" class="ar-banner">
        <span class="ar-banner__tx">
          <small>{{ t("argon.home.banner.eyebrow", "{category} deals", { category: banner.cat.title || banner.cat.name }) }}</small>
          <b>{{ bannerWords[0] }}<span>{{ banner.cat.title || banner.cat.name }}</span>{{ bannerWords[1] }}</b>
          <span v-if="banner.cat.description" class="ar-banner__p">{{ banner.cat.description }}</span>
          <span class="ar-btn">{{ t("argon.common.shopNow", "Shop now") }}</span>
        </span>
        <argon-photo
          :alt="banner.cat.title || banner.cat.name"
          :photo="photoOf(banner.cat, 'wide')"
          :products="inCategory(banner.cat).slice(0, 4)"
          class="ar-banner__ph"
          sizes="(max-width: 900px) 100vw, 760px"
        />
      </router-link>
    </section>

    <!-- ▆▆▆▆ 6. Popular products ▆▆▆▆ -->
    <argon-rail :more-to="dealsTo" :products="ready ? popular : null" class="ar-wrap" :more-label="t('argon.common.seeAllDeals', 'See all deals')" :title="t('argon.home.popular', 'Popular products on {shop}', { shop: shopTitle })" @quick-buy="quickBuy" />

    <!-- ▆▆▆▆ 7. The compare banner ▆▆▆▆ -->
    <section class="ar-sec ar-wrap">
      <router-link :to="compareTo" class="ar-redband">
        <span class="ar-redband__tx">
          <b>{{ t("argon.home.compare.title", "Compare up to 4 products, side by side") }}</b>
          <span>{{ t("argon.home.compare.text", "Line up prices, specs and colours in one table, then pick the one that fits.") }}</span>
          <span class="ar-btn -white">{{ t("argon.home.compare.go", "Start comparing") }}</span>
        </span>
        <argon-slot class="ar-redband__ph" place="banner-compare" />
      </router-link>
    </section>

    <!-- ▆▆▆▆ 8. Trending now ▆▆▆▆ -->
    <section v-if="trending.length" aria-labelledby="ar-trend-h" class="ar-sec ar-wrap">
      <header class="ar-head"><h2 id="ar-trend-h">{{ t("argon.home.trending", "Trending now") }}</h2></header>
      <div class="ar-tiles4">
        <router-link v-for="tr in trending" :key="tr.tag" :to="tagTo(tr.tag)" class="ar-ptile">
          <argon-slot :alt="tagTitle(tr.tag)" :place="trendSlot(tr.tag)" class="ar-ptile__ph" />
          <b class="ar-ptile__t">{{ tagTitle(tr.tag) }}</b>
          <span class="ar-ptile__l">{{ tr.line }}</span>
          <span class="ar-ptile__go">{{ t("argon.common.shopNow", "Shop now") }}<span class="ms k-flip">chevron_right</span></span>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ 9. Brands ▆▆▆▆ -->
    <section v-if="brands.length >= 4" aria-labelledby="ar-brands-h" class="ar-sec ar-wrap">
      <header class="ar-head"><h2 id="ar-brands-h">{{ t("argon.home.brands", "Explore our brands") }}</h2></header>
      <div class="ar-tiles4">
        <router-link v-for="b in brands.slice(0, 4)" :key="b" :to="brandTo(b)" class="ar-ptile -brand">
          <argon-slot :alt="b" :place="brandSlot(b)" class="ar-ptile__ph" />
          <b class="ar-ptile__t">{{ b }}</b>
          <span class="ar-ptile__l">{{ brandLine(b) }}</span>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ 10. There's even more ▆▆▆▆ -->
    <section aria-labelledby="ar-more-h" class="ar-sec ar-wrap">
      <header class="ar-head"><h2 id="ar-more-h">{{ t("argon.home.more", "There’s even more to {shop}", { shop: shopTitle }) }}</h2></header>
      <div class="ar-tiles4">
        <router-link v-for="s in services" :key="s.key" :to="s.to" class="ar-ptile -service">
          <argon-slot :alt="s.title" :place="s.slot" class="ar-ptile__ph" />
          <b class="ar-ptile__t">{{ s.title }}</b>
          <span class="ar-ptile__l">{{ s.line }}</span>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ 11. More deals ▆▆▆▆ -->
    <argon-rail
      v-if="!ready || moreDeals.length"
      :more-to="dealsTo"
      :products="ready ? moreDeals : null"
      class="ar-wrap"
      :more-label="t('argon.common.seeAllDeals', 'See all deals')"
      :title="t('argon.home.moreDeals', 'More deals')"
      @quick-buy="quickBuy"
    />

    <!-- ▆▆▆▆ 12. Need a hand? ▆▆▆▆ -->
    <section class="ar-sec ar-wrap">
      <div class="ar-help">
        <div class="ar-help__tx">
          <h2>{{ t("argon.home.help.title", "Need a hand?") }}</h2>
          <p>{{ t("argon.home.help.text", "Questions about an order, a return or which one to choose? Our answers are a click away, and so are we.") }}</p>
          <div class="ar-help__acts">
            <router-link :to="faqTo" class="ar-pill">{{ t("argon.menu.helpFaq", "Help & FAQ") }}</router-link>
            <router-link :to="contactTo" class="ar-pill -line">{{ t("argon.footer.contact", "Contact us") }}</router-link>
          </div>
        </div>
        <argon-slot class="ar-help__ph" place="help-desk" />
      </div>
    </section>

    <!-- ▆▆▆▆ 13. Tips and guides (the owner's rule: articles last) ▆▆▆▆ -->
    <section v-if="posts.length" aria-labelledby="ar-blog-h" class="ar-sec ar-wrap">
      <header class="ar-head">
        <h2 id="ar-blog-h">{{ t("blog.journal", "Tips and guides") }}</h2>
        <router-link :to="blogTo" class="ar-more">{{ t("blog.allNotes", "All guides") }}<span class="ms k-flip">chevron_right</span></router-link>
      </header>
      <div class="ar-tiles4">
        <router-link v-for="a in posts" :key="a.id" :to="postTo(a)" class="ar-ptile -post">
          <span class="ar-ptile__ph -post">
            <img
              v-if="a.image"
              :alt="a.title"
              :src="postImage(a)"
              :srcset="postSrcset(a)"
              loading="lazy"
              sizes="(max-width: 900px) 46vw, 330px"
              @error="dropSrcset"
            />
          </span>
          <time :datetime="a.created_at" class="ar-ptile__d">{{ dateParts(a.created_at).full }}</time>
          <b class="ar-ptile__t">{{ a.title }}</b>
        </router-link>
      </div>
    </section>

    <!-- ▆▆▆▆ About the shop ▆▆▆▆ -->
    <section :aria-label="t('argon.footer.about', 'About {shop}', { shop: shopTitle })" class="ar-sec ar-wrap ar-seo">
      <h2>{{ t("argon.footer.about", "About {shop}", { shop: shopTitle }) }}</h2>
      <div :class="{ '-open': seo_open }" class="ar-seo__body">
        <p>{{ seoLede }}</p>
        <p v-if="cats.length">
          {{ seoWords[0] }}
          <template v-for="(c, i) in cats" :key="c.id"
            ><router-link :to="catTo(c)">{{ (c.title || c.name).toLocaleLowerCase() }}</router-link
            >{{ i < cats.length - 2 ? t("argon.list.comma", ", ") : i === cats.length - 2 ? t("argon.list.and", " and ") : "" }}</template
          >{{ seoWords[1] }}
        </p>
        <p>
          {{ t("argon.home.seo.p3", "Compare up to four products side by side, save the ones you like to your wishlist, and track any order from your account. Need help choosing? Our guides and our team are here.") }}
        </p>
      </div>
      <button :aria-expanded="seo_open ? 'true' : 'false'" class="ar-seo__more" type="button" @click="seo_open = !seo_open">
        {{ seo_open ? t("argon.home.seo.less", "Read less") : t("argon.home.seo.more", "Read more") }}<span class="ms">{{ seo_open ? "expand_less" : "expand_more" }}</span>
      </button>
    </section>

    <kalio-quick-buy v-model="sheet" :product="picked" />
  </div>
</template>

<script>
import { currentCurrency } from "../region-switcher/region";
import { t } from "../kalio/i18n/kalio-i18n";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import ArgonRail from "./ArgonRail.vue";
import ArgonPhoto from "./ArgonPhoto.vue";
import ArgonSlot from "./ArgonSlot.vue";
import KalioQuickBuy from "../kalio/KalioQuickBuy.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute, dropSrcset, photoSrcset } from "../kalio/kalio-catalog";
import { dateParts, journalPage, journalRoute, postRoute } from "../kalio/pages/kalio-journal";
import { brandSlot, trendSlot } from "./argon-photos";
import {
  brandRoute,
  brandsOf,
  catalogue,
  categoryLine,
  dealsEndDate,
  dealsOf,
  isBestSellerTag,
  isNewTag,
  mixByCategory,
  moneyOf,
  moneyText,
  percentOff,
  photoOf,
  shortDate,
  tagged,
  tagTitle,
} from "./argon";

export default {
  name: "ArgonHome",
  components: { ArgonRail, ArgonPhoto, ArgonSlot, KalioQuickBuy },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  data: () => ({
    cats: [],
    products: [],
    tags: new Map(),
    ready: false,
    posts: [],
    sheet: false,
    picked: null,
    seo_open: false,
    cats_start: true,
    cats_end: false,
  }),

  computed: {
    currency() {
      return currentCurrency();
    },
    shopTitle() {
      return this.$shop?.title || "";
    },
    dealsTo() {
      return dealsRoute();
    },
    blogTo() {
      return journalRoute();
    },
    compareTo() {
      return { name: window.$storefront.routes.COMPARISON_PAGE };
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
    contactTo() {
      return { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
    withProducts() {
      const ids = new Set(this.products.map((p) => p.category_id));
      return this.cats.filter((c) => ids.has(c.id));
    },
    deals() {
      return dealsOf(this.$shop, this.products);
    },
    dealsUntil() {
      return shortDate(dealsEndDate(this.$shop, this.products));
    },
    bestTag() {
      return [...this.tags.keys()].find(isBestSellerTag) || null;
    },
    newTag() {
      return [...this.tags.keys()].find(isNewTag) || null;
    },

    /* ── 2. Promo cards: deals, new, best sellers ── */
    promoCards() {
      const save = Math.max(0, ...this.deals.map((p) => moneyOf(this.$shop, p, null, this.currency).save));
      return [
        {
          key: "deals",
          slot: "promo-deals",
          title: t("argon.menu.todaysDeals", "Today’s deals"),
          line: save > 0 ? t("argon.home.promo.dealsLine", "Up to {amount} off today", { amount: this.money(Math.round(save), true) }) : t("argon.home.promo.dealsFresh", "Fresh prices across the store"),
          to: this.dealsTo,
        },
        { key: "new", slot: "promo-new", title: t("argon.menu.newArrivals", "New arrivals"), line: t("argon.home.promo.newLine", "Just landed at {shop}", { shop: this.shopTitle }), to: this.newTag ? this.tagTo(this.newTag) : catalogueRoute({ sort: "newest" }) },
        { key: "best", slot: "promo-best", title: t("argon.home.promo.best", "Best sellers"), line: t("argon.home.promo.bestLine", "What everyone’s buying"), to: this.bestTag ? this.tagTo(this.bestTag) : catalogueRoute({ sort: "bestselling" }) },
      ];
    },
    /* The four categories with the most deals. */
    offerCats() {
      const n = new Map();
      for (const p of this.deals) n.set(p.category_id, (n.get(p.category_id) || 0) + 1);
      return this.cats
        .filter((c) => n.has(c.id))
        .sort((a, b) => n.get(b.id) - n.get(a.id))
        .slice(0, 4);
    },

    /* ── 4. The latest tech: categories with the newest products, photos first ── */
    latest() {
      const fresh = new Map();
      const tagged = this.newTag ? this.tags.get(this.newTag) || [] : [];
      for (const p of tagged) fresh.set(p.category_id, (fresh.get(p.category_id) || 0) + 1);
      const withPhoto = (c) => !!this.tilePhoto(c);
      const list = [...this.withProducts].sort(
        (a, b) => Number(withPhoto(b)) - Number(withPhoto(a)) || (fresh.get(b.id) || 0) - (fresh.get(a.id) || 0),
      );
      return list.slice(0, 4).length === 4 ? list.slice(0, 4) : [];
    },

    /* ── 5. The wide banner: the biggest saving in a category with a wide photo ── */
    banner() {
      let best = null;
      for (const c of this.withProducts) {
        const off = Math.max(0, ...this.inCategory(c).map((p) => percentOff(this.$shop, p)));
        if (!off) continue;
        const score = off + (photoOf(c, "wide") ? 1000 : 0);
        if (!best || score > best.score) best = { cat: c, off, score };
      }
      return best;
    },

    /* ── 6. Popular: best sellers first, then deals, mixed by category ── */
    popular() {
      const best = this.bestTag ? this.tags.get(this.bestTag) || [] : [];
      const seen = new Set();
      const list = [...best, ...this.deals].filter((p) => p.icon && !seen.has(p.id) && seen.add(p.id));
      return mixByCategory(list, 12);
    },

    /* ── 8. Trending: the shop's other tags, most used first ── */
    trending() {
      return [...this.tags.entries()]
        .filter(([t, list]) => !isBestSellerTag(t) && !isNewTag(t) && list.length)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 4)
        .map(([tag, list]) => {
          const ids = [...new Set(list.map((p) => p.category_id))];
          const names = ids
            .map((id) => this.cats.find((c) => c.id === id))
            .filter(Boolean)
            .map((c) => c.title || c.name);
          const line =
            names.length > 2
              ? t("argon.home.trend.andMore", "{a}, {b} and more", { a: names[0], b: names[1] })
              : names.length === 2
                ? t("argon.home.trend.two", "{a} and {b}", { a: names[0], b: names[1] })
                : names.join("");
          return { tag, line };
        });
    },

    /* ── 9. Brands ── */
    brands() {
      return brandsOf(this.products);
    },

    /* ── 10. Services ── */
    services() {
      const r = window.$storefront.routes;
      return [
        { key: "track", slot: "service-track", title: t("argon.footer.trackOrder", "Track an order"), line: t("argon.home.svc.track", "See where your parcel is, from our door to yours."), to: { name: r.HISTORY_ORDERS_PHYSICAL } },
        { key: "compare", slot: "service-compare", title: t("argon.menu.compare", "Compare products"), line: t("argon.home.svc.compare", "Put up to four side by side."), to: this.compareTo },
        { key: "help", slot: "service-help", title: t("argon.menu.helpFaq", "Help & FAQ"), line: t("argon.home.svc.help", "Quick answers on orders, returns and payment."), to: this.faqTo },
        { key: "contact", slot: "service-contact", title: t("argon.footer.contact", "Contact us"), line: t("argon.home.svc.contact", "Talk to our team about anything."), to: this.contactTo },
      ];
    },

    /* ── 11. More deals: the deals not in Popular ── */
    moreDeals() {
      const shown = new Set(this.popular.map((p) => p.id));
      return mixByCategory(
        this.deals.filter((p) => !shown.has(p.id)),
        12,
      );
    },

    /* "Up to 40% off Laptops": the words around the category's name, which
       the template sets apart, so a language can put the name where it reads. */
    bannerWords() {
      if (!this.banner) return ["", ""];
      const text = t("argon.home.banner.title", "Up to {off}% off {category}", { off: this.banner.off });
      const at = text.indexOf("{category}");
      return at < 0 ? [text + " ", ""] : [text.slice(0, at), text.slice(at + 10)];
    },
    /* "Shop <the categories>, with every deal…": the words around the list. */
    seoWords() {
      const text = t("argon.home.seo.cats", "Shop {categories}, with every deal showing the day it ends and every price checked at the cart.");
      const at = text.indexOf("{categories}");
      return at < 0 ? [text, ""] : [text.slice(0, at), text.slice(at + 12)];
    },
    seoLede() {
      const d = (this.$shop?.description || "").trim();
      if (d && !/^it['’]s my awesome .* website\.?$/i.test(d)) return d;
      return t("argon.home.seo.lede", "{shop} is an online electronics store: the latest tech, honest deals with real end dates, and help when you need it.", { shop: this.shopTitle });
    },
  },

  mounted() {
    aisles().then((list) => {
      this.cats = list;
      this.$nextTick(() => this.measureCats());
    });
    catalogue().then((list) => {
      this.products = list;
      this.ready = true;
    });
    tagged().then((map) => (this.tags = map));
    journalPage({ page: 1, limit: 8 })
      .then(({ articles }) => (this.posts = articles.slice(0, 4)))
      .catch(() => (this.posts = []));
    this.onResize = () => this.measureCats();
    window.addEventListener("resize", this.onResize, { passive: true });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    photoOf,
    tagTitle,
    dateParts,
    dropSrcset,
    trendSlot,
    brandSlot,
    money(n, whole = false) {
      return moneyText(n, this.currency, whole);
    },
    catTo(c) {
      return aisleRoute(c);
    },
    offersTo(c) {
      return { ...aisleRoute(c), query: { filter: JSON.stringify({ only_has_discount: true }) } };
    },
    catIcon(c) {
      return window.CDN.GET_CATEGORY_ICON(c.id, 256);
    },
    inCategory(c) {
      return this.products.filter((p) => p.category_id === c.id);
    },
    tilePhoto(c) {
      return photoOf(c, "square") || photoOf(c, "portrait") || photoOf(c, "wide");
    },
    line(c) {
      return categoryLine(this.$shop, this.products, c.id, this.currency, (n) => moneyText(n, this.currency, Math.round(n) === n));
    },
    brandLine(b) {
      const ids = [...new Set(this.products.filter((p) => p.brand === b).map((p) => p.category_id))];
      return ids
        .map((id) => this.cats.find((c) => c.id === id))
        .filter(Boolean)
        .slice(0, 2)
        .map((c) => c.title || c.name)
        .join(" · ");
    },
    tagTo(tag) {
      return { name: window.$storefront.routes.SHOP_PAGE, query: { search: tag } };
    },
    brandTo(b) {
      return brandRoute(b);
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
    measureCats() {
      const el = this.$refs.cats;
      if (!el) return;
      /* scrollLeft runs negative right to left (Arabic): measure its size. */
      const left = Math.abs(el.scrollLeft);
      this.cats_start = left <= 2;
      this.cats_end = left + el.clientWidth >= el.scrollWidth - 2;
    },
    nudgeCats(d) {
      const el = this.$refs.cats;
      if (!el) return;
      const sign = getComputedStyle(el).direction === "rtl" ? -1 : 1;
      el.scrollBy({ left: sign * d * el.clientWidth * 0.8, behavior: "smooth" });
    },
  },
};
</script>
