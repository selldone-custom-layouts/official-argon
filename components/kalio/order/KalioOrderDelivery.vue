<!--
  Kalio — where an order goes, and when (4 November 2026).

  A card in the order page's main column: how it travels and what that
  cost, a "Has it arrived?" step once the shop has sent it, then the
  details as a short list (deliver to, when, tracking, billing, the
  checkout form's answers) beside a small map of the address. "Change
  address" opens Kalio's address sheet (KalioAddressSheet) and "Change"
  under billing opens a small form in place. It replaces Selldone's
  receiver widget (SShopCustomerDeliveryInfoWidget) and keeps its rules:
  the address can change until the order is sent, and not when sellers
  ship their parts themselves; a pickup shows the place and directions.
-->
<template>
  <section :class="{ '-pickup': is_pickup }" class="k-ocard k-odel">
    <header class="k-ocard__head">
      <span aria-hidden="true" class="k-ocard__ico"><v-icon size="22">{{ is_pickup ? "storefront" : "local_shipping" }}</v-icon></span>
      <div class="k-ocard__titles">
        <h2>{{ is_pickup ? "Pickup" : "Delivery" }}</h2>
        <p v-if="methodLine">{{ methodLine }}</p>
      </div>
    </header>

    <div v-if="canConfirmReceived" class="k-odel__ask">
      <div>
        <b>{{ is_pickup ? "Picked it up?" : "Has it arrived?" }}</b>
        <p>Let the shop know once your order is with you.</p>
        <s-order-delivery-auto-complete :basket="basket" class="k-odel__auto" />
      </div>
      <button :disabled="busy_receive" class="k-odel__go" type="button" @click="confirmReceived">
        <v-progress-circular v-if="busy_receive" indeterminate size="18" width="2" />
        <v-icon v-else size="18">check</v-icon>
        {{ is_pickup ? "I've picked it up" : "I've got my order" }}
      </button>
    </div>

    <p v-if="delivered" class="k-odel__done">
      <v-icon size="20">check_circle</v-icon>
      <span>
        <b>{{ is_pickup ? "Picked up" : "Delivered" }}</b>
        <template v-if="basket.delivery_at"> · {{ when(basket.delivery_at) }}</template>
      </span>
    </p>

    <div :class="{ '-nomap': !mapImage }" class="k-odel__body">
      <dl class="k-odel__list">
        <div class="k-odel__row">
          <dt>{{ is_pickup ? "Pick it up at" : "Deliver to" }}</dt>
          <dd>
            <p v-if="contact" class="k-odel__who">{{ contact }}</p>
            <p v-for="line in addressLines" :key="line">{{ line }}</p>
            <p v-if="!addressLines.length && !contact" class="k-odel__none">No address on this order.</p>
            <p v-if="receiver.message" class="k-odel__note">“{{ receiver.message }}”</p>
            <div class="k-odel__links">
              <button v-if="canEditAddress" :disabled="busy_address" class="k-odel__link" type="button" @click="address_sheet = true">
                <v-progress-circular v-if="busy_address" indeterminate size="14" width="2" />
                Change address
              </button>
              <a v-if="is_pickup && directions" :href="directions" class="k-odel__link" rel="noopener" target="_blank">Directions</a>
            </div>
          </dd>
        </div>

        <div v-if="is_pickup && pickupContact" class="k-odel__row">
          <dt>Collected by</dt>
          <dd><p>{{ pickupContact }}</p></dd>
        </div>

        <div v-if="whenText" class="k-odel__row">
          <dt>When</dt>
          <dd><p>{{ whenText }}</p></dd>
        </div>

        <div v-if="tracking.code || tracking.url" class="k-odel__row">
          <dt>Tracking</dt>
          <dd>
            <p v-if="tracking.code" class="k-odel__code">
              <b>{{ tracking.code }}</b>
              <button class="k-odel__link" type="button" @click="copyCode">{{ copied ? "Copied" : "Copy" }}</button>
            </p>
            <a v-if="tracking.url" :href="tracking.url" class="k-odel__link" rel="noopener" target="_blank">Follow the parcel</a>
          </dd>
        </div>

        <div v-if="showBilling" class="k-odel__row">
          <dt>Billing</dt>
          <dd>
            <template v-if="!edit_billing">
              <p class="k-odel__who">{{ billingWho }}</p>
              <p v-if="billingLine">{{ billingLine }}</p>
              <p v-if="billing.tax_id">Tax ID {{ billing.tax_id }}</p>
              <div class="k-odel__links">
                <button v-if="canEditAddress" class="k-odel__link" type="button" @click="openBilling">Change</button>
              </div>
            </template>

            <form v-else class="k-odel__form" @submit.prevent="saveBilling">
              <div class="k-odel__seg" role="radiogroup">
                <button :aria-checked="same_billing" :class="{ '-on': same_billing }" role="radio" type="button" @click="same_billing = true">Same as delivery</button>
                <button :aria-checked="!same_billing" :class="{ '-on': !same_billing }" role="radio" type="button" @click="same_billing = false">Different details</button>
              </div>
              <template v-if="!same_billing">
                <label class="k-odel__field">
                  <span>Name on the receipt</span>
                  <input v-model="billing_name" autocomplete="name" type="text" />
                </label>
                <label class="k-odel__field">
                  <span>Billing address</span>
                  <input v-model="billing_address" autocomplete="street-address" type="text" />
                </label>
              </template>
              <div class="k-odel__formacts">
                <button class="k-odel__ghost" type="button" @click="edit_billing = false">Cancel</button>
                <button :disabled="busy_billing" class="k-odel__save" type="submit">
                  <v-progress-circular v-if="busy_billing" indeterminate size="16" width="2" />Save
                </button>
              </div>
            </form>
          </dd>
        </div>

        <div v-for="answer in formAnswers" :key="answer.name" class="k-odel__row">
          <dt>{{ answer.label }}</dt>
          <dd><p :class="{ 'k-odel__none': !answer.value }">{{ answer.value || "Not given" }}</p></dd>
        </div>
      </dl>

      <a v-if="mapImage" :href="directions" :aria-label="is_pickup ? 'Directions to the pickup point' : 'The address on a map'" class="k-odel__map" rel="noopener" target="_blank">
        <img :src="mapImage" alt="" loading="lazy" />
        <span aria-hidden="true" class="k-odel__pin"><v-icon size="22">{{ is_pickup ? "storefront" : "home" }}</v-icon></span>
      </a>
    </div>

    <delivery-timeline-transportation-order
      v-if="basket.transportation_order && !is_pickup"
      :delivery-info="delivery_info"
      :transportation-order="basket.transportation_order"
      class="k-odel__timeline"
    />

    <kalio-address-sheet
      v-if="canEditAddress"
      v-model="address_sheet"
      :center="receiver.location || null"
      :countries="$shop.countries?.length ? $shop.countries : null"
      :no-map="noMap"
      :receiver-info="receiver"
      heading="Change the address"
      lede="Until your order is sent, the shop delivers wherever you put the pin."
      @save="saveAddress"
    />
  </section>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import SOrderDeliveryAutoComplete from "@selldone/components-vue/storefront/order/auto-complete/SOrderDeliveryAutoComplete.vue";
import DeliveryTimelineTransportationOrder from "@selldone/components-vue/storefront/order/delivery/DeliveryTimelineTransportationOrder.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import { TimeSpans } from "@selldone/core-js/enums/logistic/TimeSpans";
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import { Basket, ShopOptionsHelper } from "@selldone/core-js";
import KalioAddressSheet from "../checkout/KalioAddressSheet.vue";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** 8 → "8 am", 12 → "12 pm", 18 → "6 pm" */
function hour(h) {
  if (h === 0 || h === 24) return "midnight";
  if (h === 12) return "12 pm";
  return h < 12 ? `${h} am` : `${h - 12} pm`;
}

export default {
  name: "KalioOrderDelivery",
  components: { KalioAddressSheet, SOrderDeliveryAutoComplete, DeliveryTimelineTransportationOrder },
  inject: ["$shop"],

  props: {
    basket: { type: Object, required: true },
  },

  data() {
    return {
      address_sheet: false,
      busy_address: false,
      busy_receive: false,

      edit_billing: false,
      busy_billing: false,
      same_billing: true,
      billing_name: "",
      billing_address: "",

      copied: false,
    };
  },

  computed: {
    receiver() {
      return this.basket?.receiver_info || {};
    },
    delivery_info() {
      return this.basket?.delivery_info || null;
    },
    is_pickup() {
      return this.delivery_info?.type === ShopTransportations.Pickup.code;
    },
    state() {
      return this.basket?.delivery_state;
    },
    canConfirmReceived() {
      return this.state === Basket.PhysicalOrderStates.SentOrder.code;
    },
    delivered() {
      return this.state === Basket.PhysicalOrderStates.ToCustomer.code;
    },
    /** As Selldone allows it: until the order is sent, and not when the sellers ship their parts themselves. */
    canEditAddress() {
      const sent = [Basket.PhysicalOrderStates.SentOrder.code, Basket.PhysicalOrderStates.ToCustomer.code].includes(this.state);
      return !sent && !this.is_pickup && !this.basket?.vendor_orders?.length && this.basket?.status !== "Canceled";
    },
    noMap() {
      return !ShopOptionsHelper.HasMap(this.$shop);
    },

    methodLine() {
      const info = this.delivery_info;
      const parts = [];
      if (info?.type) parts.push(info.title || this.$t(ShopTransportations[info.type]?.name || info.type));
      const price = this.basket?.delivery_price;
      if (price > 0) parts.push(this.money(price));
      else if (price === 0) parts.push("Free");
      else if (price < 0) parts.push("Paid when it arrives");
      return parts.join(" · ");
    },

    contact() {
      return [this.receiver.name, this.receiver.phone].filter(Boolean).join(" · ");
    },
    addressLines() {
      const r = this.receiver;
      const street = [r.address, r.no ? `No. ${r.no}` : null, r.unit ? `Unit ${r.unit}` : null].filter(Boolean).join(", ");
      const place = [r.city, [r.state, r.postal].filter(Boolean).join(" ")].filter(Boolean).join(", ");
      const country = r.country ? this.countryName(r.country) : null;
      return [r.title, street, [place, country].filter(Boolean).join(", ")].filter(Boolean);
    },
    pickupContact() {
      const c = this.basket?.customer || this.basket?.user || {};
      return [c.full_name || c.name, c.phone].filter(Boolean).join(" · ");
    },
    location() {
      const l = this.receiver.location;
      return l?.lat && l?.lng ? l : null;
    },
    mapImage() {
      return this.location ? MapHelper.GetMapImage(this.location.lng, this.location.lat, 15, "400x400@2x", "streets-v12") : null;
    },
    directions() {
      return this.location ? MapHelper.GetMapDirectionUrl(this.location, true) : null;
    },

    /** The time the shopper asked for, in a line. */
    whenText() {
      const info = this.delivery_info;
      if (!info || this.delivered) return null;
      if (info.date) {
        const d = new Date(info.date);
        const withTime = d.getHours() || d.getMinutes();
        return d.toLocaleString(this.$i18n?.locale || "en", { weekday: "long", month: "short", day: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) });
      }
      const days = (info.days || []).filter((d) => DAYS.includes(d));
      let dayText = "Any day";
      if (days.length && days.length < 7) {
        const off = DAYS.filter((d) => !days.includes(d));
        dayText = days.length >= 4 ? `Any day but ${off.join(" or ")}` : DAYS.filter((d) => days.includes(d)).join(", ");
      }
      const spans = (info.time_spans || info.spans || []).map((s) => TimeSpans[s]).filter((s) => s && s.value !== "Instant");
      if (!spans.length || spans.length >= 3) return days.length && days.length < 7 ? `${dayText}, any time` : null;
      const spanText = spans.map((s) => `${hour(s.min)} to ${hour(s.max)}`).join(" or ");
      return `${dayText}, ${spanText}`;
    },

    tracking() {
      if (this.is_pickup) return {};
      return { code: this.delivery_info?.tracking_code, url: this.delivery_info?.tracking_url };
    },

    billing() {
      return this.basket?.billing || {};
    },
    showBilling() {
      if (this.is_pickup && !this.billing.custom) return false;
      return !!(this.billing.name || this.billing.address || this.billing.country);
    },
    billingWho() {
      return [this.billing.business ? "Business" : "Personal", this.billing.name].filter(Boolean).join(" · ");
    },
    billingLine() {
      const b = this.billing;
      return [b.address, b.state, b.country ? this.countryName(b.country) : null].filter(Boolean).join(", ");
    },

    /** The shop's own checkout questions and the answers given. */
    formAnswers() {
      const checkout = ShopOptionsHelper.GetCheckout(this.$shop) || {};
      const country = this.receiver.country || this.billing.country;
      const form = (country && checkout[`form_${country}`]) || checkout.form || [];
      const answers = this.basket?.form || {};
      return form
        .filter((field) => field.type !== "note")
        .map((field) => ({ name: field.name, label: field.title || field.name, value: answers[field.name] ? String(answers[field.name]) : null }));
    },
  },

  methods: {
    money(amount) {
      try {
        return new Intl.NumberFormat(this.$i18n?.locale || "en", { style: "currency", currency: this.basket?.currency || "USD" }).format(amount || 0);
      } catch (e) {
        return `${amount}`;
      }
    },
    when(at) {
      return new Date(at).toLocaleString(this.$i18n?.locale || "en", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    },
    countryName(code) {
      try {
        return this.getCountryName(code) || code;
      } catch (e) {
        return code;
      }
    },
    signed() {
      return { signature: this.$route.query.signature, timestamp: this.$route.query.timestamp };
    },

    copyCode() {
      navigator.clipboard?.writeText(this.tracking.code).then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 1600);
      });
    },

    saveAddress(info) {
      this.address_sheet = false;
      this.busy_address = true;
      axios
        .put(window.XAPI.PUT_ORDER_EDIT_RECEIVER_INFO(this.$shop.name, this.$route.params.basket_id), {
          receiver_info: info,
          code: this.basket.code /* guest */,
          ...this.signed(),
        })
        .then(({ data }) => {
          if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);
          this.basket.receiver_info = data.receiver_info;
          NotificationService.showSuccessAlert(null, "The new address is saved.");
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_address = false));
    },

    openBilling() {
      this.same_billing = !this.billing.custom;
      this.billing_name = this.billing.name || "";
      this.billing_address = this.billing.address || "";
      this.edit_billing = true;
    },
    saveBilling() {
      this.busy_billing = true;
      axios
        .put(window.XAPI.PUT_ORDER_EDIT_BILLING(this.$shop.name, this.$route.params.basket_id), {
          custom: !this.same_billing,
          name: this.billing_name,
          address: this.billing_address,
          ...this.signed(),
        })
        .then(({ data }) => {
          if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);
          this.basket.billing = data.billing;
          this.edit_billing = false;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_billing = false));
    },

    confirmReceived() {
      this.busy_receive = true;
      axios
        .post(window.XAPI.POST_ORDER_BASKET_CONFIRM_RECEIVED(this.$shop.name, this.$route.params.basket_id), this.signed())
        .then(({ data }) => {
          if (data.error) return NotificationService.showErrorAlert(null, data.error_msg);
          this.basket.delivery_state = data.delivery_state;
          NotificationService.showSuccessAlert(null, "Thanks, the shop knows your order reached you.");
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy_receive = false));
    },
  },
};
</script>
