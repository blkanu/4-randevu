<template>
  <div class="dashboard">
    <!-- Başlık -->
    <b-card class="welcome-card mb-4 text-center">
      <div>
        <h4 class="mb-1 text-subu font-weight-bold">
          <b-icon icon="hourglass-split"></b-icon> Onay Bekleyen Toplantılar
        </h4>
        <span class="text-muted small">
          <strong>Salon: </strong>
          {{ assignedRoom ? assignedRoom.name : (selectedRoomId ? roomName(selectedRoomId) : 'Tüm Salonlar') }}
        </span>
      </div>
    </b-card>

    <!-- İçerik -->
    <b-card class="mt-2 p-3 shadow-sm border-left-right-subu">
      <!-- Filtreler -->
      
      <b-row class="d-flex justify-content-between align-items-center mb-3">
        
        <b-col cols="12" md="4" class="mb-2 mb-md-0">
          <UiDateSelect v-model="selectedDate"/>
        </b-col>

        <b-col cols="12" md="4" class="mb-2 mb-md-0" >
          <UiSortSelect
            v-model="sortBy"
            :options="sortOptions"
            placeholder="Sırala"
          />
        </b-col>
      </b-row>
      <!-- Tablo -->
      

      <MeetingsTable
        :rows="rows" 
        @approve="approve"
        @reject="id => reject(id, autoRejectReasonById(id))"
        :show-actions="true" 
        :can-approve-fn="canApprove"
        />

      <div v-if="rows.length === 0" class="text-muted text-center py-4">
        Bekleyen onay bulunamadı.
      </div>
      

    </b-card>
  </div>
</template>


<script>
import MeetingsTable from "@/components/ui/tables/MeetingsTable.vue";
import UiDateSelect from "@/components/ui/filters/UiDateSelect.vue";
import UiSortSelect from "@/components/ui/filters/UiSortSelect.vue";
import { ROOM_STATUS } from "@/utils/constants";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "AdminPendingApprovals",
  components: { MeetingsTable, UiDateSelect, UiSortSelect },
  data() {
    return {
      selectedDate: null,
      selectedRoomId: null,
      sortBy: "dateAsc", // varsayılan
      sortOptions: [
        { value: "dateAsc", text: "Tarih (Artan)" },
        { value: "dateDesc", text: "Tarih (Azalan)" },
        { value: "titleAsc", text: "Toplantı Adı (A-Z)" },
        { value: "titleDesc", text: "Toplantı Adı (Z-A)" },
        { value: "ownerAsc", text: "Sahip (A-Z)" },
        { value: "ownerDesc", text: "Sahip (Z-A)" },
      ],
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    ...mapGetters("meetings", ["allMeetings"]),
    ...mapGetters("users", ["getUserById"]),
    ...mapGetters("rooms", ["allRooms", "getRoomById"]),

    assignedRoom() {
      return this.allRooms.find(r => r.adminId === this.user.id) || null;
    },

    roomOptions() {
      const base = [{ value: null, text: "Tüm Salonlar" }];
      const list = this.allRooms.map(r => ({ value: r.id, text: r.name }));
      return base.concat(list);
    },

    rows() {
      let list = this.allMeetings.filter(m => m.status === "Beklemede");

      if (this.assignedRoom) {
        list = list.filter(m => m.roomId === this.assignedRoom.id);
      } else if (this.selectedRoomId) {
        list = list.filter(m => m.roomId === this.selectedRoomId);
      }

      if (this.selectedDate) {
        list = list.filter(m => m.date === this.selectedDate);
      }

      // önce map’leme
      const now = new Date();
      let mapped = list.map(m => {
        const roomObj = this.getRoomById(m.roomId);
        const roomStatus = roomObj ? roomObj.status : null;
        const startDT = new Date(`${m.date}T${m.startTime}`);
        const isPastOrStarted = startDT <= now;
        const roomInactive = roomStatus !== ROOM_STATUS.AKTIF;

        const canApprove = !roomInactive && !isPastOrStarted;
        const canReject  = true;

        const ownerName = this.getUserById(m.ownerId)?.name || "Bilinmeyen";

        return {
          id: m.id,
          title: m.title,
          owner: ownerName,
          room: roomObj?.name || "-",
          date: m.date,
          time: `${m.startTime} - ${m.endTime}`,
          status: m.status,
          canApprove,
          canReject,
          canCancel: false,
          disabledReason: !canApprove ? this.approveDisabledReason({ roomStatus, isPastOrStarted }) : undefined,
          roomStatus,
          isPastOrStarted,
        };
      });

      // sıralama
      mapped.sort((a, b) => {
        switch (this.sortBy) {
          case "dateAsc":
            return new Date(`${a.date}T${a.time.split(" - ")[0]}`) - new Date(`${b.date}T${b.time.split(" - ")[0]}`);
          case "dateDesc":
            return new Date(`${b.date}T${b.time.split(" - ")[0]}`) - new Date(`${a.date}T${a.time.split(" - ")[0]}`);
          case "titleAsc":
            return a.title.localeCompare(b.title, "tr");
          case "titleDesc":
            return b.title.localeCompare(a.title, "tr");
          case "ownerAsc":
            return a.owner.localeCompare(b.owner, "tr");
          case "ownerDesc":
            return b.owner.localeCompare(a.owner, "tr");
          default:
            return 0;
        }
      });

      return mapped;
    },
  },
  methods: {
    ...mapActions("meetings", ["updateMeetingStatus", "sendMeetingNotification"]),

    approveDisabledReason(rowLike) {
      if (rowLike.roomStatus !== ROOM_STATUS.AKTIF) return `Salon aktif değil (${rowLike.roomStatus}).`;
      if (rowLike.isPastOrStarted) return "Tarih/Saat geçmiş veya toplantı başlamış.";
      return "";
    },
    autoRejectReason(rowLike) {
      if (rowLike.roomStatus !== ROOM_STATUS.AKTIF) return `Salon durumu: ${rowLike.roomStatus}.`;
      if (rowLike.isPastOrStarted) return "Toplantı zamanı geçmiş/başlamış.";
      return "Uygun bulunmadı.";
    },
    autoRejectReasonById(id) {
      const r = this.rows.find(x => x.id === id);
      if (!r) return "Uygun bulunmadı.";
      return this.autoRejectReason(r);
    },

    async approve(id) {
      try {
        await this.updateMeetingStatus({ id, status: "Onaylandi" });
        await this.sendMeetingNotification({ meetingId: id, type: "approved" });
        this.$bvToast.toast("Toplantı onaylandı.", { title: "Başarılı", variant: "success", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "İşlem başarısız.", { title: "Hata", variant: "danger", solid: true });
      }
    },
    async reject(id, reason) {
      try {
        await this.updateMeetingStatus({ id, status: "Reddedildi", reason });
        await this.sendMeetingNotification({ meetingId: id, type: "rejected" });
        this.$bvToast.toast("Toplantı reddedildi.", { title: "Bilgi", variant: "warning", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "İşlem başarısız.", { title: "Hata", variant: "danger", solid: true });
      }
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
