<!--
  Besti — the theme picker in the header (1.0.10 trial: the owner asked to
  see the switcher at the top right instead of in the footer).

  A "Theme" action like Track order / Saved / Sign in (icon only on a phone
  and under 1280px, as they are), just before the cart pill. A click opens a
  small panel under it: the five palettes, each a swatch with its name, and
  Light / Dark. No scrim; it closes on a second click, on Esc and on a click
  outside, and Tab walks from the button into it. The panel is placed under
  the button inside the header: right-aligned to the button (never past the
  right edge) on a wide screen, 12px from both sides on a phone.
  Every change is instant and kept in this browser (besti-theme.ts).
-->
<template>
  <div ref="root" class="b-theme">
    <button
      ref="btn"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="b-theme-pop"
      aria-haspopup="dialog"
      aria-label="Theme"
      class="b-act -theme"
      title="Theme"
      type="button"
      @click="toggle"
    >
      <span class="ms">palette</span><span class="b-act__t">Theme</span>
    </button>
    <div v-if="open" id="b-theme-pop" :style="pos" aria-label="Theme" class="b-theme__pop" role="dialog" @keydown.esc.stop="close(true)">
      <p class="b-theme__t">Colour</p>
      <div class="b-theme__pals" role="group" aria-label="Colour">
        <button
          v-for="p in palettes"
          :key="p.id"
          :aria-label="p.name"
          :aria-pressed="theme.palette === p.id ? 'true' : 'false'"
          :class="{ '-on': theme.palette === p.id }"
          :title="p.name"
          class="b-tpick"
          type="button"
          @click="setPalette(p.id)"
        >
          <span :style="{ '--sw': p.primary }" class="b-tpick__sw"></span>
          <span class="b-tpick__n">{{ p.name }}</span>
        </button>
      </div>
      <p class="b-theme__t">Mode</p>
      <div aria-label="Light or dark" class="b-theme__modes" role="group">
        <button :aria-pressed="theme.mode === 'light' ? 'true' : 'false'" :class="{ '-on': theme.mode === 'light' }" type="button" @click="setMode('light')">
          <span class="ms">light_mode</span>Light
        </button>
        <button :aria-pressed="theme.mode === 'dark' ? 'true' : 'false'" :class="{ '-on': theme.mode === 'dark' }" type="button" @click="setMode('dark')">
          <span class="ms">dark_mode</span>Dark
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { PALETTES, setMode, setPalette, theme } from "../besti-theme";

export default {
  name: "BestiThemePicker",

  data: () => ({ open: false, pos: {}, theme, palettes: PALETTES }),

  beforeUnmount() {
    this.unbind();
  },

  methods: {
    setPalette,
    setMode,
    toggle() {
      if (this.open) this.close(false);
      else this.show();
    },
    show() {
      this.place();
      this.open = true;
      this.onDown = (e) => {
        if (!this.$refs.root?.contains(e.target)) this.close(false);
      };
      this.onKey = (e) => {
        if (e.key === "Escape") this.close(true);
      };
      this.onResize = () => this.place();
      document.addEventListener("mousedown", this.onDown, true);
      document.addEventListener("touchstart", this.onDown, { capture: true, passive: true });
      document.addEventListener("keydown", this.onKey);
      window.addEventListener("resize", this.onResize, { passive: true });
    },
    close(refocus) {
      this.open = false;
      this.unbind();
      if (refocus) this.$refs.btn?.focus();
    },
    unbind() {
      if (this.onDown) {
        document.removeEventListener("mousedown", this.onDown, true);
        document.removeEventListener("touchstart", this.onDown, { capture: true });
      }
      if (this.onKey) document.removeEventListener("keydown", this.onKey);
      if (this.onResize) window.removeEventListener("resize", this.onResize);
      this.onDown = this.onKey = this.onResize = null;
    },
    /* Under the button, inside the header (its positioned box): right edges
       lined up on a wide screen, 12px from each side on a phone. */
    place() {
      const btn = this.$refs.btn;
      const header = btn?.closest(".b-header");
      if (!btn || !header) return;
      const b = btn.getBoundingClientRect();
      const h = header.getBoundingClientRect();
      const top = Math.round(b.bottom - h.top + 8) + "px";
      if (window.innerWidth < 600) this.pos = { top, left: "12px", right: "12px" };
      else this.pos = { top, right: Math.max(12, Math.round(h.right - b.right)) + "px", width: "336px" };
    },
  },
};
</script>
