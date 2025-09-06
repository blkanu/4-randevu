<template>
  <!-- Row'un içine child-col olarak oturması için dışarıya tek bir <b-col> veriyoruz -->
  <b-col cols="12" md="6" class="mb-2 mb-md-0">
    <b-row class="align-items-end">
      <!-- Başlangıç -->
      <b-col cols="12" md="6" class="mb-2 mb-md-0">
        <label class="filter-label">{{ startLabel }}</label>
        <b-form-datepicker
          class="w-100"
          :size="size"
          :hide-header="hideHeader"
          v-model="localFrom"
        />
      </b-col>

      <!-- Bitiş -->
      <b-col cols="12" md="6">
        <label class="filter-label">{{ endLabel }}</label>
        <b-form-datepicker
          class="w-100"
          :size="size"
          :hide-header="hideHeader"
          v-model="localTo"
        />
      </b-col>
    </b-row>
  </b-col>
</template>

<script>
export default {
  name: "UiDateRange",
  props: {
    // Parent'ta :from.sync ve :to.sync ile bağlayacağız
    from: { type: [String, null], default: null },
    to:   { type: [String, null], default: null },

    // Görsel/UX
    size:       { type: String, default: "sm" },
    hideHeader: { type: Boolean, default: true },
    startLabel: { type: String, default: "Başlangıç Tarihi" },
    endLabel:   { type: String, default: "Bitiş Tarihi" },
  },
  data() {
    return {
      localFrom: this.from,
      localTo:   this.to,
    };
  },
  watch: {
    // Parent -> local
    from(v) { this.localFrom = v; },
    to(v)   { this.localTo   = v; },

    // local -> Parent (.sync sözleşmesi)
    localFrom(v) {
      this.$emit("update:from", v);
      this.$emit("input", { from: v, to: this.localTo }); // opsiyonel toplu
    },
    localTo(v) {
      this.$emit("update:to", v);
      this.$emit("input", { from: this.localFrom, to: v }); // opsiyonel toplu
    },
  },
};
</script>
