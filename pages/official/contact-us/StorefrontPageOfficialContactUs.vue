<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  -->
<!--
  Argon — Contact us (digini-design/contact-b.html).

  A message form (name, email, order number, topic, message) sent with
  Selldone's own contact form call, and beside it how else to reach the
  shop. When the shop has written its "Contact us" page in the dashboard,
  that text is shown there; until then sample cards under a clear "Sample
  text" note (the owner's rule for a test shop), and always a card to track
  an order. A missing page is not an error: nothing red is shown.
-->
<template>
  <div class="ar-contact">
    <h1 class="ar-contact__h">{{ t("argon.footer.contact", "Contact us") }}</h1>
    <p class="ar-contact__lede">{{ t("argon.contact.lede", "Questions about a product or an order? Write to us and we'll get back to you.") }}</p>

    <div class="ar-contact__cols">
      <section aria-labelledby="ar-contact-form" class="ar-contact__form">
        <template v-if="submitted">
          <div class="ar-empty">
            <span class="ar-empty__ic"><span class="ms">mark_email_read</span></span>
            <p id="ar-contact-form" class="ar-empty__t">{{ t("argon.contact.sent", "Thanks, your message is on its way") }}</p>
            <p class="ar-empty__p">{{ t("argon.contact.sentText", "We usually answer within a working day, at the email you gave us.") }}</p>
            <button class="ar-btn -line" type="button" @click="submitted = false">{{ t("argon.contact.another", "Send another message") }}</button>
          </div>
        </template>
        <form v-else novalidate @submit.prevent="sendForm">
          <h2 id="ar-contact-form">{{ t("argon.contact.formTitle", "Send us a message") }}</h2>
          <div class="ar-form">
            <label class="ar-field">
              <span>{{ t("argon.contact.name", "Name") }}</span>
              <input v-model.trim="name" :placeholder="t('argon.contact.namePh', 'Your name')" autocomplete="name" type="text" />
            </label>
            <label :class="{ '-bad': tried && !emailOk }" class="ar-field">
              <span>{{ t("argon.footer.news.email", "Email") }}</span>
              <input v-model.trim="email" autocomplete="email" placeholder="you@example.com" type="email" />
              <small v-if="tried && !emailOk">{{ t("argon.contact.needEmail", "Please enter your email, so we can answer.") }}</small>
            </label>
            <label class="ar-field">
              <span>{{ t("argon.contact.order", "Order number (optional)") }}</span>
              <input v-model.trim="order" :placeholder="t('argon.contact.orderPh', 'e.g. 1042')" type="text" />
            </label>
            <label class="ar-field">
              <span>{{ t("argon.contact.topic", "Topic") }}</span>
              <select v-model="category">
                <option v-for="tp in topicList" :key="tp.value" :value="tp.value">{{ tp.label }}</option>
              </select>
            </label>
            <label :class="{ '-bad': tried && !message }" class="ar-field -wide">
              <span>{{ t("argon.contact.message", "Message") }}</span>
              <textarea v-model="message" :placeholder="t('argon.contact.messagePh', 'How can we help?')" rows="5"></textarea>
              <small v-if="tried && !message">{{ t("argon.contact.needMessage", "Please write your message.") }}</small>
            </label>
          </div>
          <div class="ar-contact__send">
            <button :disabled="busy_send" class="ar-btn" type="submit">
              <span class="ms">send</span>{{ busy_send ? t("argon.contact.sending", "Sending…") : t("argon.contact.send", "Send message") }}
            </button>
            <small>{{ t("argon.contact.answer", "We usually answer within a working day.") }}</small>
          </div>
          <p v-if="error" class="ar-contact__err" role="alert">{{ error }}</p>
        </form>
      </section>

      <aside :aria-label="t('argon.contact.other', 'Other ways to reach us')" class="ar-contact__side">
        <div v-if="profile && profileText" class="ar-contact__card -profile">
          <s-article-editor :body="profile.body" :edit="false" :enable-title="false" :only-view="true" class="k-prose" />
        </div>
        <template v-else-if="!busy">
          <kalio-sample-note />
          <div v-for="c in samples" :key="c.title" class="ar-contact__card">
            <span class="ar-contact__ic"><span class="ms">{{ c.icon }}</span></span>
            <div>
              <b>{{ c.title }}</b>
              <p>{{ c.line }}</p>
              <span class="ar-contact__more">{{ c.more }}</span>
            </div>
          </div>
        </template>
        <div class="ar-contact__card">
          <span class="ar-contact__ic"><span class="ms">local_shipping</span></span>
          <div>
            <b>{{ t("argon.footer.trackOrder", "Track an order") }}</b>
            <p>{{ t("argon.contact.trackText", "Your orders, their status and messages are in your account.") }}</p>
            <router-link :to="{ name: window.$storefront.routes.HISTORY_ORDERS_PHYSICAL }" class="ar-link">{{ t("argon.header.track", "Track order") }}<span class="ms k-flip">chevron_right</span></router-link>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import SArticleEditor from "@selldone/components-vue/article/SArticleEditor.vue";
import KalioSampleNote from "../../../components/kalio/pages/KalioSampleNote.vue";
import { plainText } from "../../../components/kalio/pages/kalio-sample-pages";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialContactUs",
  components: { SArticleEditor, KalioSampleNote },
  inject: ["$shop"],

  data: () => ({
    window,
    profile: null as any,
    busy: false,
    name: "",
    email: "",
    order: "",
    message: "",
    category: "A product question",
    topics: ["A product question", "An order I placed", "Delivery or pickup", "Returns and refunds", "Something else"],
    busy_send: false,
    submitted: false,
    tried: false,
    error: null as string | null,
  }),

  computed: {
    emailOk(): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email || "");
    },
    profileText(): string {
      return plainText(this.profile?.body);
    },
    samples() {
      return [
        { icon: "mail", title: t("argon.contact.emailUs", "Email us"), line: "hello@argon.example", more: t("argon.contact.emailMore", "Answers within a working day") },
        { icon: "call", title: t("argon.contact.callUs", "Call us"), line: "+1 305 555 0100", more: t("argon.contact.callMore", "Mon–Fri, 9 AM – 6 PM") },
        { icon: "location_on", title: t("argon.contact.visit", "Visit"), line: "100 Biscayne Blvd, Miami, FL 33132", more: t("argon.contact.visitMore", "Pickup point") },
      ];
    },
    /* The topics: the English value goes to the shop with the message, the
       words show in the visitor's language. */
    topicList() {
      return [
        { value: "A product question", label: t("argon.contact.topic.product", "A product question") },
        { value: "An order I placed", label: t("argon.contact.topic.order", "An order I placed") },
        { value: "Delivery or pickup", label: t("argon.contact.topic.delivery", "Delivery or pickup") },
        { value: "Returns and refunds", label: t("argon.contact.topic.returns", "Returns and refunds") },
        { value: "Something else", label: t("argon.contact.topic.else", "Something else") },
      ];
    },
  },

  created() {
    this.setPageTitle(t("contact.pageTitle", "Contact us")); // Set Page Title!
    this.fetchProfile();
    const u = this.USER();
    if (u) {
      this.name = u.name || "";
      this.email = u.email || "";
    }
  },

  methods: {
    /* The shop's own "Contact us" page, if it wrote one. None is not an error. */
    fetchProfile() {
      this.busy = true;
      window.axios
        .get(window.XAPI.GET_SHOP_PROFILE(this.$shop.name, "contact-us"))
        .then(({ data }: any) => {
          this.profile = data?.error ? null : data.profile;
        })
        .catch(() => (this.profile = null))
        .finally(() => (this.busy = false));
    },
    sendForm() {
      this.tried = true;
      this.error = null;
      const text = String(this.message || "").replace(/<[^>]*>?/gm, "").trim();
      if (!text || !this.emailOk) return;
      this.busy_send = true;
      window.axios
        .post(window.XAPI.POST_CONTACT_US_FORM(this.$shop.name), {
          name: this.name,
          email: this.email,
          phone: this.USER()?.phone || null,
          message: this.order ? `Order ${this.order}\n\n${text}` : text,
          category: this.category,
          url: window.location.href,
        })
        .then(({ data }: any) => {
          if (data?.error) {
            this.error = data.error_msg || t("argon.contact.failed", "That did not go through. Please try again.");
            return;
          }
          this.message = "";
          this.order = "";
          this.tried = false;
          this.submitted = true;
        })
        .catch(() => (this.error = t("argon.contact.failedLater", "That did not go through. Please try again in a moment.")))
        .finally(() => (this.busy_send = false));
    },
  },
};
</script>
