<template>
  <b-card class="p-3 shadow-sm border-left-right-subu mb-4">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5 class="mb-0 text-subu font-weight-bold"> Salon Yöneticileri</h5>
    </div>

    <b-table
      :items="rows"
      :fields="fields"
      small
      responsive
      head-variant="light"
      stacked="md"
    >
      <template #cell(status)="row">
        <b-badge :variant="roomStatusVariant(row.item.status)">
          {{ humanizeRoomStatus(row.item.status) }}
        </b-badge>
      </template>

      <template #cell(actions)="row">
        <b-button size="sm" variant="outline-info" @click="openRoomStatusModal(row.item.id)">
          <b-icon icon="gear" /> Yönet
        </b-button>
      </template>
    </b-table>

    <!-- SOL ALT: Tümünü Gör -->
    <div class="mt-2">
      <b-button size="sm" variant="link" class="p-0" @click="go(viewAllRoute)">
        Tümünü Gör →
      </b-button>
    </div>

    <!-- Salon Durumu Modal (bileşen içi) -->
    <b-modal :id="roomModalId" title="Salon Durumu" @hide="resetForm" hide-footer>
      <b-form @submit.prevent="submitRoomStatus">
        <b-form-group label="Salon" label-for="room-sel">
          <b-form-select id="room-sel" v-model="form.roomId" :options="roomOptions" required />
        </b-form-group>
        <b-form-group label="Durum" label-for="room-status">
          <b-form-select id="room-status" v-model="form.status" :options="roomStatusOptions" required />
        </b-form-group>
        <div class="text-right">
          <b-button variant="secondary" class="mr-2" @click="$bvModal.hide(roomModalId)">Vazgeç</b-button>
          <b-button variant="info" type="submit">Güncelle</b-button>
        </div>
      </b-form>
    </b-modal>
  </b-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "RoomManagersTable",
  props: {
    limit: { type: Number, default: 5 },
    viewAllRoute: { type: String, default: "/superadmin/rooms" },
  },
  data() {
    return {
      fields: [
        { key: "room",   label: "Salon",   sortable: true },
        { key: "admin",  label: "Sorumlu", sortable: true },
        { key: "status", label: "Durum",   sortable: true },
        { key: "actions", label: "İşlemler" },
      ],
      roomStatusOptions: [
        { value: "Aktif",   text: "Aktif" },
        { value: "Pasif",   text: "Pasif" },
        { value: "Bakimda", text: "Bakımda" },
      ],
      form: { roomId: null, status: "Aktif" },
      roomModalId: "sa-room-status-modal",
    };
  },
  computed: {
    ...mapGetters("rooms", ["allRooms", "getRoomById"]),
    ...mapGetters("users", ["allUsers"]),
    rows() {
      return this.allRooms
        .filter(r => !!r.adminId)
        .slice(0, this.limit)
        .map(r => {
          const admin = this.allUsers.find(u => u.id === r.adminId);
          return {
            id: r.id,
            room: r.name,
            admin: admin ? `${admin.name} (${admin.email})` : "Atanmamış",
            status: r.status || "-",
          };
        });
    },
    roomOptions() {
      return this.allRooms.map(r => ({ value: r.id, text: r.name }));
    },
  },
  methods: {
    ...mapActions("rooms", ["setRoomStatus"]),
    go(path) { if (path) this.$router.push(path); },

    humanizeRoomStatus(s) {
      return ({ Aktif: "Aktif", Pasif: "Pasif", Bakimda: "Bakımda" }[s] || s);
    },
    roomStatusVariant(s) {
      return ({ Aktif: "success", Pasif: "secondary", Bakimda: "warning" }[s] || "secondary");
    },

    openRoomStatusModal(roomId) {
      const r = this.getRoomById(roomId) || this.allRooms[0];
      this.form.roomId = r?.id || null;
      this.form.status = r?.status || "Aktif";
      this.$bvModal.show(this.roomModalId);
    },
    resetForm() { this.form = { roomId: null, status: "Aktif" }; },

    async submitRoomStatus() {
      try {
        await this.setRoomStatus({ roomId: this.form.roomId, status: this.form.status });
        this.$bvToast.toast("Salon durumu güncellendi.", { title: "Başarılı", variant: "info", solid: true });
        this.$bvModal.hide(this.roomModalId);
      } catch (e) {
        this.$bvToast.toast(e?.message || "Salon durumu güncellenemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },
  },
};
</script>
