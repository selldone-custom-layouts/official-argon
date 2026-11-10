<!--
  Argon — the footer (Home B).

  A blue newsletter band ("Deals in your inbox", Selldone's own subscribe),
  then navy columns: the white wordmark with the shop's description and its
  social links, Departments (live), Your orders, About (the merchant's own
  footer menu when there is one, else the standard pages) and Policies; and
  (1.0.10 trial: the Theme row is in the header, ArgonThemePicker); a legal row with a small "made with selldone" and
  Selldone's cookie settings. A shop with custom footer code keeps
  Selldone's footer.
-->
<template>
  <footer class="ar-footer">
    <div class="ar-wrap ar-footer__grid">
      <nav aria-label="Help">
        <h4>Help</h4>
        <router-link :to="ordersTo">Track an order</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">Returns</router-link>
        <router-link v-if="$router.hasRoute('ShopFAQ')" :to="{ name: 'ShopFAQ' }">Help &amp; FAQ</router-link>
        <router-link :to="{ name: r.SHOP_CONTACT_US }">Contact us</router-link>
      </nav>
      <nav aria-label="Shop">
        <h4>Shop</h4>
        <router-link :to="dealsTo">Today’s deals</router-link>
        <router-link :to="newTo">New arrivals</router-link>
        <router-link :to="allTo">All products</router-link>
        <router-link v-for="c in cats.slice(0, 4)" :key="c.id" :to="catTo(c)">{{ c.title || c.name }}</router-link>
      </nav>
      <nav aria-label="Your account">
        <h4>Account</h4>
        <router-link v-if="user" :to="{ name: 'KalioAccountHome' }">Your account</router-link>
        <button v-else class="ar-footer__btn" type="button" @click="signIn">Sign in</button>
        <router-link :to="ordersTo">Orders</router-link>
        <router-link v-if="user" :to="{ name: r.USER_FAVORITES_PAGE }">Wishlist</router-link>
        <button v-else class="ar-footer__btn" type="button" @click="signIn">Wishlist</button>
        <button class="ar-footer__btn" type="button" @click="openCart">Your cart</button>
        <router-link :to="{ name: r.COMPARISON_PAGE }">Compare</router-link>
      </nav>
      <nav :aria-label="`About ${shopTitle}`">
        <h4>About {{ shopTitle }}</h4>
        <router-link v-for="(l, i) in aboutLinks" :key="i" :to="l.to">{{ l.name }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">Terms of service</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">Privacy policy</router-link>
      </nav>
      <div class="ar-footer__news">
        <h4>Deals in your inbox</h4>
        <p>New arrivals and price drops, about once a week.</p>
        <form class="ar-footer__form" @submit.prevent="subscribe">
          <input v-model.trim="email" :disabled="sent" aria-label="Email" autocomplete="email" placeholder="Your email address" type="email" />
          <button :disabled="busy || sent" class="ar-btn" type="submit">
            <template v-if="sent"><span class="ms">check</span>Signed up</template>
            <template v-else>Sign up</template>
          </button>
        </form>
        <p v-if="error" class="ar-footer__err" role="alert">{{ error }}</p>
        <s-storefront-social-buttons class="ar-footer__social"></s-storefront-social-buttons>
      </div>
    </div>

    <!-- The theme switcher (the owner, 10 November 2026: in the footer on
         every Layout): palettes, a custom colour and Light / Dark, in a strip
         of its own above the legal row; only on Argon's showcase shop. -->
    <div class="ar-footer__theme">
      <div class="ar-wrap"><theme-switcher-row /></div>
    </div>

    <div class="ar-footer__legal">
      <div class="ar-wrap ar-footer__legal-in">
        <argon-logo class="ar-footer__logo" />
        <span>© {{ year }} {{ shopTitle }}</span>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">Terms</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">Privacy</router-link>
        <s-footer-section-gdpr class="ar-footer__gdpr"></s-footer-section-gdpr>
        <div class="ar-footer__pickers">
          <s-language-selector hide-details variant="plain"></s-language-selector>
          <u-currency-selector v-if="$shop.currencies && $shop.currencies.length > 1" :shop="$shop" hide-details @change="onChangeUserSelectedCurrency" />
        </div>
        <s-footer-section-selldone class="ar-footer__made"></s-footer-section-selldone>
      </div>
    </div>
  </footer>
</template>

<script>
import ArgonLogo from "../ArgonLogo.vue";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SLanguageSelector from "@selldone/components-vue/storefront/language/selector/SLanguageSelector.vue";
import UCurrencySelector from "@selldone/components-vue/ui/currency/selector/UCurrencySelector.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";

export default {
  name: "ArgonFooter",
  components: { ArgonLogo, ThemeSwitcherRow, SStorefrontSocialButtons, SLanguageSelector, UCurrencySelector, SFooterSectionGdpr, SFooterSectionSelldone },
  inject: ["$shop"],

  data: () => ({ cats: [], email: "", busy: false, sent: false, error: null, year: new Date().getFullYear() }),

  computed: {
    r() {
      return window.$storefront.routes;
    },
    shopTitle() {
      return this.$shop?.title || "";
    },
    user() {
      return this.$store.getters.getUser;
    },
    allTo() {
      return catalogueRoute();
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    dealsTo() {
      return dealsRoute();
    },
    newTo() {
      return catalogueRoute({ sort: "newest" });
    },
    /* The shop's own description; Selldone's placeholder line is not shown. */
    lede() {
      const d = (this.$shop?.description || "").trim();
      if (d && !/^it['’]s my awesome .* website\.?$/i.test(d)) return d;
      return "Electronics for work, play and everything in between.";
    },
    /* The merchant's footer menu (Selldone menus, type FOOTER), without what
       the other columns already show (Home is the logo; Terms and Privacy are
       under Policies), then Guides, Contact us and FAQ when it lacks them. */
    aboutLinks() {
      const r = this.r;
      const menu = this.$shop?.menus?.find((it) => it.type === "FOOTER" && it.enable !== false);
      const skip = new Set([r.SHOP_PROFILE_PAGE_TERMS, r.SHOP_PROFILE_PAGE_PRIVACY, r.SHOP_CONTACT_US, "ShopFAQ"]);
      const items = (menu?.menu || [])
        .flat()
        .filter((item) => item && item.name && item.to)
        .filter((item) => !item.to.name || this.$router.hasRoute(item.to.name))
        .filter((item) => !skip.has(item.to.name) && item.to.path !== "/")
        .map((item) => (item.to.name === r.SHOP_PAGE && !item.to.query ? { ...item, name: item.name === "Shop" ? "All products" : item.name, to: this.allTo } : item));
      const has = (name) => items.some((it) => it.to?.name === name);
      const out = items.length ? items : [{ name: "About us", to: { name: r.SHOP_PROFILE_PAGE_ABOUT_US } }];
      if (!has(r.BLOGS_PAGE) && !has(r.SHOP_BLOGS_PAGE) && !items.some((it) => it.to?.name === "Blogs")) out.push({ name: "Tips and guides", to: { name: r.BLOGS_PAGE } });
      /* Contact us and the FAQ live under Help. */
      return out.filter((it) => it.to?.name !== r.SHOP_CONTACT_US && it.to?.name !== "ShopFAQ");
    },
  },

  mounted() {
    aisles().then((list) => (this.cats = list));
  },

  methods: {
    catTo: aisleRoute,
    signIn() {
      EventBus.$emit("need-login", true);
    },
    openCart() {
      EventBus.$emit("argon:open-cart");
    },
    /* Selldone's newsletter audience (the same public call as the Page
       Builder's newsletter form: email marketing, "newsletter"). */
    subscribe() {
      this.error = null;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        this.error = "Please enter a valid email address.";
        return;
      }
      this.busy = true;
      window.axios
        .post(window.XAPI.POST_STREAM_USER_ADD_NEWSLETTER(this.$shop.id, "newsletter"), { email: this.email })
        .then(({ data }) => {
          if (data?.error) this.error = data.error_msg || "That did not work. Please try again.";
          else this.sent = true;
        })
        .catch(() => (this.error = "That did not work. Please try again."))
        .finally(() => (this.busy = false));
    },
  },
};
</script>
