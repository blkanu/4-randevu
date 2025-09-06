<template>
  <div class="meeting-list">
    <!-- Başlık + Filtreler -->
    <ui-header-card icon="calendar2" title="Aktif Toplantılar">
      <span class="text-header small mb-3">Yaklaşan ve devam eden toplantıları görüntülüyorsunuz.</span>

      <b-row class="align-items-center">
        <!-- Arama -->
        <b-col cols="12" md="4" class="mb-2 mb-md-0">
          <UiSearchInput v-model="search" placeholder="Başlık, gündem veya sahip adına göre ara…" />
        </b-col>

        <!-- Tarih filtresi -->
        <b-col cols="12" md="3" class="mb-2 mb-md-0">
          <UiSegmented v-model="dateFilter" :options="dateOptions"/>
        </b-col>
        
        <!-- Durum filtresi -->
        <b-col cols="12" md="2" class="mb-2 mb-md-0">
          <UiStatusMulti
            v-model="statusSet"
            :options="activeStatusOptions"
            text="Durumlar"
            variant="outline-secondary"
            :autoSelectAllOnMount="true"
          />
        </b-col>

        <!-- Sıralama -->
        <b-col cols="12" md="3" class="mb-2 mb-md-0">
          <UiSortSelect v-model="sortKey" :options="sortOptions"/>
        </b-col>
      </b-row>
    </ui-header-card>

    <!-- Özet Kartları -->
    <div class="summary-cards-wrapper">
      <SummaryCards :items="meetingStatusCounts" />
    </div>

    <!-- Kartlar -->
    <div v-for="meeting in finalMeetings" :key="meeting.id" class="mb-4">
      <MeetingCardBase
        :meeting="meeting"
        :display="{
          participantsMode: 'names',   // aktif toplantılar listesinde isimleri göster
          showOwner: true,
          showCountdown: true,         // yalnız Onaylandi için görünür (MeetingCardBase kontrol ediyor)
          showStatusBadge: true
        }"
        :features="{
          addAgenda: true,             // bu sayfada gündem maddesi eklenebilir
          ownerCancel: true,           // sahip iptal edebilir (koşullu)
          overrideCancel: false
        }"
        :can="{
          addAgenda: canAddAgenda,
          ownerCancel: canOwnerCancel,
          overrideCancel: () => false
        }"
        :helpers="{ getUserName, getRoomName, statusColor }"
        @add-agenda="onAddAgenda"
        @owner-cancel="onOwnerCancel"
      />
    </div>

    <b-alert variant="info" show v-if="finalMeetings.length === 0">
      Şu anda aktif toplantınız bulunmamaktadır.
    </b-alert>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UiHeaderCard from "@/components/ui/header/UiHeaderCard.vue";
import UiSearchInput from "@/components/ui/filters/UiSearchInput.vue";
import UiSegmented from "@/components/ui/filters/UiSegmented.vue";
import UiSortSelect from "@/components/ui/filters/UiSortSelect.vue";
import UiStatusMulti from "@/components/ui/filters/UiStatusMulti.vue";
import SummaryCards from "@/components/ui/cards/SummaryCards.vue";
import MeetingCardBase from "@/components/meetings/base/MeetingCardBase.vue";

export default {
  name: "MeetingList",
  components: { UiHeaderCard, UiSearchInput, UiSegmented, UiSortSelect, UiStatusMulti, SummaryCards, MeetingCardBase },

  data() {
    return {
      search: "",
      dateFilter: "all",         // all | today | week
      sortKey: "timeAsc",        // timeAsc | timeDesc | titleAz
      statusSet: ["Onaylandi", "Beklemede"],
      nowTimer: null,            // geri sayım/rozeti tazelemek için
    };
  },

  computed: {
    ...mapGetters("auth", ["user"]),
    ...mapGetters("meetings", ["allMeetings"]),
    ...mapGetters("users", ["getUserById"]),
    ...mapGetters("rooms", ["getRoomById"]),

    // Özet kartları
    meetingStatusCounts() {
      const approved = this.myActiveMeetings.filter(m => m.status === "Onaylandi").length;
      const pending  = this.myActiveMeetings.filter(m => m.status === "Beklemede").length;
      return [
        { key: "approved", title: "Onaylanan", value: approved, icon: "check-circle", color: "#27ae60" },
        { key: "pending",  title: "Beklemede", value: pending,  icon: "hourglass-split", color: "#f1c40f" },
      ];
    },

    // Kullanıcıyla ilişkili ve gelecek penceresinde olan toplantılar
    myActiveMeetings() {
      const uid = this.user?.id;
      if (!uid) return [];
      const now = new Date();

      const startDT = (m) => new Date(`${m.date}T${m.startTime}`);
      const endDT   = (m) => new Date(`${m.date}T${m.endTime}`);

      return this.allMeetings.filter((m) => {
        const mine = m.ownerId === uid || (m.participants || []).includes(uid);
        if (!mine) return false;

        // Onaylandi -> bitiş gelecekte olmalı
        if (m.status === "Onaylandi") return endDT(m) > now;

        // Beklemede -> başlangıç gelecekte olmalı
        if (m.status === "Beklemede") return startDT(m) > now;

        return false;
      });
    },

    // Filtre seçenekleri
    dateOptions() {
      return [
        { value: "all", text: "Tümü" },
        { value: "today", text: "Bugün" },
        { value: "week", text: "Bu Hafta" },
      ];
    },
    sortOptions() {
      return [
        { value: "timeAsc", text: "Saat (Artan)" },
        { value: "timeDesc", text: "Saat (Azalan)" },
        { value: "titleAz", text: "Başlık (A → Z)" },
      ];
    },
    activeStatusOptions() {
      return [
        { value: "Onaylandi", text: "Onaylandı" },
        { value: "Beklemede", text: "Beklemede" },
      ];
    },

    // Arama + tarih + durum filtreleri
    filteredMeetings() {
      const term = this.search.toLowerCase();
      const todayISO = new Date().toISOString().split("T")[0];
      const startOfWeek = this._startOfWeekISO();
      const endOfWeek = this._endOfWeekISO();

      return this.myActiveMeetings.filter((m) => {
        // Metin arama: başlık, gündem, sahip
        const ownerName = (m.owner?.name || this.getUserName(m.ownerId) || "").toLowerCase();
        const haystack = `${m.title} ${(m.agenda || "")} ${ownerName}`.toLowerCase();
        if (term && !haystack.includes(term)) return false;

        // Tarih filtreleri
        if (this.dateFilter === "today" && m.date !== todayISO) return false;
        if (this.dateFilter === "week" && !(m.date >= startOfWeek && m.date <= endOfWeek)) return false;

        // Durum filtreleri
        if (this.statusSet.length && !this.statusSet.includes(m.status)) return false;

        return true;
      });
    },

    // Sıralama
    finalMeetings() {
      const list = [...this.filteredMeetings];
      const parseDT = (m) => new Date(`${m.date}T${m.startTime}`).getTime();

      if (this.sortKey === "timeAsc")  return list.sort((a, b) => parseDT(a) - parseDT(b));
      if (this.sortKey === "timeDesc") return list.sort((a, b) => parseDT(b) - parseDT(a));
      if (this.sortKey === "titleAz")  return list.sort((a, b) => a.title.localeCompare(b.title, "tr"));
      return list;
    },
  },

  created() {
    // geri sayım/“devam ediyor” rozetini tazelemek için
    this.nowTimer = setInterval(() => this.$forceUpdate(), 30000);
    // route senkron
    this._applyFiltersFromRoute();
  },
  beforeDestroy() {
    if (this.nowTimer) clearInterval(this.nowTimer);
  },

  watch: {
    '$route.query': {
      handler() { this._applyFiltersFromRoute(); }
    },
    search(newVal) { this._updateQuery({ search: newVal || undefined }); },
    dateFilter(newVal) { this._updateQuery({ date: newVal || undefined }); },
    sortKey(newVal) { this._updateQuery({ sort: newVal || undefined }); },
    statusSet(newVal) {
      const q = { ...this.$route.query };
      if (newVal && newVal.length) q.status = newVal.join(",");
      else delete q.status;
      this._updateQuery(q);
    }
  },

  methods: {
    ...mapActions("meetings", ["addAgendaItem", "updateMeetingStatus"]),

    // Query senkronizasyonu
    _applyFiltersFromRoute() {
      const q = this.$route.query;

      // search
      this.search = typeof q.search === "string" ? q.search : "";

      // dateFilter
      const allowedDates = ["all", "today", "week"];
      this.dateFilter = allowedDates.includes(q.date) ? q.date : "all";

      // sortKey
      const allowedSorts = ["timeAsc", "timeDesc", "titleAz"];
      this.sortKey = allowedSorts.includes(q.sort) ? q.sort : "timeAsc";

      // statusSet
      const rawStatus = q.status;
      const allowedStatuses = this.activeStatusOptions.map(o => o.value);
      if (!rawStatus) {
        this.statusSet = ["Onaylandi", "Beklemede"];
      } else {
        const incoming = Array.isArray(rawStatus) ? rawStatus : String(rawStatus).split(',');
        this.statusSet = incoming.map(s => s.trim()).filter(s => allowedStatuses.includes(s));
      }
    },

    _updateQuery(newParams) {
      const current = { ...this.$route.query };
      const updated = { ...current, ...newParams };

      // boş değerleri temizle
      Object.keys(updated).forEach((k) => {
        if (
          updated[k] === "" ||
          updated[k] === null ||
          typeof updated[k] === "undefined" ||
          (Array.isArray(updated[k]) && !updated[k].length)
        ) {
          delete updated[k];
        }
      });

      this.$router.replace({ query: updated }).catch(() => {});
    },

    // Görsel yardımcılar / mapping
    getUserName(id) {
      const user = this.getUserById(id);
      return user ? user.name : "Bilinmeyen";
    },
    getRoomName(roomId) {
      const room = this.getRoomById(roomId);
      return room ? room.name : "Bilinmeyen Salon";
    },

    // MeetingCardBase -> features/can/events
    canAddAgenda(meeting) {
      const uid = this.user?.id;
      const related =
        uid === meeting.ownerId ||
        (meeting.participants || []).includes(uid);

      const end = new Date(`${meeting.date}T${meeting.endTime}`);
      const notEnded = end > new Date();

      return related && meeting.status === "Onaylandi" && notEnded;
    },
    canOwnerCancel(meeting) {
      if (meeting.status !== "Onaylandi") return false;
      if (this.user?.id !== meeting.ownerId) return false;
      const start = new Date(`${meeting.date}T${meeting.startTime}`);
      return new Date() < start;
    },

    async onAddAgenda({ meetingId, text }) {
      try {
        await this.addAgendaItem({ meetingId, text, userId: this.user.id });
        this.$bvToast.toast("Gündem maddesi eklendi.", { title: "Başarılı", variant: "success", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "İşlem başarısız.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    async onOwnerCancel({ meeting }) {
      const ok = await this.$bvModal.msgBoxConfirm(
        "Bu toplantıyı iptal etmek istediğinize emin misiniz?",
        { title: "Onay", size: "sm", okVariant: "danger", okTitle: "Evet, İptal Et", cancelTitle: "Vazgeç" }
      );
      if (!ok) return;

      try {
        await this.updateMeetingStatus({ id: meeting.id, status: "Iptal" });
        this.$bvToast.toast("Toplantı iptal edildi.", { title: "Bilgi", variant: "warning", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "İşlem başarısız. Yetkiniz olmayabilir.", { title: "Hata", variant: "danger", solid: true });
      }
    },

    // Durum rozeti rengi (opsiyonel override)
    statusColor(status) {
      return {
        Onaylandi: "success",
        Reddedildi: "danger",
        Beklemede: "warning",
        Iptal: "secondary",
        "İptal Edildi": "secondary",
      }[status] || "secondary";
    },

    _startOfWeekISO() {
      const d = new Date();
      const day = d.getDay() || 7; // Pazartesi=1
      if (day > 1) d.setDate(d.getDate() - (day - 1));
      return d.toISOString().split("T")[0];
    },
    _endOfWeekISO() {
      const d = new Date(this._startOfWeekISO());
      d.setDate(d.getDate() + 6);
      return d.toISOString().split("T")[0];
    },
  },
};
</script>

<style scoped lang="scss">
.meeting-list { font-family: "Poppins", sans-serif; }

.header-card {
  background-color: #f0f6fb;
  border-radius: 12px;
  padding: 1.5rem 1.5rem;
  border-left: 5px solid #002855;
}

.meeting-card {
  border-radius: 14px;
  transition: all 0.2s ease-in-out;
  cursor: default;
  border-left: 5px solid #0093d1 !important;
}
.meeting-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.text-subu { color: #002855; }
.border-left-subu { border-left: 5px solid #0093d1 !important; }

.btn-subu,
.btn-subu:hover { background-color: #0093d1; border-color: #0093d1; color: #fff; }

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

.segmented .btn {
  border-color: #d9e6ef;
  background: #f8fbff;
  color: #003f91;
}
.segmented .btn.active,
.segmented .btn[aria-pressed="true"] {
  background: #0093d1;
  border-color: #0093d1;
  color: #fff;
  box-shadow: 0 0 0 0.05rem rgba(0,147,209,0.35);
}

@media (max-width: 767.98px) {
  .filter-bar { padding: 1rem; }
}

.text-header {
  font-size: 0.9rem;
  text-align: center;
  display: block;
  align-content: center;
  color: #6c757d;
}

/* Özet kart kapsayıcısı */
.summary-cards-wrapper {
  display: flex;
  justify-content: center;

  > * {
    width: 120%;
    max-width: 1800px; /* Bootstrap container hissi */
    padding: 0 1rem;
  }
}
</style>
