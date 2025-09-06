<template>
  <!-- Row içinde ikinci yarıyı (md=6) kaplar -->
  <b-col cols="12" md="6" class="mt-2 mt-md-0">
    <label class="filter-label d-block">{{ label }}</label>

    <div class="segmented flex-wrap">
      <b-button
        v-for="s in options"
        :key="s.value"
        :size="size"
        class="seg-btn mb-2 mr-2"
        :variant="isActive(s.value) ? activeVariant : inactiveVariant"
        :pressed="isActive(s.value)"
        @click="toggle(s.value)"
      >
        {{ s.text }}
      </b-button>

      <b-button
        v-if="showReset"
        :size="size"
        variant="outline-secondary"
        class="mb-2"
        @click="onReset"
      >
        {{ resetText }}
      </b-button>
    </div>
  </b-col>
</template>

<script>
export default {
  name: "UiStatusFilter",
  props: {
    // v-model (Array<string>)
    value: { type: Array, required: true },

    // [{ value: 'Beklemede', text:'Beklemede' }, ...]
    options: { type: Array, required: true },

    // Görünüm/UX
    label:           { type: String, default: "Durum" },
    size:            { type: String, default: "sm" },
    activeVariant:   { type: String, default: "primary" },
    inactiveVariant: { type: String, default: "outline-primary" },
    showReset:       { type: Boolean, default: true },
    resetText:       { type: String, default: "Sıfırla" },
  },
  computed: {
    allValues() {
      return this.options.map(o => o.value);
    },
  },
  methods: {
    isActive(v) {
      return Array.isArray(this.value) && this.value.includes(v);
    },
    toggle(v) {
      const next = this.isActive(v)
        ? this.value.filter(x => x !== v)
        : [...this.value, v];
      this.$emit("input", next);   // v-model
      this.$emit("change", next);  // opsiyonel
    },
    onReset() {
      const next = [...this.allValues];
      this.$emit("input", next);   // v-model reset
      this.$emit("reset");         // parent'ta ekstra sıfırlama istiyorsan dinleyebilirsin
    },
  },
};
</script>
