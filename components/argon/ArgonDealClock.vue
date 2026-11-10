<!--
  Argon — a deal's countdown.

  It is handed the deal's own end (argon.ts dealEnd: Selldone's PriceHelper
  rule, the chosen variant's dates when that variant has its own pricing)
  and counts on the page's one shared ticker (argon.ts tick), so a grid of
  cards never runs one interval each, and only this small piece re-renders
  every second. A deal with no end date, or one that has ended, shows
  nothing.

    line   — the quiet line on product cards: "Ends in 364d 23:15:07"
    strip  — the navy strip in the header: "Ends in 364d 23:15:07"
    blocks — the Deal of the Day: "Ends in" over days, hrs, min and sec
-->
<template>
  <span v-if="left && mode === 'line'" :title="title" class="ar-cd">
    <span class="ms">schedule</span><span class="ar-cd__w">Ends in </span><b>{{ left.text }}</b>
  </span>
  <span v-else-if="left && mode === 'strip'" :title="title" class="ar-strip__clock">Ends in <b>{{ left.text }}</b></span>
  <div v-else-if="left && mode === 'blocks'" :title="title" class="ar-cd-blocks">
    <em>Ends in</em>
    <div aria-live="off" class="ar-count" :class="{ '-days': left.d > 0 }">
      <span v-if="left.d"><b>{{ left.d }}</b>{{ left.d === 1 ? "day" : "days" }}</span><span><b>{{ left.h }}</b>hrs</span><span><b>{{ left.m }}</b>min</span><span><b>{{ left.s }}</b>sec</span>
    </div>
  </div>
</template>

<script>
import { startClock, tick, timeLeft } from "./argon";

export default {
  name: "ArgonDealClock",
  props: {
    /** The deal's end (a Date), or null for no clock. */
    end: { type: Date, default: null },
    mode: { type: String, default: "line" },
  },
  computed: {
    left() {
      return timeLeft(this.end, tick.now);
    },
    title() {
      return this.end ? `Deal ends ${this.end.toLocaleString()}` : null;
    },
  },
  mounted() {
    startClock();
  },
};
</script>
