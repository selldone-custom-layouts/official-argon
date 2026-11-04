<!--
  Kalio — an order's receipt and how it is paid (4 November 2026).

  One card for the money: what the order costs, line by line as Selldone
  counts it (the items before discounts, what the sellers took off, any
  discount code, coupon, club or prize, delivery, tax, the wallet), the
  total, and below it how it is paid: by card with the date, cash to the
  courier, cash at the shop, a bank transfer, or not yet, with "Pay now"
  and "Use another way to pay" while an online payment waits. It replaces
  Selldone's payment table (SShopCustomerOrderPaymentWidget) on the order
  page; a bank transfer's details and receipt upload stay Selldone's own
  (SShopRowCustomerPendingPayment) in the page's main column.
-->
<template>
  <div class="k-cart__receipt k-order__receipt">
    <p class="k-eyebrow">{{ paidWord }} · {{ units }} {{ units === 1 ? "item" : "items" }}</p>
    <div class="k-cart__top">
      <p class="k-cart__total"><u-price :amount="total" :currency="basket.currency" /></p>
      <span :class="`-${tone}`" class="k-order__pill">{{ pillWord }}</span>
    </div>

    <div class="k-cart__rows">
      <p class="k-cart__row"><span>Items ({{ units }})</span><u-price :amount="itemsBefore" :currency="basket.currency" /></p>
      <p v-if="saved >= 0.01" class="k-cart__row -save">
        <span>You saved</span><span>−<u-price :amount="saved" :currency="basket.currency" /></span>
      </p>
      <p v-for="row in promoRows" :key="row.key" class="k-cart__row -save">
        <span>{{ row.label }}</span><span>−<u-price :amount="row.amount" :currency="basket.currency" /></span>
      </p>
      <p v-if="prizeProduct" class="k-cart__row -save">
        <span>Prize</span><span class="k-opay__prize">{{ prizeProduct }}</span>
      </p>
      <p :class="{ '-free': basket.delivery_price === 0 }" class="k-cart__row">
        <span>Delivery</span>
        <u-price v-if="basket.delivery_price > 0" :amount="basket.delivery_price" :currency="basket.currency" />
        <span v-else-if="basket.delivery_price === 0">Free</span>
        <span v-else>Paid on delivery</span>
      </p>
      <p v-if="basket.tax > 0" class="k-cart__row">
        <span>Tax{{ basket.tax_included ? " (included)" : "" }}</span><u-price :amount="basket.tax" :currency="basket.currency" />
      </p>
      <p v-if="basket.tax_shipping > 0" class="k-cart__row">
        <span>Tax on delivery</span><u-price :amount="basket.tax_shipping" :currency="basket.currency" />
      </p>
      <p v-if="walletPaid > 0" class="k-cart__row -save">
        <span>From your wallet</span><span>−<u-price :amount="walletPaid" :currency="basket.currency" /></span>
      </p>
    </div>

    <!-- How it is paid -->
    <div :class="`-${pay.tone}`" class="k-opay">
      <div class="k-opay__head">
        <span aria-hidden="true" class="k-opay__logo">
          <img v-if="pay.logo" :src="pay.logo" alt="" height="26" width="26" />
          <v-progress-circular v-else-if="pay.tone === 'busy'" indeterminate size="20" width="2" />
          <v-icon v-else size="20">{{ pay.icon }}</v-icon>
        </span>
        <span class="k-opay__words">
          <b>{{ pay.title }}</b>
          <small v-if="pay.note">{{ pay.note }}</small>
        </span>
        <span v-if="pay.test" class="k-opay__test">Test</span>
      </div>

      <u-payment-card
        v-if="basket.payment?.card"
        :card="basket.payment.card"
        :currency="basket.payment.currency"
        :method="basket.payment.method"
        class="k-opay__card"
        horizontal
      />

      <p v-for="card in basket.gift_cards || []" :key="card.number" class="k-opay__also">
        <v-icon size="16">card_giftcard</v-icon>
        Gift card {{ lastFour(card.number) }}<u-price :amount="card.amount" :currency="card.currency" />
      </p>

      <div v-if="pay.canPay || pay.canSwitch" class="k-opay__acts">
        <button v-if="pay.canPay" class="k-opay__go" type="button" @click="payNow">
          <v-icon size="18">lock</v-icon>Pay now
        </button>
        <button v-if="pay.canSwitch" class="k-opay__alt" type="button" @click="switchWay">Use another way to pay</button>
      </div>
    </div>

    <p v-if="basket.cashback_order" class="k-opay__back">
      <v-icon size="18">savings</v-icon>
      <span>
        <u-price :amount="basket.cashback_order.amount_cashback" :currency="basket.cashback_order.currency" /> comes back to you
        <template v-if="basket.cashback_order.cashback?.title"> with {{ basket.cashback_order.cashback.title }}</template>.
      </span>
    </p>
  </div>
</template>

<script lang="ts">
import UPaymentCard from "@selldone/components-vue/ui/payment/card/UPaymentCard.vue";
import { PriceHelper } from "@selldone/core-js";

const sum = (list, pick) => (list || []).reduce((total, item) => total + (pick(item) || 0), 0);

export default {
  name: "KalioOrderReceipt",
  components: { UPaymentCard },

  props: {
    basket: { type: Object, required: true },
  },

  computed: {
    /** ok: paid or paying on delivery · wait: not paid yet · off: cancelled */
    tone() {
      const status = this.basket?.status;
      if (status === "Canceled") return "off";
      if (status === "Payed" || status === "COD") return "ok";
      return "wait";
    },
    cod() {
      return this.basket?.status === "COD";
    },
    paidWord() {
      return { ok: this.cod ? "To pay on delivery" : "Paid", wait: "To pay", off: "Cancelled" }[this.tone];
    },
    pillWord() {
      return { ok: this.cod ? "On delivery" : "Paid", wait: "Waiting", off: "Cancelled" }[this.tone];
    },
    units() {
      return sum(this.basket?.items, (item) => item.count);
    },

    // The rows, as Selldone counts them (SShopCustomerOrderPaymentWidget):
    // price is after every discount and the wallet, with delivery in it.
    walletPaid() {
      return this.basket?.wallet_transaction?.amount || 0;
    },
    deliveryPaid() {
      return this.basket?.delivery_price > 0 ? this.basket.delivery_price : 0;
    },
    itemsBefore() {
      const b = this.basket || {};
      return this.fix((b.price || 0) + this.walletPaid + (b.discount || 0) - this.deliveryPaid);
    },
    promoRows() {
      const b = this.basket || {};
      const rows = [];
      if (b.discount_order?.amount_discount)
        rows.push({ key: "code", label: b.discount_order.discount_code?.title ? `Code · ${b.discount_order.discount_code.title}` : "Discount code", amount: b.discount_order.amount_discount });
      if (b.coupon_order?.amount_discount)
        rows.push({ key: "coupon", label: b.coupon_order.coupon?.title ? `Coupon · ${b.coupon_order.coupon.title}` : "Coupon", amount: b.coupon_order.amount_discount });
      if (b.club_order?.amount_discount) rows.push({ key: "club", label: "Members' price", amount: b.club_order.amount_discount });
      if (b.lottery_order?.amount_discount) rows.push({ key: "prize", label: "Prize", amount: b.lottery_order.amount_discount });
      return rows;
    },
    prizeProduct() {
      const prize = this.basket?.lottery_order;
      return prize && !prize.amount_discount && prize.product ? prize.product.title : null;
    },
    /** What the sellers took off: item discounts, offers and bundles. */
    saved() {
      const promos = sum(this.promoRows, (row) => row.amount);
      return this.fix(Math.max(0, (this.basket?.discount || 0) - promos));
    },
    total() {
      const b = this.basket || {};
      return this.fix((b.price || 0) + (b.tax_included ? 0 : b.tax || 0) + (b.tax_shipping || 0));
    },

    /** The payment still open, latest first. */
    pending() {
      const list = this.basket?.transactions_pending || [];
      return list.length ? list[list.length - 1] : null;
    },
    /** How the order is paid, in words. */
    pay() {
      const b = this.basket || {};
      const money = (amount, currency) => this.money(amount, currency || b.currency);
      const t = this.pending;
      const arrived = b.delivery_state === "ToCustomer";
      const onDelivery = (amount) => (arrived ? `${amount} in cash to the courier.` : `Pay the courier ${amount} when your order arrives.`);
      const out = { tone: "wait", icon: "schedule", logo: null, title: "Not paid yet", note: null, test: false, canPay: false, canSwitch: false };

      if (b.status === "Canceled" && !b.payment) return { ...out, tone: "off", icon: "block", title: "Cancelled", note: "Nothing to pay for this order." };

      if (b.payment && b.status === "Payed") {
        const p = b.payment;
        const at = p.payment_at || p.created_at;
        return {
          ...out,
          tone: "ok",
          icon: "check",
          logo: p.gateway?.icon ? this.getShopImagePath(p.gateway.icon) : null,
          title: `Paid with ${p.gateway?.name || "card"}`,
          note: [money(p.amount, p.currency), at ? this.when(at) : null].filter(Boolean).join(" · "),
          test: p.livemode === false,
        };
      }
      if (!t) return b.status === "COD" ? { ...out, tone: "ok", icon: "payments", title: "Cash on delivery", note: onDelivery(money(this.total)) } : out;

      const logo = t.icon || t.logo ? this.getShopImagePath(t.icon || t.logo) : null;
      if (t.cod)
        return { ...out, tone: "ok", logo, icon: "payments", title: t.name || "Cash on delivery", note: onDelivery(money(t.amount, t.currency)), test: t.livemode === false };
      if (t.cash) return { ...out, tone: "ok", logo, icon: "payments", title: t.name || "Cash", note: `Pay ${money(t.amount, t.currency)} in cash when you collect it.`, test: t.livemode === false };
      if (t.dir) {
        const sent = t.status === "Processing";
        return { ...out, tone: sent ? "busy" : "wait", logo: sent ? null : logo, title: t.name || "Bank transfer", note: sent ? "Your receipt is in. The shop is checking the transfer." : `Send ${money(t.amount, t.currency)} with the details on this page, then add the receipt.`, test: t.livemode === false };
      }
      if (t.status === "Processing") return { ...out, tone: "busy", title: "Checking your payment", note: `${t.name} · ${money(t.amount, t.currency)}` };
      if (t.status === "Canceled") return { ...out, tone: "off", logo, icon: "error", title: "The payment did not go through", note: `${t.name} · ${money(t.amount, t.currency)}` };
      if (t.expired) return { ...out, logo, title: "This payment has expired", note: `${t.name} · ${money(t.amount, t.currency)}. Message the shop below to pay another way.` };
      return { ...out, logo, title: `Waiting for payment`, note: `${t.name} · ${money(t.amount, t.currency)}`, test: t.livemode === false, canPay: true, canSwitch: true };
    },
  },

  methods: {
    fix(value) {
      return PriceHelper.FixPrecisionForCurrency(value, this.basket?.currency);
    },
    money(amount, currency) {
      try {
        return new Intl.NumberFormat(this.$i18n?.locale || "en", { style: "currency", currency: currency || "USD" }).format(amount || 0);
      } catch (e) {
        return `${amount} ${currency}`;
      }
    },
    when(at) {
      return new Date(at).toLocaleString(this.$i18n?.locale || "en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    },
    lastFour(number) {
      const digits = String(number || "").replace(/\D/g, "");
      return digits ? `•••• ${digits.slice(-4)}` : "";
    },
    payNow() {
      const t = this.pending;
      if (t) this.TryToPayOrder(t.gateway_code, t.id, this.$route.params.basket_id);
    },
    switchWay() {
      const t = this.pending;
      if (t) this.TryToPayOrder(t.gateway_code, t.id, this.$route.params.basket_id, true);
    },
  },
};
</script>
