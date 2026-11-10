<!--
  Argon — one photo slot (argon-photos.ts): the photo when its file is in
  assets/photos/, else a calm placeholder of the same shape with a photo icon
  and the file's name, so the owner can see which file goes where.
  `place` is a slot name from SLOTS or a Slot object (trend / brand slots).
-->
<template>
  <div :class="{ '-empty': !src }" :style="{ '--ratio': String(info.ratio) }" class="ar-slot">
    <img v-if="src" :alt="alt" :src="src" :loading="eager ? 'eager' : 'lazy'" class="ar-slot__img" />
    <span v-else aria-hidden="true" class="ar-slot__ph">
      <span class="ms">image</span>
      <small>{{ info.file }}</small>
    </span>
  </div>
</template>

<script>
import { SLOTS, slotSrc } from "./argon-photos";

export default {
  name: "ArgonSlot",
  props: {
    place: { type: [String, Object], required: true },
    alt: { type: String, default: "" },
    eager: Boolean,
  },
  computed: {
    info() {
      return typeof this.place === "string" ? SLOTS[this.place] || { file: `${this.place}.webp`, ratio: 1 } : this.place;
    },
    src() {
      return slotSrc(this.info);
    },
  },
};
</script>
