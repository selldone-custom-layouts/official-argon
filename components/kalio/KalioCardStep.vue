<!--
  Kalio — a card's quantity in the basket.

  Once a product without sizes is in the basket, its card's "+" becomes
  "− n +": each "+" adds one more, "−" takes one away, and at one "−" takes
  the product out and the "+" comes back. Laid over the card's picture by
  kalio-card-basket.ts (the card is Selldone's), or set inline in a shelf
  label. A product with sizes keeps its "+", which opens the sheet.
-->
<template>
  <div
    v-if="line"
    :class="{ '-busy': busy, '-inline': inline }"
    aria-label="Quantity in basket"
    class="k-card-step"
    role="group"
    @click.prevent.stop
  >
    <button
      :aria-label="shown > 1 ? 'One fewer' : 'Remove from basket'"
      :disabled="busy"
      type="button"
      @click.prevent.stop="step(-1)"
    >
      <v-icon :size="inline ? 18 : 20">{{ shown > 1 ? "remove" : "delete_outline" }}</v-icon>
    </button>
    <output aria-live="polite" class="k-card-step__count">
      {{ shown }}<small v-if="!inline">in basket</small>
    </output>
    <button :disabled="busy" aria-label="One more" type="button" @click.prevent.stop="step(1)">
      <v-icon :size="inline ? 18 : 20">add</v-icon>
    </button>
  </div>
</template>

<script>
import { basketLine, hasSizes, setCount } from "./kalio-basket";

export default {
  name: "KalioCardStep",

  props: {
    product: { type: Object, required: true },
    /** In a shelf label rather than over a card's picture. */
    inline: Boolean,
  },

  data() {
    return {
      busy: false,
      pending: null,
    };
  },

  computed: {
    line() {
      return hasSizes(this.product) ? null : basketLine(this, this.product);
    },
    shown() {
      return this.pending ?? this.line?.count ?? 0;
    },
  },

  methods: {
    step(delta) {
      if (!this.line) return;
      const count = this.shown + delta;
      this.busy = true;
      this.pending = Math.max(count, 0);
      setCount(this, this.product, this.line, count)
        .catch(() => {})
        .finally(() => {
          this.busy = false;
          this.pending = null;
        });
    },
  },
};
</script>
