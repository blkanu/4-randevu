<template>
  <div class="admin-meetings">
    <ui-header-card icon="journal-text" title="Toplantı Listesi">
      <span class="text-header small d-block">
        {{ assignedRoom ? `Yalnızca ${assignedRoom.name} için toplantıları görüyorsunuz.` : 'Tüm salonlardaki toplantılar listeleniyor.' }}
      </span>
    </ui-header-card>

    <!-- Summary Cards -->
    <div class="summary-cards-wrapper">
      <SummaryCards :items="meetingStatusCounts" />
    </div>

    <b-card class="p-3 shadow-sm border-left-right-subu">
      <!-- Filtre Çubuğu -->
      <b-row class="align-items-center mt-3 mb-4">
        <!-- Arama -->
        <b-col cols="12" md="5" class="mb-2 mb-md-0">
          <UiSearchInput v-model="search" placeholder="Başlık, gündem veya sahip adına göre ara…" />
        </b-col>

        <!-- Tarih filtresi -->
        <b-col cols="12" md="3" class="mb-2 mb-md-0">
          <UiSegmented v-model="dateFilter" :options="[
            {value:'all',text:'Tümü'},{value:'today',text:'Bugün'},{value:'week',text:'Bu Hafta'}
          ]"/>
        </b-col>

        <!-- Durum filtresi (çoklu seçim) -->
        <b-col cols="12" md="2" class="mb-2 mb-md-0">
          
          <UiStatusMulti
            v-model="statusSet"
            :options="statusOptions"
            text="Durumlar"
            variant="outline-secondary"
          />

        </b-col>

        <!-- Sıralama -->
        <b-col cols="12" md="2">
          <UiSortSelect v-model="sortKey" :options="sortOptions"/>
        </b-col>
      </b-row>

      <div v-if="finalRows.length === 0" class="text-muted text-center py-4">
        Kriterlerinize uyan toplantı bulunamadı.
      </div>

      <MeetingsTable
        v-if="finalRows.length"
        :rows="tableRows"
        @cancel="adminCancel"
      />
      


    </b-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UiHeaderCard from "@/components/ui/header/UiHeaderCard.vue";
import UiSearchInput from "@/components/ui/filters/UiSearchInput.vue";
import UiSegmented from "@/components/ui/filters/UiSegmented.vue";
import UiSortSelect from "@/components/ui/filters/UiSortSelect.vue";
import SummaryCards from "@/components/ui/cards/SummaryCards.vue";
import UiStatusMulti from "@/components/ui/filters/UiStatusMulti.vue";
import MeetingsTable from "@/components/ui/tables/MeetingsTable.vue";

export default {
  name: "AdminMeetings",
  components: { UiHeaderCard, UiSearchInput, UiSegmented, UiSortSelect, SummaryCards, UiStatusMulti, MeetingsTable },
  data() {
    return {
      search: "",
      dateFilter: "all",
      statusSet: [],
      sortKey: "dateAsc",
      fields: [
        { key: "title", label: "Toplantı" },
        { key: "owner", label: "Sahibi" },
        { key: "room",  label: "Salon" },
        { key: "date",  label: "Tarih" },
        { key: "time",  label: "Saat" },
        { key: "status", label: "Durum" },
        { key: "actions", label: "İşlem" },
      ],
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    ...mapGetters("meetings", ["allMeetings", "meetingById"]),
    ...mapGetters("users", ["getUserById"]),
    ...mapGetters("rooms", ["allRooms", "getRoomById"]),


     // Summary Cards için sayılar
    meetingStatusCounts() {
      const counts = {
        Onaylandi: this.scopedMeetings.filter(m => m.status === "Onaylandi").length,
        Beklemede: this.scopedMeetings.filter(m => m.status === "Beklemede").length,
        Reddedildi: this.scopedMeetings.filter(m => m.status === "Reddedildi").length,
        Iptal: this.scopedMeetings.filter(m => m.status === "Iptal").length,
        };
      return [
        { key: "approved",  title: "Onaylanan",  value: counts.Onaylandi,  icon: "check-circle",    color: "#27ae60" },
        { key: "pending",   title: "Beklemede",  value: counts.Beklemede,  icon: "hourglass-split", color: "#f1c40f" },
        { key: "rejected",  title: "Reddedilen", value: counts.Reddedildi, icon: "x-circle",        color: "#e74c3c" },
        { key: "cancelled", title: "İptal",      value: counts.Iptal,      icon: "slash-circle",    color: "#7f8c8d" },
      ];
    },


    assignedRoom() {
      return this.allRooms.find(r => r.adminId === this.user.id) || null;
    },
    scopedMeetings() {
      return this.assignedRoom
        ? this.allMeetings.filter(m => m.roomId === this.assignedRoom.id)
        : this.allMeetings;
    },

    statusOptions() {
      return [
        { value: "Beklemede",  text: "Beklemede" },
        { value: "Onaylandi",  text: "Onaylandı" },
        { value: "Reddedildi", text: "Reddedildi" },
        { value: "Iptal",      text: "İptal" },
      ];
    },
    sortOptions() {
      return [
        { value: "dateAsc",  text: "Tarih (Artan)" },
        { value: "dateDesc", text: "Tarih (Azalan)" },
        { value: "titleAz",  text: "Başlık (A → Z)" },
        { value: "status",   text: "Duruma göre" },
      ];
    },

    filtered() {
      const term = this.search.toLowerCase();
      const todayISO = new Date().toISOString().split("T")[0];
      const [startOfWeek, endOfWeek] = this._weekRangeISO();

      return this.scopedMeetings.filter(m => {
        const ownerName = (this.getUserById(m.ownerId)?.name || "").toLowerCase();
        const hits =
          !term ||
          m.title?.toLowerCase().includes(term) ||
          (m.agenda || "").toLowerCase().includes(term) ||
          ownerName.includes(term);
        if (!hits) return false;

        if (this.dateFilter === "today" && m.date !== todayISO) return false;
        if (this.dateFilter === "week" && !(m.date >= startOfWeek && m.date <= endOfWeek)) return false;

        if (this.statusSet.length && !this.statusSet.includes(m.status)) return false;

        return true;
      });
    },
    finalRows() {
      const list = [...this.filtered];
      const toTs = (m) => new Date(`${m.date}T${m.startTime}`).getTime();

      if (this.sortKey === "dateAsc")  list.sort((a,b) => toTs(a) - toTs(b));
      if (this.sortKey === "dateDesc") list.sort((a,b) => toTs(b) - toTs(a));
      if (this.sortKey === "titleAz")  list.sort((a,b) => (a.title || "").localeCompare(b.title || "", "tr"));
      if (this.sortKey === "status")   list.sort((a,b) => (a.status || "").localeCompare(b.status || "", "tr"));

      return list.map(m => ({
        id: m.id,
        title: m.title,
        owner: this.getUserById(m.ownerId)?.name || "Bilinmeyen",
        room: this.getRoomById(m.roomId)?.name || "-",
        date: m.date,
        time: `${m.startTime} - ${m.endTime}`,
        status: m.status,
      }));
    },
    tableRows() {
    return this.finalRows.map(row => ({
      ...row,
      canCancel: this.canAdminCancel(row.id),
    }));
  },
  },
  watch: {
  '$route.query': {
    immediate: true,
    handler() {
      this._applyFiltersFromRoute();
    }
  },

  search(newVal) {
    this._updateQuery({ search: newVal });
  },
  dateFilter(newVal) {
    this._updateQuery({ date: newVal });
  },
  sortKey(newVal) {
    this._updateQuery({ sort: newVal });
  },
  statusSet(newVal) {
    const q = { ...this.$route.query };
    if (newVal && newVal.length) {
      q.status = newVal.join(',');
    } else {
      delete q.status;
    }
    this._updateQuery(q);
  }
},

  methods: {
    ...mapActions("meetings", ["updateMeetingStatus"]),

    humanizeStatus(s) {
      const map = { Beklemede: "Beklemede", Onaylandi: "Onaylandı", Reddedildi: "Reddedildi", Iptal: "İptal" };
      return map[s] || s;
    },
    statusVariant(s) {
      return { Onaylandi: "success", Reddedildi: "danger", Beklemede: "warning", Iptal: "secondary" }[s] || "secondary";
    },
    _weekRangeISO() {
      const d = new Date();
      const day = d.getDay() || 7;
      if (day > 1) d.setDate(d.getDate() - (day - 1));
      const start = new Date(d);
      const end = new Date(d); end.setDate(end.getDate() + 6);
      return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
    },
    _applyStatusFromRoute() {
      const raw = this.$route.query.status;
      const allowed = this.statusOptions.map(o => o.value);
      if (!raw) { if (this.statusSet.length) this.statusSet = []; return; }
      const incoming = Array.isArray(raw) ? raw : String(raw).split(',');
      const normalized = incoming.map(s => String(s).trim()).filter(s => allowed.includes(s));
      const same = normalized.length === this.statusSet.length && normalized.every(v => this.statusSet.includes(v));
      if (!same) this.statusSet = normalized;
    },
    canAdminCancel(meetingId) {
      const m = this.meetingById(meetingId);
      if (!m) return false;
      if (m.status !== "Onaylandi") return false;

      const room = this.getRoomById(m.roomId);
      if (!room || room.adminId !== this.user.id) return false;

      const start = new Date(`${m.date}T${m.startTime}`);
      return start > new Date();
    },
    async adminCancel(meetingId) {
      const ok = await this.$bvModal.msgBoxConfirm(
        "Bu toplantıyı iptal etmek istediğinize emin misiniz?",
        { title: "Onay", size: "sm", okVariant: "danger", okTitle: "Evet, İptal Et", cancelTitle: "Vazgeç" }
      );
      if (!ok) return;

      try {
        await this.updateMeetingStatus({ id: meetingId, status: "Iptal" });
        this.$bvToast.toast("Toplantı iptal edildi.", { title: "Bilgi", variant: "warning", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "İşlem başarısız. Yetkiniz olmayabilir.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    _applyFiltersFromRoute() {
  const q = this.$route.query;

  // Arama
  this.search = typeof q.search === 'string' ? q.search : "";

  // Tarih
  const allowedDates = ['all', 'today', 'week'];
  this.dateFilter = allowedDates.includes(q.date) ? q.date : 'all';

  // Sıralama
  const allowedSorts = this.sortOptions.map(o => o.value);
  this.sortKey = allowedSorts.includes(q.sort) ? q.sort : 'dateAsc';

  // Durumlar
  const raw = q.status;
  const allowedStatuses = this.statusOptions.map(o => o.value);
  if (!raw) {
    this.statusSet = [];
  } else {
    const incoming = Array.isArray(raw) ? raw : String(raw).split(',');
    this.statusSet = incoming.map(s => s.trim()).filter(s => allowedStatuses.includes(s));
  }
},

_updateQuery(newParams) {
  const current = { ...this.$route.query };
  const updated = { ...current, ...newParams };

  // Boş değerleri sil
  Object.keys(updated).forEach(k => {
    if (updated[k] === "" || updated[k] === null || (Array.isArray(updated[k]) && updated[k].length === 0)) {
      delete updated[k];
    }
  });

  this.$router.replace({ query: updated }).catch(() => {});
},
  },
};
</script>

<style scoped lang="scss">
.admin-meetings { font-family: "Poppins", sans-serif; }

.header-card {
  background-color: #f0f6fb;
  border-radius: 12px;
  padding: 1.5rem 1.5rem;
  border-left: 5px solid #002855;
}

.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }

.input-elevated {
  border-radius: 12px; overflow: hidden;
  .input-group-text { background: #f6f9fc; border: 1px solid #e6edf3; }
  .form-control, .custom-select { border: 1px solid #e6edf3; background: #fff; }
}
.segmented .btn { border-color: #d9e6ef; background: #f8fbff; color: #003f91; }
.segmented .btn.active,
.segmented .btn[aria-pressed="true"] {
  background: #0093d1; border-color: #0093d1; color: #fff;
  box-shadow: 0 0 0 0.05rem rgba(0,147,209,0.35);
}

.text-header { font-size: 0.9rem; text-align: center; display: block; color: #6c757d; }

.summary-cards-wrapper {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
  > * {
    width: 120%;
    max-width: 1800px;
    padding: 0 1rem;
  }
}
</style>
