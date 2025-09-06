<template>
  <div class="date-select">
    <!-- Tarih Seçici -->
    <b-form-datepicker
      v-model="innerValue"
      class="date-input"
      :reset-button="true"
      :hide-header="true"
      placeholder="Tarih seç (opsiyonel)"
      locale="tr"
    />

    <!-- Sıfırla -->
    <b-button
      variant="outline-secondary"
      size="sm"
      class="reset-btn"
      @click="reset"
    >
      Sıfırla
    </b-button>
  </div>
</template>

<script>
export default {
  name: "DateSelect",
  props: {
    value: {
      type: [String, null],
      default: null,
    },
  },
  data() {
    return {
      innerValue: this.value,
    };
  },
  watch: {
    innerValue(val) {
      this.$emit("input", val); // Vue 2 v-model uyumu
    },
    value(val) {
      this.innerValue = val;
    },
  },
  methods: {
    reset() {
      this.innerValue = null;
      this.$emit("input", null);
    },
  },
};
</script>

<style scoped>
.date-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;      /* datepicker ile buton arasındaki boşluk */
  white-space: nowrap;
  flex-wrap: nowrap; /* aynı satırda kalmasını sağlar */
}

/* datepicker genişliğini kontrol et (isteğe göre ayarla) */
.date-input {
  min-width: 220px;
  max-width: 100%;
  flex: 1 1 auto; /* kalan alanı kullanır */
}

/* butonun satır içi düzeni */
.reset-btn {
  flex: 0 0 auto;
  margin-left: 0;
}

/* Çok dar ekranlarda taşma olursa, istersen burayı kaldırıp wrap'e izin verebilirsin */
/* @media (max-width: 420px) {
  .date-select { flex-wrap: wrap; }
  .date-input { min-width: 100%; }
  .reset-btn { width: 100%; }
} */
</style>
