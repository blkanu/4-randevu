<template>
  <div class="dashboard">
    <!-- Başlık -->
    <b-card class="welcome-card mb-4 d-flex flex-column align-items-center text-center">
      <div class="mb-2">
        <h4 class="mb-1 text-subu font-weight-bold"><b-icon icon="shield-lock"></b-icon> Süper Admin Paneli</h4>
        <small class="text-muted">Roller, salonlar, yöneticiler, özel günler ve e-posta yapılandırmalarını yönetin.</small>
      </div>
    </b-card>

    <WelcomeModal />

    <!-- Stat Kartları -->
    <b-row>
      <b-col
        cols="12" sm="6" md="4" lg="3"
        v-for="c in cards"
        :key="c.title"
        class="mb-4"
      >
        <StatCard
          :title="c.title"
          :value="c.value"
          :icon="c.icon"
          :bg="c.color"
          :route="c.to"
          @navigate="go"
        />
      </b-col>
    </b-row>

    <!-- Kartlı Tablo Blokları -->
    <UsersTable class="mb-4" />
    <RoomManagersTable class="mb-4" />
    <SpecialDaysTable />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import WelcomeModal from '@/components/ui/modals/UiWelcomeModal.vue';
import StatCard from '@/components/ui/cards/StatCard.vue';
import UsersTable from '@/components/ui/tables/superadmin/UsersTable.vue';
import RoomManagersTable from '@/components/ui/tables/superadmin/RoomsMngTable.vue';
import SpecialDaysTable from '@/components/ui/tables/superadmin/SpecialDaysTable.vue';

export default {
  name: "SuperAdminDashboard",
  components: { WelcomeModal, StatCard, UsersTable, RoomManagersTable, SpecialDaysTable },
  data() {
    return {
      // tablolar
      privilegedUsersFields: [
        { key: "name",  label: "Ad Soyad", sortable: true },
        { key: "email", label: "E-posta",  sortable: true },
        { key: "role",  label: "Rol",      sortable: true },
        { key: "actions", label: "İşlemler" },
      ],
      roomManagersFields: [
        { key: "room",   label: "Salon",   sortable: true },
        { key: "admin",  label: "Sorumlu", sortable: true },
        { key: "status", label: "Durum",   sortable: true },
        { key: "actions", label: "İşlemler" },
      ],
      specialDaysFields: [
        { key: "date",        label: "Tarih",      sortable: true },
        { key: "description", label: "Açıklama",   sortable: true },
        { key: "actions",     label: "İşlemler" },
      ],

      // modal formları
      roleForm: { userId: null, role: "User" },
      roleOptions: [
        { value: "SuperAdmin", text: "Süper Admin" },
        { value: "UstMakam",   text: "Üst Makam" },
        { value: "Admin",      text: "Salon Yöneticisi" },
        { value: "User",       text: "Kullanıcı" },
      ],

      roomForm: { roomId: null, status: "Aktif" },
      roomStatusOptions: [
        { value: "Aktif",    text: "Aktif" },
        { value: "Pasif",    text: "Pasif" },
        { value: "Bakimda",  text: "Bakımda" },
      ],

      specialForm: { date: null, description: "" },
    };
  },

  computed: {
    ...mapGetters("users", ["allUsers"]),
    ...mapGetters("rooms", ["allRooms", "getRoomById"]),
    ...mapGetters("specialDays", ["allSpecialDays"]),

    // Kartlar
    cards() {
      return [
        { title: "Kullanıcılar",               value: this.allUsers.length,              icon: "people",          color: "#2c3e50", to: "/superadmin/users" },
        { title: "Salonlar",                   value: this.allRooms.length,              icon: "building",        color: "#5d6d7e", to: "/superadmin/rooms" },
        { title: "Salon Yöneticileri",        value: this.adminCount,                   icon: "person-badge",    color: "#8e44ad", to: "/superadmin/users" },
        { title: "Özel Günler",                value: this.allSpecialDays.length,        icon: "calendar2-event", color: "#16a085", to: "/superadmin/special-days" },
        { title: "Mail Ayarları",              value: "Ayarları Görüntüleyin",                          icon: "envelope",        color: "#34495e", to: "/superadmin/mail-settings" },
      ];
    },

    adminCount() {
      return this.allUsers.filter(u => u.role === "Admin").length;
    },

    // 5 satır — SA/ÜstMakam/Admin
    privilegedUsersRows() {
      const roles = new Set(["SuperAdmin", "UstMakam", "Admin"]);
      return this.allUsers
        .filter(u => roles.has(u.role))
        .slice(0, 5)
        .map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
    },

    // 5 satır — salon + atanmış admin + durum
    roomManagersRows() {
      return this.allRooms
        .filter(r => !!r.adminId)
        .slice(0, 5)
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

    // 5 satır — özel günler
    specialDaysRows() {
      return this.allSpecialDays
        .slice(0, 5)
        .map(d => ({ id: d.id, date: d.date, description: d.description || "(Açıklama yok)" }));
    },

    // select option yardımcıları
    userOptions() {
      return this.allUsers.map(u => ({ value: u.id, text: `${u.name} (${u.email})` }));
    },
    roomOptions() {
      return this.allRooms.map(r => ({ value: r.id, text: r.name }));
    },
  },

  methods: {
    // Vuex aksiyonları — mevcut modüllerle UYUMLU
    ...mapActions("users", ["updateUserRole"]),
    ...mapActions("rooms", ["setRoomStatus"]),            // ← rooms.js'te bu var
    ...mapActions("specialDays", ["addSpecialDay", "removeSpecialDay"]), // ← removeSpecialDay(id)

    go(path) { this.$router.push(path); },

    // --- Rol modal ---
    humanizeRole(r) {
      return ({ SuperAdmin: "Süper Admin", UstMakam: "Üst Makam", Admin: "Salon Yöneticisi", User: "Kullanıcı" }[r] || r);
    },
    roleVariant(r) {
      return ({ SuperAdmin: "secondary", UstMakam: "dark", Admin: "primary", User: "info" }[r] || "secondary");
    },
    openRoleModal(userId) {
      const u = this.allUsers.find(x => x.id === userId) || this.allUsers[0];
      this.roleForm.userId = u?.id || null;
      this.roleForm.role = u?.role || "User";
      this.$bvModal.show("role-modal");
    },
    resetRoleForm() {
      this.roleForm = { userId: null, role: "User" };
    },
    async submitRole() {
      try {
        await this.updateUserRole({ userId: this.roleForm.userId, role: this.roleForm.role });
        this.$bvToast.toast("Rol güncellendi.", { title: "Başarılı", variant: "success", solid: true });
        this.$bvModal.hide("role-modal");
      } catch (e) {
        this.$bvToast.toast(e?.message || "Rol güncellenemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    // --- Salon durumu modal ---
    humanizeRoomStatus(s) {
      return ({ Aktif: "Aktif", Pasif: "Pasif", Bakimda: "Bakımda" }[s] || s);
    },
    roomStatusVariant(s) {
      return ({ Aktif: "success", Pasif: "secondary", Bakimda: "warning" }[s] || "secondary");
    },
    openRoomStatusModal(roomId) {
      const r = this.getRoomById(roomId) || this.allRooms[0];
      this.roomForm.roomId = r?.id || null;
      this.roomForm.status = r?.status || "Aktif";
      this.$bvModal.show("room-status-modal");
    },
    resetRoomForm() {
      this.roomForm = { roomId: null, status: "Aktif" };
    },
    async submitRoomStatus() {
      try {
        await this.setRoomStatus({ roomId: this.roomForm.roomId, status: this.roomForm.status });
        this.$bvToast.toast("Salon durumu güncellendi.", { title: "Başarılı", variant: "info", solid: true });
        this.$bvModal.hide("room-status-modal");
      } catch (e) {
        this.$bvToast.toast(e?.message || "Salon durumu güncellenemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    // --- Özel günler ---
    formatDate(iso) {
      const d = new Date(iso);
      return isNaN(d) ? iso : d.toLocaleDateString("tr-TR", { year: "numeric", month: "2-digit", day: "2-digit" });
    },
    resetSpecialForm() {
      this.specialForm = { date: null, description: "" };
    },
    async submitSpecialDay() {
      if (!this.specialForm.date || !this.specialForm.description) return;
      try {
        await this.addSpecialDay({ date: this.specialForm.date, description: this.specialForm.description });
        this.$bvToast.toast("Özel gün eklendi.", { title: "Başarılı", variant: "success", solid: true });
        this.$bvModal.hide("special-day-add");
      } catch (e) {
        this.$bvToast.toast(e?.message || "Özel gün eklenemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },
    async removeSpecialDay(id) {
      const ok = await this.$bvModal.msgBoxConfirm("Bu özel günü silmek istiyor musunuz?", {
        title: "Onay", size: "sm", okVariant: "danger", okTitle: "Evet, Sil", cancelTitle: "Vazgeç",
      });
      if (!ok) return;
      try {
        await this.removeSpecialDay(id); // action signature: removeSpecialDay({ commit }, id)
      } catch (e) {
        // Eğer üstteki isim çakışırsa (method adıyla aynı), farklı isim kullan:
        // await this.$store.dispatch("specialDays/removeSpecialDay", id);
        this.$bvToast.toast(e?.message || "Özel gün silinemedi.", { title: "Hata", variant: "danger", solid: true });
        return;
      }
      this.$bvToast.toast("Özel gün silindi.", { title: "Silindi", variant: "warning", solid: true });
    },
  },
};
</script>

<style scoped lang="scss">
.dashboard { font-family: "Poppins", sans-serif; }
.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }

.card-hover { transition: all .25s ease; }
.card-hover:hover { transform: translateY(-6px); box-shadow: 0 8px 20px rgba(0,0,0,.12); }
.icon-circle { background-color: rgba(255,255,255,.2); border-radius: 50%; padding: .6rem; display: flex; align-items: center; justify-content: center; }

.welcome-card {
  background-color: #f0f6fb;
  border-left: 5px solid #002855;
  border-radius: 15px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
</style>
