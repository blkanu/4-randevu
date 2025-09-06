<template>
  <div class="special-days">
    <!-- Welcome -->
    <b-card class="welcome-card mb-3 shadow-sm text-center d-flex flex-column align-items-center justify-content-center">
      <div class="mb-2">
        <h4 class="mb-0 text-subu font-weight-bold">🎯 Özel Gün Yönetimi</h4>
        <small class="text-muted d-block mt-1">
          Resmî tatiller ve kurum özel günleri — planlamada otomatik kapalı gün olarak kullanılır.
        </small>
      </div>

      <div class="d-flex align-items-center justify-content-center mt-2">
        <UiSelect v-model="yearFilter" :options="yearOptions" :selectClass="'mr-2'" size="sm" />
        <b-button size="sm" variant="outline-secondary" @click="resetFilters">Sıfırla</b-button>
      </div>
    </b-card>

    <!-- Yeni Özel Gün (harici ekleme çubuğu) -->
    <NewAddSpecialDay @submit="submit" />

    <!-- Liste + Filtre Çubuğu -->
    <b-card class="p-3 shadow-sm border-left-right-subu">
      <b-row class="align-items-end no-gutters mb-3">
        <!-- Arama -->
        <b-col cols="12" xl="6" lg="6" md="6" class="pr-md-2 mb-2 mb-md-0">
          <label class="filter-label">Arama</label>
          <UiSearchInput v-model="query" placeholder="Tarih veya açıklamaya göre ara…" />
        </b-col>

        <!-- Ay -->
        <b-col cols="6" xl="4" lg="2" md="3" class="px-md-2 mb-2 mb-md-0">
          <label class="filter-label">Ay</label>
          <UiSelect v-model="monthFilter" :options="monthOptions" :selectClass="'select-ghost'" />
        </b-col>

        <!-- Sıralama -->
        <b-col cols="6" xl="2" lg="2" md="3" class="px-md-2 mb-2 mb-md-0">
          <label class="filter-label">Sırala</label>
          <UiSortSelect v-model="sortKey" :options="sortOptions" :selectClass="'select-ghost'" />
        </b-col>
      </b-row>

      <!-- Boş durum -->
      <div v-if="pagedRows.length === 0" class="text-muted text-center py-4">
        Kriterlere uyan özel gün bulunamadı.
      </div>

      <!-- TABLO: SpecialDaysTable embedded -->
      <SpecialDaysTable
        v-else
        mode="embedded"
        :rows="pagedRows"
        @remove="removeDay"
      />

      <!-- Alt Bilgi + Sayfalama -->
      <UiTableFooter
        :total-rows="filtered.length"
        :per-page="perPage"
        :current-page="page"
        @update:current-page="page = $event"
      />
    </b-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import NewAddSpecialDay from "@/components/ui/NewaddSpecialDays.vue";
import UiSearchInput from "@/components/ui/filters/UiSearchInput.vue";
import UiSelect from "@/components/ui/filters/UiSelect.vue";
import UiSortSelect from "@/components/ui/filters/UiSortSelect.vue";
import UiTableFooter from "@/components/ui/footer/UiTableFooter.vue";
import SpecialDaysTable from "@/components/ui/tables/superadmin/SpecialDaysTable.vue";

export default {
  name: "SuperAdminSpecialDays",
  components: {
    NewAddSpecialDay,
    UiSearchInput,
    UiSelect,
    UiSortSelect,
    UiTableFooter,
    SpecialDaysTable,
  },
  data() {
    return {
      // filtreler
      query: "",
      yearFilter: "all",
      monthFilter: "all",

      // pg/sort
      page: 1,
      perPage: 10,
      sortKey: "dateAsc", // dateAsc | dateDesc | descAz
    };
  },
  computed: {
    ...mapGetters("specialDays", ["allSpecialDays"]),

    yearOptions() {
      const years = new Set(
        (this.allSpecialDays || [])
          .map(d => (d.date || "").slice(0, 4))
          .filter(y => /^\d{4}$/.test(y))
      );
      const now = new Date();
      years.add(String(now.getFullYear()));
      years.add(String(now.getFullYear() + 1));
      return [{ value: "all", text: "Tüm Yıllar" }]
        .concat(Array.from(years).sort((a,b) => a.localeCompare(b, "tr")).map(y => ({ value: y, text: y })));
    },

    monthOptions() {
      return [
        { value: "all", text: "Tüm Aylar" },
        { value: "01", text: "Ocak" }, { value: "02", text: "Şubat" }, { value: "03", text: "Mart" },
        { value: "04", text: "Nisan" }, { value: "05", text: "Mayıs" }, { value: "06", text: "Haziran" },
        { value: "07", text: "Temmuz" }, { value: "08", text: "Ağustos" }, { value: "09", text: "Eylül" },
        { value: "10", text: "Ekim" }, { value: "11", text: "Kasım" }, { value: "12", text: "Aralık" },
      ];
    },

    sortOptions() {
      return [
        { value: "dateAsc",  text: "Tarih (Artan)" },
        { value: "dateDesc", text: "Tarih (Azalan)" },
        { value: "descAz",   text: "Açıklama (A → Z)" },
      ];
    },

    filtered() {
      const q = this.query.toLowerCase();
      const base = (this.allSpecialDays || []).filter(d => {
        if (this.yearFilter !== "all" && !String(d.date).startsWith(this.yearFilter)) return false;
        if (this.monthFilter !== "all") {
          const m = String(d.date).slice(5, 7);
          if (m !== this.monthFilter) return false;
        }
        const hay = `${d.date} ${d.description || ""}`.toLowerCase();
        return !q || hay.includes(q);
      });

      const list = [...base];
      if (this.sortKey === "dateAsc")  list.sort((a,b) => new Date(a.date) - new Date(b.date));
      if (this.sortKey === "dateDesc") list.sort((a,b) => new Date(b.date) - new Date(a.date));
      if (this.sortKey === "descAz")   list.sort((a,b) => (a.description || "").localeCompare(b.description || "", "tr"));
      return list;
    },

    pagedRows() {
      const start = (this.page - 1) * this.perPage;
      return this.filtered.slice(start, start + this.perPage);
    },
  },
  watch: {
    query() { this.page = 1; },
    yearFilter() { this.page = 1; },
    monthFilter() { this.page = 1; },
    sortKey() { this.page = 1; },
    perPage() { this.page = 1; },
  },
  methods: {
    ...mapActions("specialDays", ["addSpecialDay", "removeSpecialDay"]),

    resetFilters() {
      this.query = "";
      this.yearFilter = "all";
      this.monthFilter = "all";
      this.sortKey = "dateAsc";
      this.page = 1;
      this.perPage = 10;
    },

    // NewAddSpecialDay -> payload ile gelir
    async submit({ date, description }) {
      const desc = (description || "").trim();
      if (!date || !desc) {
        this.$bvToast.toast("Tarih ve açıklama zorunludur.", {
          title: "Eksik Bilgi", variant: "danger", solid: true,
        });
        return;
      }
      const exists = (this.allSpecialDays || []).some(d => d.date === date);
      if (exists) {
        this.$bvToast.toast("Bu tarih zaten kayıtlı.", {
          title: "Yinelenen Kayıt", variant: "warning", solid: true,
        });
        return;
      }
      try {
        await this.addSpecialDay({ date, description: desc });
        this.$bvToast.toast("Özel gün eklendi.", { title: "Başarılı", variant: "success", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "Kayıt eklenemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    async removeDay(id) {
      const ok = await this.$bvModal.msgBoxConfirm(
        "Bu özel günü silmek istediğinize emin misiniz?",
        { title: "Onay", okVariant: "danger", okTitle: "Evet, Sil", cancelTitle: "Vazgeç", size: "sm" }
      );
      if (!ok) return;
      try {
        await this.removeSpecialDay(id);
        this.$bvToast.toast("Özel gün silindi.", { title: "Silindi", variant: "warning", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "Silme işlemi başarısız.", { title: "Hata", variant: "danger", solid: true });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.special-days { font-family: "Poppins", sans-serif; }
.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }
.welcome-card {
  background-color: #f0f6fb;
  border-left: 5px solid #002855;
  border-radius: 15px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 6px rgba(0,0,0,.05);
}
.select-ghost { min-width: 160px; }
.filter-label { font-size: .8rem; color: #6b7280; margin-bottom: .25rem; }
.no-gutters { margin-left:0; margin-right:0;
  > [class^="col-"], > [class*=" col-"] { padding-left:.25rem; padding-right:.25rem; }
}
.btn-subu,
.btn-subu:hover { background-color: #0093d1; border-color: #0093d1; color: #fff; }
</style>
