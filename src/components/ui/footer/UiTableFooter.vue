<template>
  <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap">
    <!-- Per-page seçici -->
    <div class="d-flex align-items-center mb-2 mb-md-0">
      <label class="mb-0 mr-2 small text-muted">{{ label }}</label>
      <b-form-select
        class="w-auto"
        :size="size"
        :value="perPage"
        :options="perPageOptions"
        :aria-label="ariaLabel"
        @input="onPerPage"
      />
    </div>

    <!-- Sayfalama -->
    <b-pagination
      :value="page"
      :total-rows="totalRows"
      :per-page="perPage"
      :align="align"
      :size="size"
      @input="onPage"
    />

    <!-- Toplam / Sayfa bilgisi -->
    <small v-if="showTotal" class="text-muted">
      Toplam {{ totalRows }} kayıt — Sayfa {{ page }} / {{ totalPages || 1 }}
    </small>
  </div>
</template>

<script>
export default {
  name: "UiTableFooter",
  props: {
    totalRows: { type: Number, required: true },

    // .sync ile kullanılacak
    page:    { type: Number, required: true },
    perPage: { type: Number, required: true },

    // [{ value: 10, text: '10' }, ...]
    perPageOptions: {
      type: Array,
      default: () => ([
        { value: 10, text: "10" },
        { value: 20, text: "20" },
        { value: 50, text: "50" },
      ])
    },

    // Görsel/erişilebilirlik ayarları
    label:     { type: String, default: "Kayıt" },
    ariaLabel: { type: String, default: "Sayfa başına kayıt" },
    size:      { type: String, default: "sm" },   // b-pagination & b-form-select boyutu
    align:     { type: String, default: "right" },// b-pagination align: 'left'|'center'|'right'
    showTotal: { type: Boolean, default: true },
  },
  computed: {
    totalPages() {
      if (!this.perPage) return 0;
      return Math.ceil(this.totalRows / this.perPage);
    }
  },
  methods: {
    onPage(val) {
      // .sync için
      this.$emit("update:page", val);
    },
    onPerPage(val) {
      // .sync için
      // Not: Parent zaten perPage değişiminde page=1 yapıyorsa (watch ile) ekstra bir şey gerekmiyor.
      this.$emit("update:perPage", Number(val));
    },
  }
};
</script>
