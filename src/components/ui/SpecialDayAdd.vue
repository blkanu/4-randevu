<template>
  <b-card class="add-card shadow-sm mb-3">
    <div class="d-flex flex-wrap align-items-center justify-between">
      <div class="font-weight-bold text-subu mr-3 mb-2">Yeni Özel Gün</div>
      <UiSegmented
        v-model="mode"
        :options="[
          { value: 'holiday', text: 'Resmî Tatil' },
          { value: 'custom',  text: 'Özel Saat'  },
        ]"
        size="sm"
      />
    </div>

    <b-form @submit.prevent="submit">
      <b-row class="mt-2">
        <!-- Açıklama -->
        <b-col cols="12" md="4" class="mb-2">
          <label class="form-label">Açıklama</label>
          <b-form-input v-model.trim="form.description" placeholder="Örn: Kurum Tatili" required />
        </b-col>

        <!-- Tarih -->
        <b-col cols="12" md="4" class="mb-2">
          <label class="form-label">Tarih</label>
          <b-form-datepicker v-model="form.date" :hide-header="true" required />
        </b-col>

        <!-- holiday modunda: full day sabit -->
        <!-- custom modunda: tüm gün / saat -->
        <b-col cols="12" md="4" class="mb-2" v-if="mode === 'custom'">
          <label class="form-label">Kapsam</label>
          <b-form-checkbox v-model="form.allDay">Tüm gün</b-form-checkbox>
        </b-col>
      </b-row>

      <!-- Saat aralıkları (custom + !allDay) -->
      <div v-if="mode === 'custom' && !form.allDay" class="mt-2">
        <label class="form-label d-block">Saat Aralıkları</label>
        <div v-for="(r, idx) in form.ranges" :key="idx" class="d-flex align-items-center mb-2">
          <b-form-timepicker v-model="r.start" class="mr-2" minutes-step="5" required />
          <span class="mx-1">—</span>
          <b-form-timepicker v-model="r.end" class="mr-2" minutes-step="5" required />
          <b-button size="sm" variant="outline-danger" @click="removeRange(idx)">
            <b-icon icon="trash" />
          </b-button>
        </div>

        <b-button size="sm" variant="outline-primary" @click="addRange">
          <b-icon icon="plus-circle" class="mr-1" /> Aralık Ekle
        </b-button>
      </div>

      <div class="text-right mt-3">
        <b-button variant="secondary" class="mr-2" @click="reset">Temizle</b-button>
        <b-button variant="success" type="submit">
          Kaydet
        </b-button>
      </div>
    </b-form>
  </b-card>
</template>

<script>
import UiSegmented from "@/components/ui/filters/UiSegmented.vue";

export default {
  name: "SpecialDayAdd",
  components: { UiSegmented },
  data() {
    return {
      mode: "holiday", // 'holiday' | 'custom'
      form: {
        description: "",
        date: null,
        allDay: true,      // holiday'de hep true; custom'da toggle
        ranges: [],        // custom & !allDay => [{start,end}, ...]
      },
    };
  },
  watch: {
    mode(newVal) {
      if (newVal === "holiday") {
        this.form.allDay = true;
        this.form.ranges = [];
      }
    },
    "form.allDay"(v) {
      if (v) this.form.ranges = [];
      else if (!this.form.ranges.length) this.addRange();
    },
  },
  methods: {
    addRange() {
      this.form.ranges.push({ start: "09:00", end: "12:00" });
    },
    removeRange(i) {
      this.form.ranges.splice(i, 1);
      if (!this.form.ranges.length) this.addRange();
    },
    reset() {
      this.mode = "holiday";
      this.form = { description: "", date: null, allDay: true, ranges: [] };
    },
    submit() {
      const desc = (this.form.description || "").trim();
      if (!this.form.date || !desc) {
        this.$bvToast.toast("Tarih ve açıklama zorunludur.", {
          title: "Eksik Bilgi", variant: "danger", solid: true,
        });
        return;
      }

      // holiday -> allDay:true, ranges:[]
      // custom -> allDay:true veya ranges dolu
      const payload = {
        date: this.form.date,
        description: desc,
        kind: this.mode,
        allDay: this.form.allDay || this.mode === "holiday",
        ranges: this.form.allDay ? [] : this.form.ranges.filter(r => r.start && r.end),
      };

      if (!payload.allDay && !payload.ranges.length) {
        this.$bvToast.toast("En az bir saat aralığı seçiniz.", {
          title: "Eksik Bilgi", variant: "danger", solid: true,
        });
        return;
      }

      // parent yakalar
      this.$emit("submit", payload);
      this.reset();
    },
  },
};
</script>

<style scoped lang="scss">
.add-card {
  border-radius: 14px;
  background: #ffffff;
  padding: 0.85rem 1rem 0.75rem 1rem;
}
.form-label { font-size: .85rem; color: #6b7280; margin-bottom: .25rem; }
.text-subu { color: #002855; }
</style>
