<!--
  Kalio — "Where should it go?" (the basket page's address).

  A quiet map in the shop's colours with a pin that stays in the middle:
  the shopper moves the map, the address under the pin fills the form.
  A search box finds a street, "Use my location" asks the browser, and a
  signed-in shopper's saved addresses sit above the form. Beside the map
  every field Selldone keeps for an address: street, building, unit, name,
  phone, city, county, postcode, country and a note for the seller. On a
  phone the map sits on top and the form below it.

  It replaces Selldone's full-screen map (UMapView) on the basket page and
  uses the same pieces: the Mapbox wrapper, the address lookups
  (ADDRESS_API.GET_GEO_TO_ADDRESS, GET_AUTOCOMPLETE, GET_MY_ADDRESSES) and
  the same receiver_info fields, which the page saves as before
  (onClickSetLocation). When the shop has no map, the form stands alone.
  Design: ../kalio-design/basket-flow-options/ (4 November 2026).
-->
<template>
  <v-dialog
    :fullscreen="phone"
    :model-value="modelValue"
    :transition="phone ? 'dialog-bottom-transition' : 'dialog-transition'"
    content-class="k-sheet-host"
    max-width="980"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="k-sheet k-addr">
      <div class="k-sheet__head">
        <div>
          <h2>{{ heading }}</h2>
          <p>{{ lede }}</p>
        </div>
        <button aria-label="Close" class="k-sheet__x" type="button" @click="$emit('update:modelValue', false)">
          <v-icon>close</v-icon>
        </button>
      </div>

      <div :class="{ '-nomap': noMap }" class="k-addr__grid">
        <!-- The map, with the pin in the middle -->
        <div v-if="!noMap" class="k-addr__map">
          <div ref="canvas" class="k-addr__canvas"></div>
          <div class="k-addr__search">
            <v-icon size="20">search</v-icon>
            <input
              v-model="query"
              aria-label="Search a street or a place"
              autocomplete="off"
              placeholder="Search a street or a place"
              type="search"
              @input="onQuery"
              @keydown.enter.prevent="pickFirst"
            />
            <v-progress-circular v-if="busy_search" indeterminate size="16" width="2" />
          </div>
          <ul v-if="results.length" class="k-addr__results" role="listbox">
            <li v-for="(item, i) in results" :key="i">
              <button type="button" @click="pickResult(item)">
                <v-icon size="18">place</v-icon>
                <span><b>{{ item.title || item.address }}</b><small>{{ resultLine(item) }}</small></span>
              </button>
            </li>
          </ul>
          <span aria-hidden="true" class="k-addr__shadow"></span>
          <div class="k-addr__pin">
            <span v-if="bubble" class="k-addr__bubble">{{ bubble }}</span>
            <svg
              aria-label="Use the address under the pin"
              height="56"
              role="button"
              tabindex="0"
              viewBox="0 0 44 56"
              width="44"
              @click="pinHere"
              @keydown.enter="pinHere"
            >
              <path d="M22 55S3 34 3 21a19 19 0 0 1 38 0c0 13-19 34-19 34z" fill="#0e3f2e" />
              <circle cx="22" cy="21" fill="#fff" r="8" />
              <circle cx="22" cy="21" fill="#3baa5c" r="3.6" />
            </svg>
          </div>
          <button :disabled="busy_locate" class="k-addr__locate" type="button" @click="locate">
            <v-progress-circular v-if="busy_locate" indeterminate size="16" width="2" />
            <v-icon v-else size="18">my_location</v-icon>
            Use my location
          </button>
          <span class="k-addr__zoom">
            <button aria-label="Zoom in" type="button" @click="map && map.zoomIn()"><v-icon size="20">add</v-icon></button>
            <button aria-label="Zoom out" type="button" @click="map && map.zoomOut()"><v-icon size="20">remove</v-icon></button>
          </span>
        </div>

        <!-- The form -->
        <div class="k-addr__form">
          <div v-if="noMap" class="k-addr__search -inline">
            <v-icon size="20">search</v-icon>
            <input
              v-model="query"
              aria-label="Search your address"
              autocomplete="off"
              placeholder="Search your address"
              type="search"
              @input="onQuery"
              @keydown.enter.prevent="pickFirst"
            />
          </div>
          <ul v-if="noMap && results.length" class="k-addr__results -inline" role="listbox">
            <li v-for="(item, i) in results" :key="i">
              <button type="button" @click="pickResult(item)">
                <v-icon size="18">place</v-icon>
                <span><b>{{ item.title || item.address }}</b><small>{{ resultLine(item) }}</small></span>
              </button>
            </li>
          </ul>

          <div v-if="book.length" class="k-addr__book">
            <span class="k-addr__label">Saved</span>
            <button
              v-for="saved in book"
              :key="saved.id"
              :class="{ '-on': saved.address === form.address }"
              class="k-addr__saved"
              type="button"
              @click="useSaved(saved)"
            >
              <v-icon size="16">bookmark_border</v-icon>{{ saved.title || saved.address }}
            </button>
          </div>

          <div v-if="!noMap" :class="{ '-empty': !form.address }" class="k-addr__found">
            <span class="k-addr__found-ico">
              <v-progress-circular v-if="busy_geo" indeterminate size="18" width="2" />
              <v-icon v-else size="20">place</v-icon>
            </span>
            <span>
              <b>{{ form.address || "No address yet" }}</b>
              <small>{{ form.address ? "Where the pin is. You can edit the details below." : "Tap the map where it should go, or search above." }}</small>
            </span>
          </div>

          <label class="k-addr__field -wide">
            <span>Street address <em>*</em></span>
            <input v-model.trim="form.address" autocomplete="street-address" placeholder="Street and number" type="text" />
          </label>
          <div class="k-addr__two">
            <label class="k-addr__field">
              <span>Building</span>
              <input v-model.trim="form.no" placeholder="No." type="text" />
            </label>
            <label class="k-addr__field">
              <span>Unit</span>
              <input v-model.trim="form.unit" placeholder="Apt, floor" type="text" />
            </label>
          </div>
          <div class="k-addr__two">
            <label class="k-addr__field">
              <span>Full name</span>
              <input v-model.trim="form.name" autocomplete="name" placeholder="Who receives it" type="text" />
            </label>
            <label :class="{ '-error': tried && !form.phone }" class="k-addr__field">
              <span>Phone <em>*</em></span>
              <input v-model.trim="form.phone" autocomplete="tel" inputmode="tel" placeholder="For the courier" type="tel" />
            </label>
          </div>
          <div class="k-addr__two">
            <label class="k-addr__field">
              <span>City</span>
              <input v-model.trim="form.city" autocomplete="address-level2" placeholder="City" type="text" />
            </label>
            <label class="k-addr__field">
              <span>County or state</span>
              <input v-model.trim="form.state" autocomplete="address-level1" placeholder="County" type="text" />
            </label>
          </div>
          <div class="k-addr__two">
            <label class="k-addr__field">
              <span>Postcode</span>
              <input v-model.trim="form.postal" autocomplete="postal-code" placeholder="Postcode" type="text" />
            </label>
            <label class="k-addr__field">
              <span>Country</span>
              <select v-model="form.country" autocomplete="country">
                <option v-for="country in countryList" :key="country.code" :value="country.code">{{ country.name }}</option>
              </select>
            </label>
          </div>
          <label class="k-addr__field -wide">
            <span>Note for the seller</span>
            <textarea v-model="form.message" placeholder="Gate code, landmark… (optional)" rows="2"></textarea>
          </label>
        </div>
      </div>

      <div class="k-sheet__foot">
        <p v-if="tried && missing" class="k-addr__missing"><v-icon size="16">error_outline</v-icon>{{ missing }}</p>
        <button class="k-sheet__ghost" type="button" @click="$emit('update:modelValue', false)">Cancel</button>
        <button class="k-sheet__go" type="button" @click="save">Save address</button>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import Mapbox from "@selldone/components-vue/ui/map/providers/mapbox/MapBox";
import { Countries } from "@selldone/core-js/models/general/country/country.model";

/* Streets in colour: a shopper finds their door by the parks, the water
   and the road colours (the light style read as a grey, broken map). */
const MAP_STYLE = "mapbox://styles/mapbox/streets-v12";
/* Below this zoom the pin covers a whole district, not a door. */
const ZOOM_ADDRESS = 13;
const ZOOM_STREET = 16;

function blank() {
  return { address: "", no: "", unit: "", name: "", phone: "", city: "", state: "", postal: "", country: null, message: "" };
}

export default {
  name: "KalioAddressSheet",

  props: {
    modelValue: Boolean,
    /** The basket's receiver_info. */
    receiverInfo: { type: Object, default: null },
    /** Where to start when the basket has no location yet. */
    center: { type: Object, default: null },
    noMap: Boolean,
    /** The shop's countries; all when empty. */
    countries: { type: Array, default: null },
    heading: { type: String, default: "Where should it go?" },
    lede: { type: String, default: "Your address, for the receipt and the seller." },
  },

  emits: ["update:modelValue", "save"],

  data() {
    return {
      form: blank(),
      location: null,
      moved: false,
      tried: false,
      query: "",
      results: [],
      book: [],
      busy_geo: false,
      zoomed_out: false,
      busy_search: false,
      busy_locate: false,
    };
  },

  computed: {
    phone() {
      return this.$vuetify.display.xs;
    },
    countryList() {
      if (this.countries?.length) {
        const allowed = new Set(this.countries.map((c) => (typeof c === "string" ? c : c.code || c.alpha2)));
        return Countries.filter((c) => allowed.has(c.code));
      }
      return Countries;
    },
    bubble() {
      if (this.zoomed_out) return "Zoom in to place the pin";
      if (!this.form.address) return "Tap the map where it should go";
      return null;
    },
    missing() {
      if (!this.noMap && !this.location) return "Place the pin on the map.";
      if (!this.form.address) return "Add the street address.";
      if (!this.form.phone) return "Add a phone number.";
      return null;
    },
  },

  watch: {
    modelValue(open) {
      if (open) this.start();
    },
  },

  beforeUnmount() {
    clearTimeout(this.geoTimer);
    clearTimeout(this.searchTimer);
    if (this.map) this.map.remove();
    this.map = null;
  },

  methods: {
    /* Each time the sheet opens: the form from the basket, the map where
       the basket's address is (or where the shopper is). */
    start() {
      const info = this.receiverInfo || {};
      this.form = Object.assign(blank(), {
        address: info.address || "",
        no: info.no || "",
        unit: info.unit || "",
        name: info.name || "",
        phone: info.phone || this.USER()?.phone || "",
        city: info.city || "",
        state: info.state || "",
        postal: info.postal || "",
        country: info.country || this.guessCountry(),
        message: info.message || "",
      });
      this.location = info.location?.lat ? { lat: info.location.lat, lng: info.location.lng } : null;
      this.moved = false;
      this.tried = false;
      this.query = "";
      this.results = [];
      if (this.USER()) this.loadBook();
      if (!this.noMap) this.$nextTick(() => setTimeout(this.mountMap, 60));
    },

    /* A first guess at the country, until the map or the search tells:
       the browser's region (en-US → US), if the shop ships there. */
    guessCountry() {
      let region = null;
      try {
        region = new Intl.Locale(navigator.language || "en-US").maximize().region;
      } catch (e) {
        region = null;
      }
      if (region && this.countryList.some((c) => c.code === region)) return region;
      return this.countryList.length === 1 ? this.countryList[0].code : null;
    },

    mountMap() {
      const el = this.$refs.canvas;
      if (!el) return;
      const at = this.location || (this.center?.lat ? this.center : null);
      if (this.map && this.map.getContainer() === el) {
        this.map.resize();
        if (at) this.map.jumpTo({ center: [at.lng, at.lat], zoom: ZOOM_STREET });
        return;
      }
      if (this.map) this.map.remove();
      this.map = new Mapbox.Map({
        container: el,
        style: MAP_STYLE,
        center: at ? [at.lng, at.lat] : [-40, 30],
        zoom: at ? ZOOM_STREET : 1.4,
        attributionControl: false,
      });
      this.map.addControl(new Mapbox.AttributionControl({ compact: true }), "bottom-right");
      this.map.on("dragstart", () => (this.moved = true));
      this.map.on("zoomstart", (e) => {
        if (e.originalEvent) this.moved = true;
      });
      /* A tap on the map takes the pin there. */
      this.map.on("click", (e) => {
        this.moved = true;
        this.map.flyTo(
          { center: e.lngLat, zoom: Math.max(this.map.getZoom(), ZOOM_STREET - 1), essential: true },
          { byKalio: true },
        );
      });
      this.map.on("moveend", (e) => {
        this.zoomed_out = this.map.getZoom() < ZOOM_ADDRESS;
        if (!this.moved && !e.byKalio) return;
        if (this.zoomed_out) return; // a whole district is not an address
        const c = this.map.getCenter();
        this.location = { lat: c.lat, lng: c.lng };
        if (!e.keepText) this.lookUp(c);
      });
      this.map.on("load", () => (this.zoomed_out = this.map.getZoom() < ZOOM_ADDRESS));
      if (!at && !this.location) this.locate(true);
    },

    /* The address under the pin (Selldone's reverse lookup). */
    lookUp(c) {
      clearTimeout(this.geoTimer);
      this.geoTimer = setTimeout(() => {
        this.busy_geo = true;
        window.axios
          .get(window.ADDRESS_API.GET_GEO_TO_ADDRESS(), {
            params: { lat: c.lat, lon: c.lng, local: this.getCurrentLanguage?.()?.locale },
          })
          .then(({ data }) => {
            if (!data || data.error || !data.address) return;
            // One place, all of it: no street from here with a postcode from there.
            this.form.address = data.address;
            this.form.city = data.city || "";
            this.form.state = data.state || "";
            this.form.postal = data.postal || "";
            if (data.no) this.form.no = data.no;
            if (data.country && this.countryList.some((x) => x.code === data.country)) this.form.country = data.country;
          })
          .catch(() => {})
          .finally(() => (this.busy_geo = false));
      }, 450);
    },

    onQuery() {
      clearTimeout(this.searchTimer);
      if (!this.query || this.query.length < 4) {
        this.results = [];
        return;
      }
      this.searchTimer = setTimeout(this.search, 600);
    },

    /* Streets and places as the shopper types (Selldone's autocomplete). */
    search() {
      const c = this.map?.getCenter?.();
      this.busy_search = true;
      window.axios
        .get(window.ADDRESS_API.GET_AUTOCOMPLETE(), {
          params: {
            text: this.query,
            lat: c?.lat,
            lon: c?.lng,
            local: this.getCurrentLanguage?.()?.locale,
            countries: this.countries?.length ? this.countryList.map((x) => x.code).join(",") : undefined,
          },
        })
        .then(({ data }) => {
          this.results = (data && !data.error && data.list) || [];
        })
        .catch(() => (this.results = []))
        .finally(() => (this.busy_search = false));
    },

    resultLine(item) {
      return [item.city, item.state, item.postal, item.country].filter(Boolean).join(", ");
    },

    pickFirst() {
      if (this.results.length) this.pickResult(this.results[0]);
    },

    pickResult(item) {
      Object.assign(this.form, {
        address: item.address || item.title || this.form.address,
        city: item.city || "",
        state: item.state || "",
        postal: item.postal || "",
      });
      if (item.country && this.countryList.some((x) => x.code === item.country)) this.form.country = item.country;
      const [lng, lat] = item.geometry?.coordinates || [];
      if (lat && lng) this.goTo({ lat, lng }, true);
      this.results = [];
      this.query = "";
    },

    /* The pin itself: the address under it, now (zooming in first when the
       map shows a whole district). */
    pinHere() {
      if (!this.map) return;
      this.moved = true;
      if (this.map.getZoom() < ZOOM_ADDRESS) {
        this.map.flyTo({ center: this.map.getCenter(), zoom: ZOOM_STREET, essential: true }, { byKalio: true });
        return;
      }
      const c = this.map.getCenter();
      this.location = { lat: c.lat, lng: c.lng };
      this.lookUp(c);
    },

    /* Move the map to a point; keepText leaves the form's address alone. */
    goTo(point, keepText = false) {
      this.location = { lat: point.lat, lng: point.lng };
      this.moved = true;
      if (this.map) this.map.flyTo({ center: [point.lng, point.lat], zoom: ZOOM_STREET, essential: true, maxDuration: 1600 }, { byKalio: true, keepText });
    },

    locate(quiet = false) {
      if (!navigator.geolocation) return;
      this.busy_locate = !quiet;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.busy_locate = false;
          this.goTo({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        () => (this.busy_locate = false),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    },

    loadBook() {
      window.axios
        .get(window.ADDRESS_API.GET_MY_ADDRESSES())
        .then(({ data }) => {
          this.book = (data && !data.error && data.addresses) || [];
        })
        .catch(() => (this.book = []));
    },

    useSaved(saved) {
      Object.assign(this.form, {
        address: saved.address || "",
        no: saved.no || "",
        unit: saved.unit || "",
        name: saved.name || this.form.name,
        phone: saved.phone || this.form.phone,
        city: saved.city || "",
        state: saved.state || "",
        postal: saved.postal || "",
        country: saved.country || this.form.country,
        message: saved.message || "",
      });
      if (saved.location?.lat) this.goTo(saved.location, true);
    },

    save() {
      this.tried = true;
      if (this.missing) return;
      const before = this.receiverInfo || {};
      this.$emit("save", {
        ...before,
        ...this.form,
        // Selldone's state code belongs to the state it came with.
        state_code: this.form.state === before.state && this.form.country === before.country ? before.state_code : null,
        location: this.location ? { lat: this.location.lat, lng: this.location.lng } : this.receiverInfo?.location,
      });
    },
  },
};
</script>
