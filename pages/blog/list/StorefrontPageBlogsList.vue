<!--
  Kalio — the journal (the shop's blog), design B "Market journal", chosen by
  the owner on 5 November 2026.

  A deep-green banner, then the notes as a dated list — date block, topic,
  title, a few lines and the picture — beside a column with the most read
  notes, this week's deals (real products, "+" adds them) and a way to ask
  the shop. A category, an author, a tag or a search keeps the same page
  with its own heading. Posts that came with Selldone's demo content are
  marked as sample text (KalioSampleNote), as the owner asked.

  Selldone's page was a card with a headline carousel, an "interest" slider
  and cards; its list asked the API with `extra`, which answers no posts,
  so the list under the headline stayed empty.
-->
<template>
  <div class="k-journal">
    <slot name="header"></slot>

    <div class="k-wrap">
      <nav aria-label="Breadcrumb" class="k-official__crumbs">
        <router-link :to="{ name: 'ShopPage' }">{{ shopTitle }}</router-link>
        <v-icon size="16">chevron_right</v-icon>
        <router-link v-if="filtered" :to="homeRoute">Journal</router-link>
        <span v-else>Journal</span>
        <template v-if="filtered">
          <v-icon size="16">chevron_right</v-icon>
          <span>{{ heading }}</span>
        </template>
      </nav>

      <section class="k-journal__hero">
        <div>
          <p class="k-journal__eyebrow">{{ filtered ? "Market journal" : `The ${shopTitle} journal` }}</p>
          <h1>{{ heading }}</h1>
          <p>{{ lede }}</p>
        </div>
        <p v-if="total" class="k-journal__count">
          <b>{{ total }}</b>{{ total === 1 ? "note" : "notes" }}{{ filtered ? "" : " so far" }}
        </p>
      </section>

      <kalio-sample-note v-if="demo" class="k-journal__note">
        These notes came with the shop's demo content to show the page. They are not real {{ shopTitle }} articles.
      </kalio-sample-note>

      <div class="k-journal__cols">
        <div class="k-journal__main">
          <nav aria-label="Topics" class="k-journal__tabs">
            <router-link :class="{ '-on': !current_category }" :to="homeRoute">Latest</router-link>
            <router-link
              v-for="category in categories"
              :key="category.id"
              :class="{ '-on': String(category.id) === String(current_category) }"
              :to="journalRoute({ category: category.id })"
            >
              {{ category.title || category.name }}
            </router-link>
          </nav>

          <ol v-if="articles.length" :class="{ '-busy': busy }" class="k-journal__list">
            <li v-for="article in articles" :key="article.id">
              <router-link :to="postRoute(article)" class="k-jentry">
                <span class="k-jentry__date">
                  <b>{{ dateParts(article.created_at).day }}</b>
                  <span>{{ dateParts(article.created_at).mon }}</span>
                </span>
                <span class="k-jentry__text">
                  <span v-if="topicOf(article)" class="k-topic">{{ topicOf(article) }}</span>
                  <span class="k-jentry__title">{{ article.title }}</span>
                  <span v-if="article.description" class="k-jentry__lede">{{ article.description }}</span>
                  <span class="k-jentry__meta">
                    <span v-if="article.user?.name" class="k-who">
                      <i>{{ initials(article.user.name) }}</i>{{ article.user.name }}
                    </span>
                    <span>{{ dateParts(article.created_at).full }}</span>
                  </span>
                </span>
                <span class="k-jentry__pic">
                  <img v-if="article.image" :src="article.image" alt="" loading="lazy" />
                  <v-icon v-else size="32">article</v-icon>
                </span>
              </router-link>
            </li>
          </ol>

          <div v-else-if="busy" aria-hidden="true" class="k-journal__list -skeleton">
            <div v-for="n in 3" :key="n" class="k-jentry"></div>
          </div>

          <div v-else class="k-board__empty k-journal__empty">
            <v-icon size="30">menu_book</v-icon>
            <h2>{{ filtered ? "No notes here yet" : "The journal is empty for now" }}</h2>
            <p>{{ filtered ? "Nothing matches this yet. The latest notes are one tap away." : `${shopTitle} has not written any notes yet.` }}</p>
            <router-link v-if="filtered" :to="homeRoute" class="k-btn k-btn--line">All notes</router-link>
          </div>

          <nav v-if="pageCount > 1" aria-label="Pages" class="k-journal__pages">
            <router-link v-if="page > 1" :to="pageRoute(page - 1)" class="k-btn k-btn--line">
              <v-icon class="k-flip" size="20">chevron_left</v-icon>Newer
            </router-link>
            <span>Page {{ page }} of {{ pageCount }}</span>
            <router-link v-if="page < pageCount" :to="pageRoute(page + 1)" class="k-btn k-btn--line">
              Older<v-icon class="k-flip" size="20">chevron_right</v-icon>
            </router-link>
          </nav>
        </div>

        <aside class="k-journal__side">
          <section v-if="popular.length" class="k-jbox">
            <h2>Most read</h2>
            <ol class="k-jbox__ranks">
              <li v-for="article in popular.slice(0, 4)" :key="article.id">
                <router-link :to="postRoute(article)">{{ article.title }}</router-link>
              </li>
            </ol>
          </section>

          <section v-if="offers.length" class="k-jbox">
            <h2>On offer this week</h2>
            <div class="k-jbox__grid">
              <kalio-mini-product v-for="product in offers" :key="product.id" :product="product" @sheet="openSheet" />
            </div>
            <router-link :to="dealsRoute" class="k-more">
              Every deal<v-icon class="k-flip" size="20">chevron_right</v-icon>
            </router-link>
          </section>

          <section class="k-jbox -ask">
            <h2>Got a question?</h2>
            <p>Ask the sellers anything about a product before you order.</p>
            <router-link :to="{ name: window.$storefront.routes.SHOP_CONTACT_US }" class="k-btn k-btn--line">
              Contact the shop
            </router-link>
          </section>
        </aside>
      </div>
    </div>

    <kalio-quick-buy v-model="sheet" :product="picked" />
  </div>
</template>

<script lang="ts">
import KalioSampleNote from "@app-storefront/components/kalio/pages/KalioSampleNote.vue";
import KalioMiniProduct from "@app-storefront/components/kalio/pages/KalioMiniProduct.vue";
import KalioQuickBuy from "@app-storefront/components/kalio/KalioQuickBuy.vue";
import { dealsRoute } from "@app-storefront/components/kalio/kalio-catalog";
import {
  dateParts,
  deals,
  initials,
  isDemoPost,
  journalExtra,
  journalPage,
  journalRoute,
  postRoute,
} from "@app-storefront/components/kalio/pages/kalio-journal";

const PER_PAGE = 8;

export default {
  name: "StorefrontPageBlogsList",
  components: { KalioSampleNote, KalioMiniProduct, KalioQuickBuy },
  inject: ["$shop"],

  data: () => ({
    articles: [],
    total: 0,
    busy: false,
    popular: [],
    categories: [],
    offers: [],
    sheet: false,
    picked: null,
  }),

  computed: {
    shopTitle() {
      return this.$shop?.title || "The shop";
    },
    page() {
      return Math.max(1, parseInt(this.$route.query.page) || 1);
    },
    pageCount() {
      return Math.ceil(this.total / PER_PAGE);
    },
    current_category() {
      return this.$route.query.category || null;
    },
    current_tag() {
      return this.$route.query.tags || null;
    },
    current_search() {
      return this.$route.query.search || "";
    },
    current_author() {
      return this.$route.params.author || null;
    },
    current_author_id() {
      return this.$route.params.author_id || null;
    },
    filtered() {
      return !!(this.current_category || this.current_tag || this.current_search || this.current_author_id);
    },
    category() {
      return this.categories.find((it) => String(it.id) === String(this.current_category)) || null;
    },
    heading() {
      if (this.current_category) return this.category?.title || this.category?.name || "Topic";
      if (this.current_author_id) return this.articles[0]?.user?.name || this.current_author || "Author";
      if (this.current_tag) return `#${this.current_tag}`;
      if (this.current_search) return `“${this.current_search}”`;
      return "Notes from the aisles";
    },
    lede() {
      if (this.current_category) return this.category?.description || "Every note on this topic, newest first.";
      if (this.current_author_id) return "Every note by this author, newest first.";
      if (this.current_tag || this.current_search) return "The notes that match, newest first.";
      return "Short, useful reads for the weekly shop: what's good now, how to keep it fresh and what to cook with it.";
    },
    homeRoute() {
      return journalRoute();
    },
    dealsRoute() {
      return dealsRoute();
    },
    /* Every note on the page came with the demo content. */
    demo() {
      return this.articles.length > 0 && this.articles.every((article) => isDemoPost(article, this.$shop));
    },
  },

  watch: {
    "$route.fullPath"() {
      this.load();
    },
  },

  created() {
    this.setPageTitle?.("Journal");
    this.load();
    journalExtra().then(({ popular, categories }) => {
      this.popular = popular;
      this.categories = categories;
    });
    deals(4).then((list) => (this.offers = list));
  },

  methods: {
    dateParts,
    initials,
    postRoute,
    journalRoute,

    topicOf(article) {
      const id = article?.parent?.category_id;
      const category = id && this.categories.find((it) => it.id === id);
      return category ? category.title || category.name : "";
    },

    pageRoute(page) {
      return { name: this.$route.name, params: this.$route.params, query: { ...this.$route.query, page } };
    },

    load() {
      const asked = this.$route.fullPath;
      this.busy = true;
      journalPage({
        page: this.page,
        limit: PER_PAGE,
        category: this.current_category,
        author: this.current_author,
        author_id: this.current_author_id,
        tag: this.current_tag,
        search: this.current_search,
      })
        .then(({ articles, total }) => {
          if (asked !== this.$route.fullPath) return;
          this.articles = articles;
          this.total = total;
        })
        .catch(() => {
          if (asked !== this.$route.fullPath) return;
          this.articles = [];
          this.total = 0;
        })
        .finally(() => {
          if (asked === this.$route.fullPath) this.busy = false;
        });
    },

    openSheet(product) {
      this.picked = product;
      this.sheet = true;
    },
  },
};
</script>
