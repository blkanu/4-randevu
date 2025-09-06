<template>
  <div class="dashboard">
    <b-card class="welcome-card mb-4 text-center">
      <h4 class="mb-0 text-subu font-weight-bold">
        <b-icon icon="building"></b-icon> Salon Yönetimi</h4>
      <p class="mb-0 text-muted">
        <span class="text-muted small">Sadece size atanmış salonları görüntülüyorsunuz.</span><br />
        <strong>Sorumlu:</strong>
        <span v-if="user">{{ user.name }}</span>
        <span v-else>—</span>
      </p>
    </b-card>

    <b-alert show variant="info" v-if="myRooms.length === 0">
      Size atanmış salon bulunmuyor.
    </b-alert>

    

    <b-card v-if="myRooms.length" class="p-3 shadow-sm border-left-right-subu">
      <b-row class="w-100 mb-3">
      <b-col cols="12" md="4" size="sm" class="input-elevated mb-2 mb-md-0">
          <UiSearchInput v-model="q" placeholder="Salon adına göre ara…" />
        </b-col>
        
      </b-row>

      <!-- ... AdminRooms.vue içinde, b-table yerine: -->
<RoomsTable
  :rows="rows"
  :showAdmin="false"
  :showActions="true"
  :actions="{
    showManageDropdown: false,
    showCycle: true,
    showEdit: false,
    showDelete: false
  }"
  :stickyHeader="'60vh'"
  :sortBy="'name'"
  :sortDesc="false"
  @cycle="onCycleStatus"
/>

    </b-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { ROOM_STATUS } from "@/utils/constants";
import UiSearchInput from "@/components/ui/filters/UiSearchInput.vue";
import RoomsTable from "@/components/ui/tables/RoomsTable.vue";

export default {
  name: "AdminRooms",
  components: { UiSearchInput, RoomsTable },
  data() {
    return {
      q: "",
      fields: [
        { key: "name", label: "Salon" },
        { key: "capacity", label: "Kapasite" },
        { key: "status", label: "Durum" },
        { key: "actions", label: "İşlem" },
      ],
    };
  },
  computed: {
    ...mapGetters("rooms", ["allRooms"]),
    ...mapGetters("auth", ["user"]),

    myRooms() {
      if (!this.user) return [];
      return this.allRooms.filter((r) => r.adminId === this.user.id);
    },

    rows() {
      const term = this.q.trim().toLowerCase();
      return this.myRooms
        .filter((r) => !term || r.name.toLowerCase().includes(term))
        .map((r) => ({
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          status: r.status,
        }));
    },
  },
  methods: {
    ...mapActions("rooms", ["cycleRoomStatus"]),

    statusVariant(status) {
      return {
        [ROOM_STATUS.AKTIF]: "success",
        [ROOM_STATUS.PASIF]: "secondary",
        [ROOM_STATUS.BAKIMDA]: "warning",
      }[status] || "secondary";
    },

    statusButtonVariant(status) {
      // buton rengi: bir sonraki adıma göre ipucu
      return {
        [ROOM_STATUS.AKTIF]: "secondary",  // sonraki: Pasif
        [ROOM_STATUS.PASIF]: "warning",    // sonraki: Bakımda
        [ROOM_STATUS.BAKIMDA]: "success",  // sonraki: Aktif
      }[status] || "secondary";
    },
    statusButtonIcon(status) {
      return {
        [ROOM_STATUS.AKTIF]: "pause",  // pasife çek
        [ROOM_STATUS.PASIF]: "tools",  // bakımda
        [ROOM_STATUS.BAKIMDA]: "play", // aktifle
      }[status] || "pause";
    },
    statusButtonText(status) {
      return {
        [ROOM_STATUS.AKTIF]: "Pasifleştir",
        [ROOM_STATUS.PASIF]: "Bakımda",
        [ROOM_STATUS.BAKIMDA]: "Aktifleştir",
      }[status] || "Değiştir";
    },

    onCycleStatus(id) {
      // toast mesajı için bir sonraki durumu lokal hesapla (UI feedback)
      const room = this.myRooms.find((r) => r.id === id);
      if (!room) return;

      let next;
      if (room.status === ROOM_STATUS.AKTIF) next = ROOM_STATUS.PASIF;
      else if (room.status === ROOM_STATUS.PASIF) next = ROOM_STATUS.BAKIMDA;
      else next = ROOM_STATUS.AKTIF;

      this.cycleRoomStatus(id); // store tarafında döngü
      this.$bvToast.toast(`Salon durumu '${next}' olarak değiştirildi.`, {
        title: "Bilgi",
        variant: "info",
        solid: true,
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
  background-color: #f0f6fb;
  border-left: 5px solid #002855;
  border-radius: 15px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.input-elevated {
  border-radius: 12px;
  overflow: hidden;

  .input-group-text {
    background: #f6f9fc;
    border: 1px solid #e6edf3;
  }
  .form-control,
  .custom-select {
    border: 1px solid #e6edf3;
    background: #fff;
  }
}
</style>
