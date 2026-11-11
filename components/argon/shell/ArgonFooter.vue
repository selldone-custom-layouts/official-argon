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
      <nav :aria-label="t('argon.header.help', 'Help')">
        <h4>{{ t("argon.header.help", "Help") }}</h4>
        <router-link :to="ordersTo">{{ t("argon.footer.trackOrder", "Track an order") }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("argon.header.returns", "Returns") }}</router-link>
        <router-link v-if="$router.hasRoute('ShopFAQ')" :to="{ name: 'ShopFAQ' }">{{ t("argon.menu.helpFaq", "Help & FAQ") }}</router-link>
        <router-link :to="{ name: r.SHOP_CONTACT_US }">{{ t("argon.footer.contact", "Contact us") }}</router-link>
      </nav>
      <nav :aria-label="t('argon.header.shop', 'Shop')">
        <h4>{{ t("argon.header.shop", "Shop") }}</h4>
        <router-link :to="dealsTo">{{ t("argon.menu.todaysDeals", "Today’s deals") }}</router-link>
        <router-link :to="newTo">{{ t("argon.menu.newArrivals", "New arrivals") }}</router-link>
        <router-link :to="allTo">{{ t("argon.menu.allProducts", "All products") }}</router-link>
        <router-link v-for="c in cats.slice(0, 4)" :key="c.id" :to="catTo(c)">{{ c.title || c.name }}</router-link>
      </nav>
      <nav :aria-label="t('argon.header.yourAccount', 'Your account')">
        <h4>{{ t("argon.header.account", "Account") }}</h4>
        <router-link v-if="user" :to="{ name: 'KalioAccountHome' }">{{ t("argon.header.yourAccount", "Your account") }}</router-link>
        <button v-else class="ar-footer__btn" type="button" @click="signIn">{{ t("argon.footer.signIn", "Sign in") }}</button>
        <router-link :to="ordersTo">{{ t("argon.footer.orders", "Orders") }}</router-link>
        <router-link v-if="user" :to="{ name: r.USER_FAVORITES_PAGE }">{{ t("argon.header.wishlist", "Wishlist") }}</router-link>
        <button v-else class="ar-footer__btn" type="button" @click="signIn">{{ t("argon.header.wishlist", "Wishlist") }}</button>
        <button class="ar-footer__btn" type="button" @click="openCart">{{ t("argon.cart.title", "Your cart") }}</button>
        <router-link :to="{ name: r.COMPARISON_PAGE }">{{ t("argon.footer.compare", "Compare") }}</router-link>
      </nav>
      <nav :aria-label="t('argon.footer.about', 'About {shop}', { shop: shopTitle })">
        <h4>{{ t("argon.footer.about", "About {shop}", { shop: shopTitle }) }}</h4>
        <router-link v-for="(l, i) in aboutLinks" :key="i" :to="l.to">{{ l.name }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("argon.footer.terms", "Terms of service") }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("argon.footer.privacy", "Privacy policy") }}</router-link>
      </nav>
      <div class="ar-footer__news">
        <h4>{{ t("argon.footer.news.title", "Deals in your inbox") }}</h4>
        <p>{{ t("argon.footer.news.text", "New arrivals and price drops, about once a week.") }}</p>
        <form class="ar-footer__form" @submit.prevent="subscribe">
          <input v-model.trim="email" :disabled="sent" :aria-label="t('argon.footer.news.email', 'Email')" :placeholder="t('argon.footer.news.placeholder', 'Your email address')" autocomplete="email" type="email" />
          <button :disabled="busy || sent" class="ar-btn" type="submit">
            <template v-if="sent"><span class="ms">check</span>{{ t("argon.footer.news.done", "Signed up") }}</template>
            <template v-else>{{ t("argon.footer.news.go", "Sign up") }}</template>
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
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("argon.footer.termsShort", "Terms") }}</router-link>
        <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("argon.footer.privacyShort", "Privacy") }}</router-link>
        <s-footer-section-gdpr class="ar-footer__gdpr"></s-footer-section-gdpr>
        <s-footer-section-selldone class="ar-footer__made"></s-footer-section-selldone>
      </div>
    </div>
  </footer>
</template>

<script>
import ArgonLogo from "../ArgonLogo.vue";
import { t } from "../../kalio/i18n/kalio-i18n";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { aisleRoute, aisles, catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";

export default {
  name: "ArgonFooter",
  components: { ArgonLogo, ThemeSwitcherRow, SStorefrontSocialButtons, SFooterSectionGdpr, SFooterSectionSelldone },
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
      return t("argon.footer.tagline", "Electronics for work, play and everything in between.");
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
        .map((item) => (item.to.name === r.SHOP_PAGE && !item.to.query ? { ...item, name: item.name === "Shop" ? t("argon.menu.allProducts", "All products") : item.name, to: this.allTo } : item));
      const has = (name) => items.some((it) => it.to?.name === name);
      const out = items.length ? items : [{ name: t("argon.footer.aboutUs", "About us"), to: { name: r.SHOP_PROFILE_PAGE_ABOUT_US } }];
      if (!has(r.BLOGS_PAGE) && !has(r.SHOP_BLOGS_PAGE) && !items.some((it) => it.to?.name === "Blogs")) out.push({ name: t("blog.journal", "Tips and guides"), to: { name: r.BLOGS_PAGE } });
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
        this.error = t("argon.footer.news.invalid", "Please enter a valid email address.");
        return;
      }
      this.busy = true;
      window.axios
        .post(window.XAPI.POST_STREAM_USER_ADD_NEWSLETTER(this.$shop.id, "newsletter"), { email: this.email })
        .then(({ data }) => {
          if (data?.error) this.error = data.error_msg || t("argon.footer.news.failed", "That did not work. Please try again.");
          else this.sent = true;
        })
        .catch(() => (this.error = t("argon.footer.news.failed", "That did not work. Please try again.")))
        .finally(() => (this.busy = false));
    },
  },
};
</script>
