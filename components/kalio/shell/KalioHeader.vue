<!--
  Kalio — Header.

  One sticky white bar — the shop's name as a wordmark, an "Aisles" menu,
  the search, then the shopper's own things: orders, saved, account and the
  basket — and under it a strip of every aisle with the deals first. On a
  phone the bar keeps the wordmark and the basket, the search drops under it
  and everything else moves into a menu drawer.

  Every working part is the platform's: the search box and its events (the
  layout's onSearch/onClear), the signed-in account menu
  (SHeaderSectionUser), the basket drawer (BasketTopMenu, the same drawer
  Selldone's header opens), the language and currency pickers, sign-in
  through the app's need-login event, and the basket count from the
  storefront mixin. A shop with custom header code keeps Selldone's header
  (the layout decides), and a native app shell shows none.
-->
<template>
  <header v-if="!$store.getters.getIsNative" class="k-header">
    <div class="k-header__bar">
      <div class="k-header__row k-wrap">
        <button
          v-if="compact"
          aria-label="Menu"
          class="k-header__icon"
          type="button"
          @click="menu = true"
        >
          <v-icon size="24">menu</v-icon>
        </button>

        <router-link :to="homeRoute" class="k-header__brand" :aria-label="`${shopTitle} home`">
          {{ shopTitle }}<i aria-hidden="true"></i>
        </router-link>

        <v-menu
          v-if="!compact && aisleList.length"
          v-model="aisles_open"
          :close-on-content-click="true"
          location="bottom start"
          offset="12"
        >
          <template v-slot:activator="{ props }">
            <button class="k-header__aisles" type="button" v-bind="props">
              <v-icon size="20">grid_view</v-icon>
              Aisles
              <v-icon :class="{ 'rotate-180': aisles_open }" class="t-all-400" size="18">expand_more</v-icon>
            </button>
          </template>
          <div class="k-mega">
            <p class="k-eyebrow">Shop by aisle</p>
            <div class="k-mega__grid">
              <router-link
                v-for="aisle in aisleList"
                :key="aisle.id"
                :to="aisleRoute(aisle)"
                class="k-mega__item"
              >
                <span :style="{ '--k-tint': tint(aisle) }" class="k-mega__ring">
                  <img v-if="aisle.icon" :src="aisleImage(aisle, 64)" alt="" height="40" width="40" loading="lazy" />
                </span>
                {{ aisle.title || aisle.name }}
              </router-link>
            </div>
            <div class="k-mega__foot">
              <router-link :to="dealsRoute" class="k-more">Today’s deals <v-icon class="k-flip" size="18">chevron_right</v-icon></router-link>
              <router-link :to="catalogueRoute" class="k-more">Every product <v-icon class="k-flip" size="18">chevron_right</v-icon></router-link>
            </div>
          </div>
        </v-menu>

        <div v-if="showSearch && !compact" class="k-header__search">
          <s-storefront-search-box
            v-model:expand-input="globalStyle.search_mode"
            :dark="false"
            :negative-qr-margin="false"
            :title="$t('layout_shop.search_title', { shop_name: shopTitle })"
            color="#10231b"
            flat
            no-qr
            persistent-placeholder
            rounded="lg"
            variant="outlined"
            @onClear="$emit('clear')"
            @onSearch="(event) => $emit('search', event)"
          />
        </div>
        <v-spacer v-else></v-spacer>

        <nav aria-label="Your account" class="k-header__acts">
          <s-language-selector v-if="!compact" class="k-header__lang" icon-color="#10231b" icon-only></s-language-selector>
          <u-currency-selector
            v-if="!compact && $shop.currencies && $shop.currencies.length > 1"
            :shop="$shop"
            class="k-header__lang"
            dense
            hide-details
            icon
            icon-color="#10231b"
            icon-only
            single-line
            small
            @change="onChangeUserSelectedCurrency"
          />

          <template v-if="!compact">
            <router-link v-if="user" :to="ordersRoute" class="k-header__link">
              <v-icon size="20">receipt_long</v-icon>
              Orders
            </router-link>
            <component
              :is="user ? 'router-link' : 'button'"
              :to="user ? savedRoute : undefined"
              class="k-header__link"
              :type="user ? undefined : 'button'"
              @click="!user && signIn()"
            >
              <v-icon size="20">favorite_border</v-icon>
              Saved
            </component>
          </template>

          <s-header-section-user v-if="user && !compact"></s-header-section-user>
          <button v-else-if="!user && !busyUser && !compact" class="k-header__link -signin" type="button" @click="signIn">
            <v-icon size="20">person_outline</v-icon>
            Sign in
          </button>

          <button
            :aria-label="`Basket, ${itemsCount} items`"
            class="k-header__basket"
            type="button"
            @click="basket = true"
          >
            <v-icon size="20">shopping_bag</v-icon>
            <span v-if="!compact">Basket</span>
            <em v-if="itemsCount">{{ itemsCount }}</em>
          </button>
        </nav>
      </div>

      <!-- Phone: a search pill under the bar. Selldone's search box
           autofocuses on a phone (the keyboard would open on every page),
           so it is mounted only once the pill is tapped, already open. -->
      <div v-if="showSearch && compact" class="k-header__search -below k-wrap">
        <s-storefront-search-box
          v-if="phone_search"
          :dark="false"
          :expand-input="true"
          :negative-qr-margin="false"
          :title="$t('layout_shop.search_title', { shop_name: shopTitle })"
          color="#10231b"
          flat
          no-qr
          persistent-placeholder
          rounded="lg"
          variant="outlined"
          @onClear="$emit('clear')"
          @onSearch="(event) => { phone_search = false; $emit('search', event); }"
        />
        <button v-else class="k-header__search-pill" type="button" @click="phone_search = true">
          <v-icon size="20">search</v-icon>
          Search milk, bread, berries…
        </button>
      </div>
    </div>

    <!-- ▆▆▆▆▆▆▆▆ Aisle strip ▆▆▆▆▆▆▆▆ -->
    <nav v-if="!compact && aisleList.length" aria-label="Aisles" class="k-strip">
      <div class="k-strip__row k-wrap">
        <router-link :to="dealsRoute" class="k-strip__link -deals">
          <v-icon size="18">local_offer</v-icon>
          Deals
        </router-link>
        <router-link
          v-for="aisle in aisleList"
          :key="aisle.id"
          :class="{ '-on': $route.params.category_name === aisle.name }"
          :to="aisleRoute(aisle)"
          class="k-strip__link"
        >
          {{ aisle.title || aisle.name }}
        </router-link>
      </div>
    </nav>

    <!-- ▆▆▆▆▆▆▆▆ Basket drawer (Selldone's basket menu) ▆▆▆▆▆▆▆▆ -->
    <teleport to="body">
      <v-navigation-drawer
        v-model="basket"
        :location="$vuetify.locale.isRtl ? 'left' : 'right'"
        :width="Math.min(560, windowWidth * 0.92)"
        class="k-drawer -basket"
        temporary
      >
        <div class="k-drawer__head">
          <p class="k-drawer__title">Your basket</p>
          <button aria-label="Close" class="k-header__icon" type="button" @click="basket = false">
            <v-icon>close</v-icon>
          </button>
        </div>
        <!-- Empty: Selldone's line "Your cart is empty." left the shopper
             nowhere to go; Kalio's offers the way back to the shelves. -->
        <div v-if="!itemsCount" class="k-drawer__empty">
          <span aria-hidden="true" class="k-drawer__empty-mark"><v-icon size="30">shopping_bag</v-icon></span>
          <p class="k-drawer__empty-title">Your basket is empty</p>
          <p class="k-drawer__empty-text">Pick something from the aisles and it will wait for you here.</p>
          <div class="k-drawer__empty-ctas">
            <router-link :to="dealsRoute" class="k-btn k-btn--solid" @click="basket = false">Shop today’s deals</router-link>
            <router-link :to="catalogueRoute" class="k-btn k-btn--line" @click="basket = false">Browse every product</router-link>
          </div>
          <template v-if="aisleList.length">
            <p class="k-eyebrow k-drawer__empty-label">Or start with an aisle</p>
            <nav aria-label="Aisles" class="k-drawer__empty-aisles">
              <router-link
                v-for="aisle in aisleList.slice(0, 8)"
                :key="aisle.id"
                :style="{ '--k-tint': tint(aisle) }"
                :to="aisleRoute(aisle)"
                class="k-aisle-chip"
                @click="basket = false"
              >
                <img v-if="aisle.icon" :src="aisleImage(aisle, 64)" alt="" height="32" width="32" loading="lazy" />
                {{ aisle.title || aisle.name }}
              </router-link>
            </nav>
          </template>
        </div>
        <basket-top-menu v-else class="k-drawer__body" @close="basket = false" />
      </v-navigation-drawer>

      <!-- ▆▆▆▆▆▆▆▆ Phone menu ▆▆▆▆▆▆▆▆ -->
      <v-navigation-drawer
        v-model="menu"
        :location="$vuetify.locale.isRtl ? 'right' : 'left'"
        :width="Math.min(360, windowWidth * 0.88)"
        class="k-drawer -menu"
        temporary
      >
        <div class="k-drawer__head">
          <router-link :to="homeRoute" class="k-header__brand" @click="menu = false">{{ shopTitle }}<i aria-hidden="true"></i></router-link>
          <button aria-label="Close" class="k-header__icon" type="button" @click="menu = false">
            <v-icon>close</v-icon>
          </button>
        </div>

        <div class="k-drawer__account">
          <template v-if="user">
            <router-link :to="profileRoute" class="k-drawer__link" @click="menu = false"><v-icon size="20">person_outline</v-icon>My account</router-link>
            <router-link :to="ordersRoute" class="k-drawer__link" @click="menu = false"><v-icon size="20">receipt_long</v-icon>Orders</router-link>
            <router-link :to="savedRoute" class="k-drawer__link" @click="menu = false"><v-icon size="20">favorite_border</v-icon>Saved</router-link>
          </template>
          <button v-else class="k-btn k-btn--solid" type="button" @click="menu = false; signIn()">Sign in</button>
        </div>

        <p class="k-eyebrow k-drawer__label">Aisles</p>
        <router-link :to="dealsRoute" class="k-drawer__link -deals" @click="menu = false"><v-icon size="20">local_offer</v-icon>Deals</router-link>
        <router-link
          v-for="aisle in aisleList"
          :key="aisle.id"
          :to="aisleRoute(aisle)"
          class="k-drawer__link"
          @click="menu = false"
        >
          <span :style="{ '--k-tint': tint(aisle) }" class="k-drawer__ring">
            <img v-if="aisle.icon" :src="aisleImage(aisle, 64)" alt="" height="26" width="26" loading="lazy" />
          </span>
          {{ aisle.title || aisle.name }}
        </router-link>

        <div class="k-drawer__pickers">
          <s-language-selector hide-details variant="outlined"></s-language-selector>
          <u-currency-selector
            v-if="$shop.currencies && $shop.currencies.length > 1"
            :shop="$shop"
            hide-details
            @change="onChangeUserSelectedCurrency"
          />
        </div>
      </v-navigation-drawer>
    </teleport>
  </header>
</template>

<script>
import { defineAsyncComponent } from "vue";
import SStorefrontSearchBox from "@selldone/components-vue/storefront/search/SStorefrontSearchBox.vue";
import SLanguageSelector from "@selldone/components-vue/storefront/language/selector/SLanguageSelector.vue";
import UCurrencySelector from "@selldone/components-vue/ui/currency/selector/UCurrencySelector.vue";
import BasketTopMenu from "@selldone/components-vue/storefront/order/basket/BasketTopMenu.vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { aisleImage, aisleRoute, aisles, catalogueRoute, dealsRoute, tintFor } from "../kalio-catalog";

export default {
  name: "KalioHeader",
  components: {
    SStorefrontSearchBox,
    SLanguageSelector,
    UCurrencySelector,
    BasketTopMenu,
    SHeaderSectionUser: defineAsyncComponent(
      () => import("@selldone/components-vue/storefront/header/section/user/SHeaderSectionUser.vue"),
    ),
  },
  inject: ["$shop"],

  props: {
    /** The current route asks for the search box (route meta "search"). */
    showSearch: { type: Boolean, default: true },
  },

  emits: ["search", "clear"],

  data() {
    return {
      aisleList: [],
      aisles_open: false,
      basket: false,
      menu: false,
      phone_search: false,
      windowWidth: window.innerWidth,
    };
  },

  computed: {
    shopTitle() {
      return this.$shop?.title || "Kalio";
    },
    user() {
      return this.$store.getters.getUser;
    },
    busyUser() {
      return this.$store.getters.getBusyUser;
    },
    compact() {
      return this.$vuetify.display.smAndDown;
    },
    globalStyle() {
      return this.$store.getters.getGlobalStyle;
    },
    itemsCount() {
      return this.getTotalItemInBaskets() || 0;
    },
    homeRoute() {
      return { path: "/" };
    },
    dealsRoute() {
      return dealsRoute();
    },
    catalogueRoute() {
      return catalogueRoute();
    },
    ordersRoute() {
      return { name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL };
    },
    savedRoute() {
      return { name: window.$storefront.routes.USER_FAVORITES_PAGE };
    },
    profileRoute() {
      return { name: window.$storefront.routes.USER_PROFILE_PAGE };
    },
    drawerOpen() {
      return this.basket || this.menu;
    },
  },

  watch: {
    drawerOpen(open) {
      /* The phone bottom bar would sit over either drawer. */
      this.$store.commit("setForceHideNavigation", open);
    },
    $route() {
      this.menu = false;
      this.basket = false;
      this.phone_search = false;
    },
  },

  mounted() {
    aisles().then((list) => (this.aisleList = list));
    this.onResize = () => (this.windowWidth = window.innerWidth);
    window.addEventListener("resize", this.onResize, { passive: true });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    aisleRoute,
    aisleImage,
    tint: tintFor,
    signIn() {
      EventBus.$emit("need-login", true);
    },
  },
};
</script>
