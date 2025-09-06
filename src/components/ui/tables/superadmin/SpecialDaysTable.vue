<template>
  <!-- STANDALONE MOD (dashboard vb.): başlık + ekle + modal + "Tümünü Gör" -->
  <b-card
    v-if="isStandalone"
    class="p-3 shadow-sm border-left-right-subu mb-4"
  >
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5 class="mb-0 text-subu font-weight-bold"> Özel Günler</h5>
      <b-button size="sm" variant="success" @click="$bvModal.show(addModalId)">
        <b-icon icon="plus-circle" class="mr-1" /> Ekle
      </b-button>
    </div>

    <b-table
      :items="rowsStandalone"
      :fields="tableFields"
      small
      responsive
      head-variant="light"
      stacked="md"
    >
      <template #cell(date)="row">
        <span class="font-weight-500">{{ formatDate(row.item.date) }}</span>
      </template>
      <template #cell(actions)="row">
        <b-button size="sm" variant="outline-danger" @click="confirmRemove(row.item.id)">
          <b-icon icon="trash" /> Sil
        </b-button>
      </template>
    </b-table>

    <!-- SOL ALT: Tümünü Gör -->
    <div class="mt-2">
      <b-button size="sm" variant="link" class="p-0" @click="go(viewAllRoute)">
        Tümünü Gör →
      </b-button>
    </div>

    <!-- Ekle Modal (standalone mod) -->
    <b-modal :id="addModalId" title="Özel Gün Ekle" @hide="resetForm" hide-footer>
      <b-form @submit.prevent="submitSpecialDay">
        <b-form-group label="Açıklama" label-for="sd-desc">
          <b-form-input id="sd-desc" v-model.trim="form.description" required placeholder="Örn: Kurum Tatili" />
        </b-form-group>
        <b-form-group label="Tarih" label-for="sd-date">
          <b-form-datepicker id="sd-date" v-model="form.date" :hide-header="true" required />
        </b-form-group>
        <div class="text-right">
          <b-button variant="secondary" class="mr-2" @click="$bvModal.hide(addModalId)">Vazgeç</b-button>
          <b-button variant="success" type="submit">Kaydet</b-button>
        </div>
      </b-form>
    </b-modal>
  </b-card>

  <!-- EMBEDDED MOD (SuperAdminSpecialDays): yalın tablo, veriyi parent verir -->
  <div v-else>
    <b-table
      :items="rows"
      :fields="tableFields"
      small
      responsive
      head-variant="light"
      stacked="md"
    >
      <template #cell(date)="row">
        <span class="font-weight-500">{{ formatDate(row.item.date) }}</span>
      </template>
      <template #cell(actions)="row">
        <!-- Onay/sil parent'ta yapılır -->
        <b-button size="sm" variant="danger" @click="$emit('remove', row.item.id)">
          <b-icon icon="trash" /> Sil
        </b-button>
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "SpecialDaysTable",
  props: {
    /** 'standalone' | 'embedded' */
    mode: { type: String, default: "standalone" },
    /** embedded modda tablo satırları */
    rows: { type: Array, default: () => [] },
    /** standalone modda dashboard gibi yerlerde limit */
    limit: { type: Number, default: 5 },
    /** standalone modda "Tümünü Gör" rotası */
    viewAllRoute: { type: String, default: "/superadmin/special-days" },
  },
  data() {
    return {
      addModalId: "sa-special-day-add",
      form: { date: null, description: "" },
      tableFields: [
        { key: "date",        label: "Tarih",      sortable: true },
        { key: "description", label: "Açıklama",   sortable: true },
        { key: "actions",     label: "İşlemler" },
      ],
    };
  },
  computed: {
    isStandalone() { return this.mode !== "embedded"; },
    ...mapGetters("specialDays", ["allSpecialDays"]),
    rowsStandalone() {
      if (!this.isStandalone) return [];
      return (this.allSpecialDays || [])
        .slice(0, this.limit)
        .map(d => ({ id: d.id, date: d.date, description: d.description || "(Açıklama yok)" }));
    },
  },
  methods: {
    ...mapActions("specialDays", {
      addSpecialDay: "addSpecialDay",
      removeSpecialDayAction: "removeSpecialDay",
    }),
    go(path) { if (this.isStandalone && path) this.$router.push(path); },
    formatDate(iso) {
      const d = new Date(iso);
      return isNaN(d)
        ? iso
        : d.toLocaleDateString("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" });
    },
    resetForm() { this.form = { date: null, description: "" }; },

    // Sadece standalone mod için dahili ekleme/silme
    async submitSpecialDay() {
      if (!this.isStandalone) return;
      if (!this.form.date || !this.form.description) return;
      try {
        await this.addSpecialDay({ date: this.form.date, description: this.form.description });
        this.$bvToast.toast("Özel gün eklendi.", { title: "Başarılı", variant: "success", solid: true });
        this.$bvModal.hide(this.addModalId);
      } catch (e) {
        this.$bvToast.toast(e?.message || "Özel gün eklenemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    async confirmRemove(id) {
      if (!this.isStandalone) return;
      const ok = await this.$bvModal.msgBoxConfirm("Bu özel günü silmek istiyor musunuz?", {
        title: "Onay", size: "sm", okVariant: "danger", okTitle: "Evet, Sil", cancelTitle: "Vazgeç",
      });
      if (!ok) return;
      try {
        await this.removeSpecialDayAction(id);
        this.$bvToast.toast("Özel gün silindi.", { title: "Silindi", variant: "warning", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "Özel gün silinemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },
  },
};
</script>
