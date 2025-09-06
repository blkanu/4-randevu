<template>
  <div class="dashboard">
    <!-- Başlık + Filtre -->
    <b-card class="welcome-card mb-4 d-flex flex-column align-items-center text-center">
      <div class="mb-2">
        <h4 class="mb-1 text-subu font-weight-bold"><b-icon icon="building"></b-icon> Salon Yönetimi </h4>
        <small class="text-muted">Tüm salonları görüntüleyebilir ve durumlarını aktif, pasif veya bakımda olarak değiştirebilirsiniz.</small>
      </div>

      <b-row class="w-100 mt-2">
        <b-col cols="12" md="8" class="mb-2 mb-md-0">
          <UiSearchInput v-model="q" placeholder="Salon adına veya sorumlu admin adına göre ara…" />
        </b-col>
        <b-col cols="12" md="4">
          <UiSelect
  v-model="statusFilter"
  :options="statusOptions"
  :selectClass="'select-ghost'"
/>

        </b-col>
      </b-row>
    </b-card>

    <!-- Liste -->
    <b-card class="p-3 shadow-sm border-left-right-subu">
      <!-- ... UstMakamRooms.vue içinde, b-table yerine: -->
<RoomsTable
  :rows="rows"
  :showAdmin="true"
  :showActions="true"
  :actions="{
    showManageDropdown: false, // dropdown yok
    showCycle: true,           // sadece döndür
    showEdit: false,
    showDelete: false
  }"
  :adminNameFn="adminName"
  :stickyHeader="'60vh'"
  :sortBy="'name'"
  :sortDesc="false"
  @cycle="cycle"
/>

      <b-alert show variant="info" v-if="rows.length === 0" class="mb-0">
        Kriterlere uygun salon bulunamadı.
      </b-alert>
    </b-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { ROOM_STATUS } from "@/utils/constants";
import UiSearchInput from "@/components/ui/filters/UiSearchInput.vue";
import RoomsTable from "@/components/ui/tables/RoomsTable.vue";
import UiSelect from "@/components/ui/filters/UiSelect.vue";

export default {
  name: "UstMakamRooms",
  components: { UiSearchInput, RoomsTable, UiSelect },
  data() {
    return {
      q: "",
      statusFilter: "All",
      fields: [
        { key: "name", label: "Salon", sortable: true },
        { key: "capacity", label: "Kapasite", sortable: true },
        { key: "status", label: "Durum" },
        { key: "admin", label: "Sorumlu Admin" },
        { key: "actions", label: "İşlem" },
      ],
    };
  },
  computed: {
    ...mapGetters("rooms", ["allRooms"]),
    ...mapGetters("users", ["allUsers"]),

    statusOptions() {
      return [
        { value: "All", text: "Tüm Durumlar" },
        { value: ROOM_STATUS.AKTIF, text: "Aktif" },
        { value: ROOM_STATUS.PASIF, text: "Pasif" },
        { value: ROOM_STATUS.BAKIMDA, text: "Bakımda" },
      ];
    },

    rows() {
      const term = this.q.toLowerCase();
      return this.allRooms
        .filter(r =>
          !term ||
          r.name.toLowerCase().includes(term) ||
          this.adminName(r.adminId).toLowerCase().includes(term)
        )
        .filter(r => this.statusFilter === "All" || r.status === this.statusFilter)
        .map(r => ({
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          status: r.status,
          adminId: r.adminId,
        }));
    },
  },
  methods: {
    ...mapActions("rooms", ["cycleRoomStatus"]),
    adminName(id) {
      const u = this.allUsers.find(x => x.id === id);
      return u ? u.name : "";
    },
    statusVariant(s) {
      return {
        [ROOM_STATUS.AKTIF]: "success",
        [ROOM_STATUS.PASIF]: "secondary",
        [ROOM_STATUS.BAKIMDA]: "warning",
      }[s] || "secondary";
    },
    cycleButtonVariant(s) {
      return {
        [ROOM_STATUS.AKTIF]: "warning",
        [ROOM_STATUS.PASIF]: "info",
        [ROOM_STATUS.BAKIMDA]: "success",
      }[s] || "secondary";
    },
    cycleButtonIcon(s) {
      return {
        [ROOM_STATUS.AKTIF]: "pause",
        [ROOM_STATUS.PASIF]: "tools",
        [ROOM_STATUS.BAKIMDA]: "play",
      }[s] || "arrow-repeat";
    },
    cycleButtonText(s) {
      return {
        [ROOM_STATUS.AKTIF]: "Pasifleştir",
        [ROOM_STATUS.PASIF]: "Bakımda Yap",
        [ROOM_STATUS.BAKIMDA]: "Aktifleştir",
      }[s] || "Değiştir";
    },
    cycle(roomId) {
      this.cycleRoomStatus(roomId);
      this.$bvToast.toast("Salon durumu güncellendi.", {
        title: "Bilgi", variant: "info", solid: true,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.dashboard { font-family: "Poppins", sans-serif; }
.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }
.welcome-card {
  background-color: #f0f6fb; border-left: 5px solid #002855;
  border-radius: 15px; padding: 1.25rem 1.5rem; box-shadow: 0 2px 6px rgba(0,0,0,.05);
}
.input-elevated { border-radius: 12px; overflow: hidden;
  .input-group-text { background: #f6f9fc; border: 1px solid #e6edf3; }
  .form-control, .custom-select { border: 1px solid #e6edf3; background: #fff; }
}
.select-ghost { max-width: 260px; }
</style>
