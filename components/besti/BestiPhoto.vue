<!--
  Besti — a category's lifestyle photo, or a collage of its own products.

  The owner's photos (one per category, matched by the category's name slug,
  assets/besti/) fill the slot, cropped to it. A category without a photo
  shows up to four of its own product photos on white instead, one large and
  the others beside it, so a slot is never empty and never shows something
  the shop does not sell.
-->
<template>
  <div :class="['b-photo', { '-collage': !photo }]">
    <img v-if="photo" :alt="alt" :sizes="sizes" :src="photo.src" :srcset="photo.srcset || undefined" :loading="eager ? 'eager' : 'lazy'" class="b-photo__img" />
    <template v-else>
      <img
        v-for="(p, i) in shown"
        :key="p.id"
        :class="'-p' + i"
        :src="image(p)"
        :srcset="srcset(p)"
        alt=""
        class="b-photo__pack"
        loading="lazy"
        sizes="(max-width: 760px) 40vw, 260px"
        @error="dropSrcset"
      />
    </template>
  </div>
</template>

<script>
import { dropSrcset, productImage, productSrcset } from "../kalio/kalio-catalog";

export default {
  name: "BestiPhoto",
  props: {
    /** { src, srcset } from photoOf(), or null for the collage. */
    photo: { type: Object, default: null },
    alt: { type: String, default: "" },
    products: { type: Array, default: () => [] },
    sizes: { type: String, default: "100vw" },
    eager: Boolean,
  },
  computed: {
    shown() {
      return this.products.filter((p) => p && p.icon).slice(0, 4);
    },
  },
  methods: {
    dropSrcset,
    image(p) {
      return productImage(p);
    },
    srcset(p) {
      return productSrcset(p);
    },
  },
};
</script>
