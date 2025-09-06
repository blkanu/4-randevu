<template>
  <b-dropdown size="sm" :variant="variant" :text="text" class="w-100">
    <b-dropdown-form>
      <b-form-checkbox
        v-for="opt in options"
        :key="opt.value"
        v-model="localValue"
        :value="opt.value"
        class="mb-1"
      >
        {{ opt.text }}
      </b-form-checkbox>

      <div class="d-flex mt-2">
        <b-button size="sm" variant="outline-secondary" class="mr-2" @click="clearAll">Temizle</b-button>
        <b-button size="sm" variant="primary" @click="apply">Uygula</b-button>
      </div>
    </b-dropdown-form>
  </b-dropdown>
</template>

<script>
export default {
  name: "UiStatusMulti",
  props: {
    value: { type: Array, default: () => [] },        // v-model (seçili değerler)
    options: { type: Array, required: true },         // [{value:'Onaylandi', text:'Onaylandı'}, ...]
    text: { type: String, default: "Durumlar" },
    variant: { type: String, default: "outline-primary" },
    autoSelectAllOnMount: { type: Boolean, default: false },
  },
  data() {
    return {
      localValue: [...this.value],
    };
  },
  watch: {
    value(newVal) { this.localValue = [...newVal]; },
  },
  mounted() {
    if (this.autoSelectAllOnMount && (!this.value || this.value.length === 0)) {
      this.$emit("input", this.options.map(o => o.value));
    }
  },
  methods: {
    clearAll() {
      this.localValue = [];
    },
    apply() {
      this.$emit("input", [...this.localValue]);  // v-model update
      this.$emit("apply", this.localValue);       // opsiyonel: dinlemek isterseniz
    },
  },
};
</script>
