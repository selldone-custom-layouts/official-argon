<!--
  Argon — the header, after a big catalogue store's:

  1. A thin utility row at the top right: Track order, Returns (the shop's
     terms) and Help (the FAQ).
  2. The main row: the red logo tile; "Shop" (a mega menu of every
     category with its picture, opened and closed by a click, no scrim) and
     "Trending" (the shop's live tags) dropdowns and a "Deals" link; a wide
     rounded grey search joined to a dark "Search" button, with suggestions
     while typing; then Account, Wishlist and Cart, each an icon with a
     small label, the cart with a count bubble. (The theme switcher lives in
     the footer since 1.0.4.)
  3. A thin benefits strip: three honest lines, each a link ("Deal prices
     until <the deals' real end>", "Compare up to 4 products", "Track any
     order").

  Phone: the logo tile and a menu button on the left, the account,
  wishlist and cart icons on the right, the search across the screen,
  then the benefits as one line that turns every few seconds. The menu
  button opens a side panel with every category, the trending tags and the
  help links. There is no bottom tab bar. The cart opens Kalio's drawer
  (design C). A shop with custom header code keeps Selldone's header
  (StorefrontLayout).
-->
<template>
  <header v-if="!$store.getters.getIsNative" class="ar-header">
    <!-- ▆▆▆▆ 1. Utility row ▆▆▆▆ -->
    <div class="ar-util">
      <nav aria-label="Help" class="ar-wrap ar-util__in">
        <router-link :to="ordersTo"><span class="ms">local_shipping</span>{{ t("header.track") }}</router-link>
        <router-link :to="returnsTo"><span class="ms">undo</span>{{ t("header.returns") }}</router-link>
        <router-link :to="helpTo"><span class="ms">help</span>{{ t("header.help") }}</router-link>
        <!-- Language and currency (the owner's choice B): a small pill at the
             end of the utility row; hidden when the shop has one of each. -->
        <region-switcher-button button-class="ar-util__region" />
      </nav>
    </div>

    <!-- ▆▆▆▆ 2. The main row ▆▆▆▆ -->
    <div ref="main" class="ar-wrap ar-header__main">
      <button :aria-expanded="menu ? 'true' : 'false'" aria-label="Menu" class="ar-burger" type="button" @click="menu = true">
        <span class="ms">menu</span>
      </button>
      <argon-logo class="ar-header__logo" />

      <nav aria-label="Shop" class="ar-nav">
        <button :aria-expanded="mega ? 'true' : 'false'" class="ar-nav__b" data-dd="shop" type="button" @click="toggle('mega')">
          Shop<span :class="{ '-up': mega }" class="ms">expand_more</span>
        </button>
        <button v-if="trendTags.length" :aria-expanded="trend ? 'true' : 'false'" class="ar-nav__b" data-dd="trend" type="button" @click="toggle('trend')">
          Trending<span :class="{ '-up': trend }" class="ms">expand_more</span>
        </button>
        <router-link :to="dealsTo" class="ar-nav__b -deals">Deals</router-link>
      </nav>

      <form v-if="showSearch" class="ar-search" role="search" @submit.prevent="submit()">
        <span aria-hidden="true" class="ms ar-search__ic">search</span>
        <input
          ref="q"
          :value="q"
          aria-autocomplete="list"
          aria-label="Search products or brands"
          autocomplete="off"
          enterkeyhint="search"
          placeholder="Search products or brands"
          type="search"
          @blur="blurSoon"
          @focus="open_suggest = true"
          @input="onType($event.target.value)"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.esc="open_suggest = false"
        />
        <button class="ar-search__go" type="submit"><span class="ar-search__w">Search</span><span aria-hidden="true" class="ms">search</span></button>

        <div v-if="open_suggest && (hits.length || catHits.length)" class="ar-suggest" role="listbox">
          <router-link
            v-for="c in catHits"
            :key="'c' + c.id"
            :to="catTo(c)"
            class="ar-suggest__cat"
            role="option"
            @mousedown.prevent
            @click="open_suggest = false"
          >
            <span class="ms">category</span>{{ c.title || c.name }}<small>Category</small>
          </router-link>
          <router-link
            v-for="(p, i) in hits"
            :key="p.id"
            :class="{ '-on': i === cursor }"
            :to="productTo(p)"
            class="ar-suggest__p"
            role="option"
            @mousedown.prevent
            @click="open_suggest = false"
          >
            <img :src="thumb(p)" alt="" />
            <span>{{ p.title }}</span>
            <u-price :amount="price(p).now" :currency="currency" />
          </router-link>
          <button class="ar-suggest__all" type="button" @mousedown.prevent @click="submit()">
            See all results for “{{ q }}”<span class="ms">arrow_forward</span>
          </button>
        </div>
      </form>
      <span v-else class="ar-header__sp"></span>

      <nav aria-label="Your account" class="ar-acts">
        <router-link v-if="user" :to="accountTo" class="ar-act -me">
          <span class="ms">person</span><span class="ar-act__t">{{ firstName }}</span>
        </router-link>
        <button v-else-if="!busyUser" class="ar-act -me" type="button" @click="signIn"><span class="ms">person</span><span class="ar-act__t">{{ t("header.account") }}</span></button>
        <span v-else class="ar-act -me -wait"><span class="ms">person</span><span class="ar-act__t">{{ t("header.account") }}</span></span>

        <component
          :is="user ? 'router-link' : 'button'"
          :to="user ? savedTo : undefined"
          :type="user ? undefined : 'button'"
          class="ar-act -saved"
          @click="!user && signIn()"
        >
          <span class="ms">favorite</span><span class="ar-act__t">{{ t("header.wishlist") }}</span>
        </component>

        <button :aria-label="`Cart, ${units} ${units === 1 ? 'item' : 'items'}`" class="ar-act -cart" type="button" @click="cart = true">
          <span class="ms">shopping_cart</span><i v-if="units" class="ar-act__n">{{ units > 99 ? "99+" : units }}</i><span class="ar-act__t">{{ t("header.cart") }}</span>
        </button>
      </nav>

      <!-- The Shop mega menu: every category with its picture. Opened and
           closed by "Shop" only (and Esc, a click elsewhere, or a page
           change). No scrim. -->
      <div v-if="mega" ref="mega" class="ar-dd -mega" @keydown.esc="mega = false">
        <div class="ar-dd__grid">
          <router-link v-for="c in cats" :key="c.id" :to="catTo(c)" class="ar-dd__cat">
            <span class="ar-dd__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>
            <span>{{ c.title || c.name }}</span>
          </router-link>
        </div>
        <div class="ar-dd__side">
          <router-link :to="dealsTo"><span class="ms">sell</span>{{ t("menu.todaysDeals") }}</router-link>
          <router-link :to="newTo"><span class="ms">new_releases</span>New arrivals</router-link>
          <router-link :to="allTo"><span class="ms">grid_view</span>All products</router-link>
          <router-link :to="compareTo"><span class="ms">compare_arrows</span>Compare products</router-link>
        </div>
      </div>
      <!-- Trending: the shop's live tags. -->
      <div v-if="trend" ref="trend" class="ar-dd -trend" @keydown.esc="trend = false">
        <router-link v-for="t in trendTags" :key="t" :to="tagTo(t)" class="ar-dd__tag"><span class="ms">trending_up</span>{{ tagTitle(t) }}</router-link>
      </div>
    </div>

    <!-- ▆▆▆▆ 3. Benefits ▆▆▆▆ -->
    <nav aria-label="Why shop with us" class="ar-perks">
      <div class="ar-wrap ar-perks__in">
        <router-link v-for="(b, i) in perks" :key="b.key" :class="{ '-on': i === perk_at }" :to="b.to" class="ar-perk">
          <span class="ms">{{ b.icon }}</span>{{ b.text }}
        </router-link>
      </div>
    </nav>

    <!-- ▆▆▆▆ The phone menu (a plain teleported panel, not a v-dialog) ▆▆▆▆ -->
    <teleport to="body">
      <transition name="ar-fade">
        <div v-if="menu" aria-hidden="true" class="ar-menu-scrim" @click="menu = false"></div>
      </transition>
      <transition name="ar-slide">
        <div v-if="menu" aria-label="Menu" aria-modal="true" class="ar-menu" role="dialog" @keydown.esc="menu = false">
          <div class="ar-menu__head">
            <argon-logo />
            <button ref="menuClose" aria-label="Close menu" class="ar-x" type="button" @click="menu = false"><span class="ms">close</span></button>
          </div>
          <div class="ar-menu__body">
            <router-link :to="dealsTo" class="ar-menu__deal"><span class="ms">sell</span>{{ t("menu.todaysDeals") }}</router-link>
            <p class="ar-menu__h">{{ t("menu.shopByCategory") }}</p>
            <!-- The first 6 categories in the shop's order; the rest behind
                 "Show N more" (8 or fewer: all, no button). The owner's
                 option A, 10 November 2026. -->
            <router-link v-for="c in menuFirst" :key="c.id" :to="catTo(c)" class="ar-menu__cat">
              <span class="ar-dd__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>{{ c.title || c.name }}
            </router-link>
            <transition name="ar-mm">
              <div v-if="menuRest.length && menu_more" id="ar-menu-more" class="ar-menu__extra">
                <div class="ar-menu__extra-in">
                  <router-link v-for="(c, i) in menuRest" :key="c.id" :style="{ '--i': i }" :to="catTo(c)" class="ar-menu__cat">
                    <span class="ar-dd__ic"><img v-if="c.icon" :src="catIcon(c)" alt="" /></span>{{ c.title || c.name }}
                  </router-link>
                </div>
              </div>
            </transition>
            <button
              v-if="menuRest.length"
              :aria-expanded="menu_more ? 'true' : 'false'"
              aria-controls="ar-menu-more"
              class="ar-menu__cat ar-menu__more"
              type="button"
              @click="menu_more = !menu_more"
            >
              <span aria-hidden="true" class="ar-menu__more-ic"><span class="ms">{{ menu_more ? "expand_less" : "expand_more" }}</span></span>
              {{ menu_more ? t("menu.showFewer") : t("menu.showMore", { n: menuRest.length }) }}
            </button>
            <template v-if="trendTags.length">
              <p class="ar-menu__h">{{ t("menu.trending") }}</p>
              <div class="ar-menu__tags">
                <router-link v-for="t in trendTags" :key="t" :to="tagTo(t)" class="ar-pill -line">{{ tagTitle(t) }}</router-link>
              </div>
            </template>
            <p class="ar-menu__h">{{ t("menu.help") }}</p>
            <router-link :to="ordersTo" class="ar-menu__link"><span class="ms">local_shipping</span>{{ t("header.track") }}</router-link>
            <router-link :to="returnsTo" class="ar-menu__link"><span class="ms">undo</span>{{ t("header.returns") }}</router-link>
            <router-link :to="helpTo" class="ar-menu__link"><span class="ms">help</span>{{ t("menu.helpFaq") }}</router-link>
            <router-link :to="compareTo" class="ar-menu__link"><span class="ms">compare_arrows</span>{{ t("menu.compare") }}</router-link>
            <region-sheet row-class="ar-menu__link ar-menu__region" />
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ▆▆▆▆ The cart drawer (design C) ▆▆▆▆ -->
    <teleport to="body">
      <v-navigation-drawer
        v-model="cart"
        :location="$vuetify.locale.isRtl ? 'left' : 'right'"
        :width="windowWidth < 520 ? windowWidth : 440"
        class="k-drawer -basket ar-drawer"
        temporary
      >
        <div class="k-drawer__head">
          <p class="k-drawer__title">Your cart<small v-if="units">{{ units }} {{ units === 1 ? "item" : "items" }}</small></p>
          <button aria-label="Close" class="ar-x" type="button" @click="cart = false"><span class="ms">close</span></button>
        </div>
        <div v-if="!units" class="ar-empty -drawer">
          <span aria-hidden="true" class="ar-empty__ic"><span class="ms">shopping_cart</span></span>
          <p class="ar-empty__t">Your cart is empty</p>
          <p class="ar-empty__p">Find something you love and it will wait for you here.</p>
          <router-link :to="dealsTo" class="ar-btn" @click="cart = false">Shop today’s deals</router-link>
          <router-link :to="allTo" class="ar-btn -line" @click="cart = false">Continue shopping</router-link>
        </div>
        <kalio-basket-drawer v-else @close="cart = false" />
      </v-navigation-drawer>
    </teleport>
  </header>
</template>

<script>
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import ArgonLogo from "../ArgonLogo.vue";
import KalioBasketDrawer from "../../kalio/shell/KalioBasketDrawer.vue";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { basketView } from "../../kalio/kalio-basket";
import { catalogue, dealsEndDate, moneyOf, shortDate, tagged, tagTitle } from "../argon";
import RegionSwitcherButton from "../../region-switcher/RegionSwitcherButton.vue";
import RegionSheet from "../../region-switcher/RegionSheet.vue";
import { currentCurrency, t } from "../../region-switcher/region";

export default {
  name: "ArgonHeader",
  components: { ArgonLogo, KalioBasketDrawer, RegionSwitcherButton, RegionSheet },
  mixins: [CurrencyMixin],
  inject: ["$shop"],

  props: {
    showSearch: { type: Boolean, default: true },
  },

  emits: ["search", "clear"],

  data: () => ({
    cats: [],
    products: [],
    tags: [],
    q: "",
    hits: [],
    cursor: -1,
    open_suggest: false,
    mega: false,
    trend: false,
    menu: false,
    menu_more: false,
    cart: false,
    perk_at: 0,
    windowWidth: typeof window !== "undefined" ? window.innerWidth : 1440,
  }),

  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    busyUser() {
      return this.$store.getters.getBusyUser;
    },
    firstName() {
      return String(this.user?.name || "Account").split(/\s+/)[0].slice(0, 12);
    },
    currency() {
      return currentCurrency();
    },
    units() {
      return this.getBaskets().reduce((sum, b) => sum + (b?.items || []).reduce((n, it) => n + (it.count || 0), 0), 0);
    },
    r() {
      return window.$storefront.routes;
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    returnsTo() {
      return { name: this.r.SHOP_PROFILE_PAGE_TERMS };
    },
    helpTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
    compareTo() {
      return { name: this.r.COMPARISON_PAGE };
    },
    savedTo() {
      return { name: this.r.USER_FAVORITES_PAGE };
    },
    accountTo() {
      return { name: "KalioAccountHome" };
    },
    dealsTo() {
      return dealsRoute();
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
    allTo() {
      return catalogueRoute();
    },
    /* The phone menu: 6 categories, the rest behind "Show N more"; 8 or
       fewer show all. */
    menuFirst() {
      return this.cats.length <= 8 ? this.cats : this.cats.slice(0, 6);
    },
    menuRest() {
      return this.cats.length <= 8 ? [] : this.cats.slice(6);
    },
    /* The tags the shop uses, most used first. */
    trendTags() {
      return this.tags.slice(0, 8);
    },
    /* Three honest lines, each a link. The deal line names the deals' own
       end date; without one it just points at the deals. */
    perks() {
      const until = shortDate(dealsEndDate(this.$shop, this.products));
      return [
        { key: "deals", icon: "sell", text: until ? `Deals running until ${until}` : "Today’s deals across the store", to: this.dealsTo },
        { key: "compare", icon: "compare_arrows", text: "Compare up to 4 products", to: this.compareTo },
        { key: "track", icon: "local_shipping", text: "Track any order", to: this.ordersTo },
      ];
    },
    catHits() {
      const q = this.q.trim().toLowerCase();
      if (q.length < 2) return [];
      return this.cats.filter((c) => `${c.title} ${c.name}`.toLowerCase().includes(q)).slice(0, 2);
    },
  },

  watch: {
    $route() {
      this.mega = false;
      this.trend = false;
      this.menu = false;
      this.cart = false;
      this.open_suggest = false;
    },
    cart(open) {
      basketView.drawerOpen = open;
      this.$store.commit("setForceHideNavigation", open);
    },
    mega(open) {
      this.listenOutside();
    },
    trend(open) {
      this.listenOutside();
    },
    menu(open) {
      if (open) this.menu_more = false; /* each time the menu opens it starts collapsed */
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (open) this.$nextTick(() => this.$refs.menuClose?.focus());
    },
    "$route.query.search": {
      handler(v) {
        this.q = v ? String(v) : "";
      },
      immediate: true,
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
    catalogue().then((list) => (this.products = list));
    tagged().then((map) => {
      this.tags = [...map.entries()]
        .filter(([, list]) => list.length)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([t]) => t);
    });
    this.onResize = () => (this.windowWidth = window.innerWidth);
    window.addEventListener("resize", this.onResize, { passive: true });
    /* Any part of the page can open the cart (the footer's Cart link). */
    this.openCart = () => (this.cart = true);
    EventBus.$on("argon:open-cart", this.openCart);
    /* The phone's one benefit line turns every 4 seconds (not with reduced
       motion; the computer shows all three). */
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (!still) this.perkTimer = setInterval(() => (this.perk_at = (this.perk_at + 1) % 3), 4000);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("click", this.outside, true);
    EventBus.$off("argon:open-cart", this.openCart);
    clearTimeout(this.typing);
    clearInterval(this.perkTimer);
    if (this.menu) document.documentElement.style.overflow = "";
  },

  methods: {
    t,
    tagTitle,
    price(p) {
      return moneyOf(this.$shop, p, null, this.currency);
    },
    catTo: aisleRoute,
    catIcon(c) {
      return window.CDN.GET_CATEGORY_ICON(c.id, 128);
    },
    productTo(p) {
      return { name: this.r.PRODUCT_PAGE, params: { product_id: p.id } };
    },
    tagTo(tag) {
      return { name: this.r.SHOP_PAGE, query: { search: tag } };
    },
    thumb(p) {
      return window.CDN.GET_SHOP_IMAGE_PATH(p.icon, 64);
    },
    signIn() {
      EventBus.$emit("need-login", true);
    },
    toggle(which) {
      const open = !this[which];
      this.mega = false;
      this.trend = false;
      this[which] = open;
    },
    listenOutside() {
      document.removeEventListener("click", this.outside, true);
      if (this.mega || this.trend) document.addEventListener("click", this.outside, true);
    },
    outside(e) {
      const t = e.target;
      const inPanel = this.$refs.mega?.contains(t) || this.$refs.trend?.contains(t);
      const onButton = t?.closest?.("[data-dd]");
      if (!inPanel && !onButton) {
        this.mega = false;
        this.trend = false;
      }
    },
    /* Suggestions while typing: the input's own value (v-model waits for an
       Android keyboard's composition to end). */
    onType(value) {
      this.q = value;
      this.cursor = -1;
      this.open_suggest = true;
      clearTimeout(this.typing);
      const q = value.trim();
      if (q.length < 2) {
        this.hits = [];
        return;
      }
      this.typing = setTimeout(() => {
        window.axios
          .get(window.XAPI.GET_SEARCH_QUERY(window.$storefront.name, encodeURIComponent(q)))
          .then(({ data }) => {
            if (this.q.trim() !== q) return;
            this.hits = (data?.items || []).filter((p) => p && p.id && p.title && p.icon).slice(0, 6);
          })
          .catch(() => (this.hits = []));
      }, 250);
    },
    move(d) {
      if (!this.hits.length) return;
      this.cursor = (this.cursor + d + this.hits.length) % this.hits.length;
    },
    blurSoon() {
      setTimeout(() => (this.open_suggest = false), 150);
    },
    submit() {
      if (this.cursor >= 0 && this.hits[this.cursor]) {
        this.$router.push(this.productTo(this.hits[this.cursor]));
        this.open_suggest = false;
        return;
      }
      const text = this.q.trim();
      this.open_suggest = false;
      this.$refs.q?.blur();
      if (!text) {
        this.$emit("clear");
        return;
      }
      this.$emit("search", { search: text, search_type: null });
    },
  },
};
</script>
