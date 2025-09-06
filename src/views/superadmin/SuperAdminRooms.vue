<template>
  <div class="superadmin-rooms">
    <!-- Welcome -->
    <b-card class="welcome-card mb-3 shadow-sm d-flex flex-column align-items-center text-center">
      <div class="mb-1">
        <h4 class="mb-0 text-subu font-weight-bold"><b-icon icon="building"></b-icon> Salonlar</h4>
        <small class="text-muted">Salonları arayın, filtreleyin, yönetin ve yeni salon ekleyin.</small>
      </div>
    </b-card>

    <!-- Summary Cards -->
    <SummaryCards :items="statCards" />

    <!-- Liste + Filtreler -->
    <b-card class="p-3 shadow-sm border-left-right-subu">
      <b-row class="align-items-end no-gutters mb-3">
        <!-- Arama -->
        <b-col cols="12" md="4" class="pr-md-2 mb-2 mb-md-0">
          <label class="filter-label">Ara</label>
          <UiSearchInput v-model="q" placeholder="Salon adı…" />
        </b-col>

        <!-- Durum (Filtre) -->
        <b-col cols="6" xl="2" lg="2" md="3" class="px-md-2 mb-2 mb-md-0">
          <label class="filter-label">Durum</label>
          <UiSelect v-model="status" :options="statusOptions" />
        </b-col>

        <!-- Yöneticisi (Filtre) -->
        <b-col cols="6" xl="2" lg="2" md="3" class="px-md-2 mb-2 mb-md-0">
          <label class="filter-label">Salon Yöneticisi</label>
          <UiSelect v-model="adminId" :options="adminFilterOptions" />
        </b-col>

        <!-- Sıfırlama ve Ekleme -->
        <b-col cols="12" xl="4" lg="4" md="12" class="mt-2 mt-md-0">
          <b-button size="sm" class="mr-2" variant="outline-secondary" @click="resetFilters">Filtreyi Sıfırla</b-button>
          <b-button size="sm" variant="primary" @click="openCreateModal">
            <b-icon icon="plus-circle" class="mr-1" /> Yeni Salon Ekle
          </b-button>
        </b-col>
      </b-row>

      <!-- Tablo -->
      <div v-if="paged.length === 0" class="text-muted text-center py-4">
        Kriterlere uyan salon bulunamadı.
      </div>

      <RoomsTable
        v-else
        :rows="paged"
        :showAdmin="true"
        :showActions="true"
        :actions="{
          showManageDropdown: true,
          showCycle: true,
          showEdit: true,
          showDelete: true
        }"
        :adminNameFn="userName"
        :stickyHeader="'60vh'"
        :sortBy.sync="sortBy"
        :sortDesc.sync="sortDesc"
        :enableInlineEditModal="true"
        :editFormConfig="{ statusOptions: statusSelectOptions, adminOptions: adminSelectOptions }"
        @set-status="setStatus"
        @cycle="cycleStatus"
        @delete="confirmDelete"
        @edit-submit="handleEditSubmit"
      />

      <!-- Alt Bar -->
      <UiTableFooter
        :total-rows="filtered.length"
        :page.sync="page"
        :perPage.sync="perPage"
        :perPageOptions="perPageOptions"
        label="Kayıt"
        aria-label="Sayfa başına kayıt"
        size="sm"
        align="right"
        :showTotal="true"
      />
    </b-card>

    <!-- Yeni Salon Modal -->
    <b-modal id="create-room" v-model="create.show" title="Yeni Salon Ekle" size="md" @hide="resetCreate">
      <b-form id="createRoomForm" @submit.prevent="submitCreate">
        <b-form-group label="Salon Adı" label-for="cName">
          <b-form-input id="cName" v-model.trim="create.form.name" required />
        </b-form-group>

        <b-form-group label="Kapasite" label-for="cCap">
          <b-form-input id="cCap" type="number" min="0" v-model.number="create.form.capacity" required />
        </b-form-group>

        <b-form-group label="Durum" label-for="cStatus">
          <b-form-select id="cStatus" v-model="create.form.status" :options="statusSelectOptions" required />
        </b-form-group>

        <b-form-group label="Salon Yöneticisi" label-for="cAdmin">
          <b-form-select id="cAdmin" v-model="create.form.adminId" :options="adminSelectOptions" />
        </b-form-group>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" size="sm" @click="create.show = false">Vazgeç</b-button>
        <b-button variant="primary" size="sm" type="submit" form="createRoomForm" :disabled="!canSubmitCreate">
          Oluştur
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { ROOM_STATUS } from "@/utils/constants";
import RoomsTable from "@/components/ui/tables/RoomsTable.vue";
import UiTableFooter from "@/components/ui/footer/UiTableFooter.vue";
import SummaryCards from "@/components/ui/cards/SummaryCards.vue";
import UiSearchInput from "@/components/ui/filters/UiSearchInput.vue";
import UiSelect from "@/components/ui/filters/UiSelect.vue";

export default {
  name: "SuperAdminRooms",
  components: { RoomsTable, UiTableFooter, SummaryCards, UiSearchInput, UiSelect },

  data() {
    return {
      // filtreler
      q: "",
      status: "ALL",
      adminId: "ALL",
      capMin: null,
      capMax: null,

      // tablo
      sortBy: "name",
      sortDesc: false,
      page: 1,
      perPage: 10,

      perPageOptions: [
        { value: 10, text: "10" },
        { value: 20, text: "20" },
        { value: 50, text: "50" },
      ],

      // sadece "Yeni Salon" için modal state
      create: {
        show: false,
        form: { name: "", capacity: 0, status: ROOM_STATUS.AKTIF, adminId: null },
      },

      ROOM_STATUS,
    };
  },

  computed: {
    ...mapGetters("rooms", ["allRooms"]),
    ...mapGetters("users", ["allUsers"]),

    statusOptions() {
      return [
        { value: "ALL", text: "Tümü" },
        { value: ROOM_STATUS.AKTIF, text: "Aktif" },
        { value: ROOM_STATUS.PASIF, text: "Pasif" },
        { value: ROOM_STATUS.BAKIMDA, text: "Bakımda" },
      ];
    },
    adminFilterOptions() {
      const base = [{ value: "ALL", text: "Tümü" }, { value: null, text: "Atanmadı" }];
      const admins = this.allUsers
        .filter(u => u.role === "Admin")
        .map(u => ({ value: u.id, text: u.name }));
      return base.concat(admins);
    },

    // Edit modalı RoomsTable içinde kullanacağımız seçenekler
    statusSelectOptions() {
      return [
        { value: ROOM_STATUS.AKTIF, text: "Aktif" },
        { value: ROOM_STATUS.PASIF, text: "Pasif" },
        { value: ROOM_STATUS.BAKIMDA, text: "Bakımda" },
      ];
    },
    adminSelectOptions() {
      const base = [{ value: null, text: "Atanmadı" }];
      const admins = this.allUsers
        .filter(u => u.role === "Admin")
        .map(u => ({ value: u.id, text: u.name }));
      return base.concat(admins);
    },

    statCards() {
      const total = this.allRooms.length;
      const aktif = this.allRooms.filter(r => r.status === ROOM_STATUS.AKTIF).length;
      const pasif = this.allRooms.filter(r => r.status === ROOM_STATUS.PASIF).length;
      const bakim = this.allRooms.filter(r => r.status === ROOM_STATUS.BAKIMDA).length;
      return [
        { key: "total", title: "Toplam Salon", value: total, icon: "building", color: "#8e44ad" },
        { key: "aktif", title: "Aktif",        value: aktif, icon: "check2-circle", color: "#27ae60" },
        { key: "pasif", title: "Pasif",        value: pasif, icon: "dash-circle",   color: "#7f8c8d" },
        { key: "bakim", title: "Bakımda",      value: bakim, icon: "tools",         color: "#f39c12" },
      ];
    },

    filtered() {
      const term = this.q.toLowerCase();
      return this.allRooms.filter(r => {
        if (term && !(r.name || "").toLowerCase().includes(term)) return false;

        if (this.status !== "ALL" && r.status !== this.status) return false;

        if (this.adminId !== "ALL") {
          if (this.adminId === null && r.adminId !== null) return false;
          if (this.adminId !== null && r.adminId !== this.adminId) return false;
        }

        if (this.capMin != null && r.capacity < this.capMin) return false;
        if (this.capMax != null && r.capacity > this.capMax) return false;

        return true;
      }).sort((a, b) => {
        const by = this.sortBy;
        let res = 0;
        if (by === "name") res = (a.name || "").localeCompare(b.name || "", "tr");
        else if (by === "capacity") res = a.capacity - b.capacity;
        else if (by === "status") res = (a.status || "").localeCompare(b.status || "", "tr");
        return this.sortDesc ? -res : res;
      });
    },

    paged() {
      const start = (this.page - 1) * this.perPage;
      return this.filtered.slice(start, start + this.perPage).map(r => ({
        id: r.id,
        name: r.name,
        capacity: r.capacity,
        status: r.status,
        adminId: r.adminId,
      }));
    },

    totalPages() {
      return Math.ceil(this.filtered.length / this.perPage);
    },

    canSubmitCreate() {
      const f = this.create.form;
      if (!f.name?.trim()) return false;
      if (f.capacity == null || f.capacity < 0) return false;
      if (![ROOM_STATUS.AKTIF, ROOM_STATUS.PASIF, ROOM_STATUS.BAKIMDA].includes(f.status)) return false;
      return true;
    },
  },

  watch: {
    q() { this.page = 1; this._syncQuery(); },
    status() { this.page = 1; this._syncQuery(); },
    adminId() { this.page = 1; this._syncQuery(); },
    capMin() { this.page = 1; this._syncQuery(); },
    capMax() { this.page = 1; this._syncQuery(); },
    sortBy() { this.page = 1; this._syncQuery(); },
    sortDesc() { this.page = 1; this._syncQuery(); },
    perPage() { this.page = 1; this._syncQuery(); },
    page() { this._syncQuery(false); }
  },

  created() {
    this._applyFromRoute();
  },

  methods: {
    ...mapActions("rooms", ["addRoom", "updateRoom", "setRoomStatus", "cycleRoomStatus", "deleteRoom"]),

    // UI helpers
    userName(id) {
      const u = this.allUsers.find(x => x.id === id);
      return u ? `${u.name}` : null;
    },

    resetFilters() {
      this.q = "";
      this.status = "ALL";
      this.adminId = "ALL";
      this.capMin = null;
      this.capMax = null;
      this.sortBy = "name";
      this.sortDesc = false;
      this.page = 1;
    },

    // Actions
    async setStatus(roomId, status) {
      try {
        await this.setRoomStatus({ roomId, status });
        this.$bvToast.toast("Salon durumu güncellendi.", { title: "Başarılı", variant: "success", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "Durum güncellenemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },
    async cycleStatus(roomId) {
      try {
        await this.cycleRoomStatus(roomId);
        this.$bvToast.toast("Salon durumu döndürüldü.", { title: "Bilgi", variant: "info", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "İşlem başarısız.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    // Inline edit submit handler (RoomsTable -> parent)
    async handleEditSubmit(payload, done) {
      try {
        await this.updateRoom({ ...payload });
        this.$bvToast.toast("Salon güncellendi.", { title: "Başarılı", variant: "success", solid: true });
        if (typeof done === "function") done(true);
      } catch (e) {
        this.$bvToast.toast(e?.message || "Salon güncellenemedi.", { title: "Hata", variant: "danger", solid: true });
        if (typeof done === "function") done(false);
      }
    },

    openCreateModal() {
      this.create.show = true;
      this.create.form = { name: "", capacity: 0, status: ROOM_STATUS.AKTIF, adminId: null };
    },
    resetCreate() {
      this.create = { show: false, form: { name: "", capacity: 0, status: ROOM_STATUS.AKTIF, adminId: null } };
    },
    async submitCreate() {
      try {
        await this.addRoom({ ...this.create.form });
        this.$bvToast.toast("Salon oluşturuldu.", { title: "Başarılı", variant: "success", solid: true });
        this.create.show = false;
        this.resetCreate();
      } catch (e) {
        this.$bvToast.toast(e?.message || "Salon oluşturulamadı.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    async confirmDelete(room) {
      const ok = await this.$bvModal.msgBoxConfirm(
        `"${room.name}" salonunu silmek istediğinize emin misiniz?`,
        { title: "Onay", size: "sm", okVariant: "danger", okTitle: "Evet, Sil", cancelTitle: "Vazgeç" }
      );
      if (!ok) return;
      try {
        await this.deleteRoom(room.id);
        this.$bvToast.toast("Salon silindi.", { title: "Silindi", variant: "warning", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "Salon silinemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    // Query sync
    _applyFromRoute() {
      const q = this.$route.query;
      if (typeof q.q === "string") this.q = q.q;
      if (typeof q.s === "string" && ["ALL", ROOM_STATUS.AKTIF, ROOM_STATUS.PASIF, ROOM_STATUS.BAKIMDA].includes(q.s)) this.status = q.s;
      if (typeof q.a !== "undefined") {
        if (q.a === "ALL") this.adminId = "ALL";
        else if (q.a === "null") this.adminId = null;
        else {
          const asNum = parseInt(q.a, 10);
          if (!isNaN(asNum)) this.adminId = asNum;
        }
      }
      if (typeof q.min === "string") this.capMin = parseInt(q.min, 10);
      if (typeof q.max === "string") this.capMax = parseInt(q.max, 10);
      if (typeof q.sb === "string" && ["name","capacity","status"].includes(q.sb)) this.sortBy = q.sb;
      if (typeof q.sd === "string") this.sortDesc = q.sd === "1";
      if (typeof q.page === "string") this.page = Math.max(1, parseInt(q.page, 10) || 1);
      if (typeof q.per === "string") this.perPage = Math.max(1, parseInt(q.per, 10) || 10);
    },
    _syncQuery(includePage = true) {
      const q = {};
      if (this.q) q.q = this.q;
      if (this.status !== "ALL") q.s = this.status;
      if (this.adminId !== "ALL") q.a = this.adminId === null ? "null" : String(this.adminId);
      if (this.capMin != null) q.min = String(this.capMin);
      if (this.capMax != null) q.max = String(this.capMax);
      if (this.sortBy !== "name") q.sb = this.sortBy;
      if (this.sortDesc) q.sd = "1";
      if (includePage && this.page > 1) q.page = String(this.page);
      if (this.perPage !== 10) q.per = String(this.perPage);
      this.$router.replace({ query: q });
    },
  },
};
</script>

<style scoped lang="scss">
.superadmin-rooms { font-family: "Poppins", sans-serif; }
.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }

.welcome-card { background-color: #f0f6fb; border-left: 5px solid #002855; border-radius: 15px; padding: 1rem 1.25rem; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }

.filter-label { font-size: .8rem; color: #6b7280; margin-bottom: .25rem; }
.input-elevated {
  border-radius: 12px; overflow: hidden;
  .input-group-text { background: #f6f9fc; border: 1px solid #e6edf3; }
  .form-control, .custom-select { border: 1px solid #e6edf3; background: #fff; }
}

.card-mini { border-radius: 14px; }
.icon-circle { background: #f6f9fc; border: 1px solid #e6edf3; border-radius: 9999px; padding: .4rem; display:flex; align-items:center; justify-content:center; }

.room-dot { display:inline-block; width:.6rem; height:.6rem; border-radius:9999px; margin-right:.25rem; }
.room-dot--active { background:#28a745; }
.room-dot--passive { background:#6c757d; }
.room-dot--maintenance { background:#f39c12; }
.room-dot--unknown { background:#adb5bd; }

.no-gutters { margin-left:0; margin-right:0;
  > [class^="col-"], > [class*=" col-"] { padding-left:.25rem; padding-right:.25rem; }
}
</style>
