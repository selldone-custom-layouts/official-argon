<!--
  Kalio — a card's quantity in the basket.

  Once a product without sizes is in the basket, its card's "+" becomes
  "− n +": each "+" adds one more, "−" takes one away, and at one "−" takes
  the product out and the "+" comes back. Laid over the card's picture by
  kalio-card-basket.ts (the card is Selldone's), or set inline in a shelf
  label. A product with sizes keeps its "+", which opens the sheet.

  The count changes the moment it is tapped and the basket follows
  (stepTo in kalio-basket.ts), so quick taps add up. It shows "1" as soon
  as the card's "+" is pressed, before the server has answered.
-->
<template>
  <div
    v-if="line && shown > 0"
    :class="{ '-busy': busy, '-inline': inline }"
    aria-label="Quantity in basket"
    class="k-card-step"
    role="group"
    @click.prevent.stop
  >
    <button
      :aria-label="shown > 1 ? 'One fewer' : 'Remove from basket'"
      type="button"
      @click.prevent.stop="step(-1)"
    >
      <v-icon :size="inline ? 18 : 20">{{ shown > 1 ? "remove" : "delete_outline" }}</v-icon>
    </button>
    <output aria-live="polite" class="k-card-step__count">
      {{ shown }}<small v-if="!inline">in basket</small>
    </output>
    <button aria-label="One more" type="button" @click.prevent.stop="step(1)">
      <v-icon :size="inline ? 18 : 20">add</v-icon>
    </button>
  </div>
</template>

<script>
import { basketLine, hasSizes, pendingLine, settling, shownCount, stepTo } from "./kalio-basket";

export default {
  name: "KalioCardStep",

  props: {
    product: { type: Object, required: true },
    /** In a shelf label rather than over a card's picture. */
    inline: Boolean,
  },

  computed: {
    line() {
      if (hasSizes(this.product)) return null;
      return basketLine(this, this.product) || pendingLine(this.product);
    },
    shown() {
      return shownCount(this.product, this.line);
    },
    busy() {
      return settling(this.product, this.line);
    },
  },

  methods: {
    step(delta) {
      if (!this.line) return;
      stepTo(this, this.product, this.line, this.shown + delta);
    },
  },
};
</script>
