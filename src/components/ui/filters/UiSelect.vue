<!-- src/components/ui/UiSelect.vue -->
<template>
  <div :class="wrapperClass">
    <label v-if="label" :for="id" class="filter-label">{{ label }}</label>

    <b-input-group v-if="clearable" size="sm">
      <b-form-select
        :id="id"
        v-model="internalValue"
        :options="normalizedOptions"
        :size="size"
        :disabled="disabled"
        :text-field="textField"
        :value-field="valueField"
        :select-size="selectSize"
        class="select-ghost w-100"
        :class="selectClass"
      />
    </b-input-group>

    <b-form-select
      v-else
      :id="id"
      v-model="internalValue"
      :options="normalizedOptions"
      :size="size"
      :disabled="disabled"
      :text-field="textField"
      :value-field="valueField"
      :select-size="selectSize"
      class="select-ghost w-100"
      :class="selectClass"
    />

    <small v-if="hint" class="text-muted d-block mt-1">{{ hint }}</small>
  </div>
</template>

<script>
export default {
  name: "UiSelect",
  props: {
    value: [String, Number, Boolean, Object, null],
    options: { type: Array, default: () => [] }, // ["All","A"] veya [{text,value}]
    size: { type: String, default: "sm" },
    disabled: { type: Boolean, default: false },
    label: String,
    hint: String,
    textField: { type: String, default: "text" },
    valueField: { type: String, default: "value" },
    selectSize: { type: [String, Number], default: null },
    clearable: { type: Boolean, default: false },

    // Stil/yerleşim
    wrapperClass: { type: [String, Array, Object], default: null },
    selectClass:  { type: [String, Array, Object], default: null },
    id: String,

    // Opsiyonel: route query ile senkron tut
    queryKey: String,
    routeReplace: { type: Boolean, default: true },
  },
  data() {
    return { internalValue: this.value };
  },
  watch: {
    value(v) { this.internalValue = v; },
    internalValue(v) {
      this.$emit("input", v);     // v-model
      this.$emit("change", v);

      if (this.queryKey) {
        const q = { ...this.$route.query };
        const isEmpty = v === null || v === "" || (typeof v === "string" && v.toLowerCase() === "all");
        if (isEmpty) delete q[this.queryKey];
        else q[this.queryKey] = String(v);

        const nav = this.routeReplace ? this.$router.replace : this.$router.push;
        nav.call(this.$router, { query: q }).catch(() => {});
      }
    }
  },
  computed: {
    normalizedOptions() {
      const arr = this.options || [];
      if (!arr.length) return [];
      const first = arr[0];
      // string/number dizi desteği
      if (typeof first === "string" || typeof first === "number") {
        return arr.map(x => ({ text: String(x), value: x }));
      }
      // zaten {text,value}
      return arr;
    }
  },
  created() {
    // route query'den başlangıç değeri çek (varsa)
    if (this.queryKey && (this.value === undefined || this.value === null || this.value === "")) {
      const qv = this.$route.query[this.queryKey];
      if (qv !== undefined) {
        const num = Number(qv);
        this.internalValue = isNaN(num) ? qv : num;
      }
    }
  },
  methods: {
    clear() { this.internalValue = null; }
  }
};
</script>

<style scoped>
.select-ghost { max-width: 100%; }
.filter-label { font-size: .8rem; color: #6b7280; margin-bottom: .25rem; }
</style>
