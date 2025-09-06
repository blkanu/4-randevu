<template>
  <div class="history-page">
    <!-- Üst Başlık + Filtreler -->
    <ui-header-card icon="clock-history" title="Geçmiş Toplantılar">
      <span class="text-header small mb-3">Daha önce gerçekleşen toplantılarınızı görüntülüyorsunuz.</span>

      <b-row class="align-items-center">
        <!-- Arama -->
        <b-col cols="12" md="4" class="mb-2 mb-md-0">
          <UiSearchInput
            v-model="search"
            placeholder="Başlık, gündem veya sahip adına göre ara…"
          />
        </b-col>

        <!-- Tarih filtresi -->
        <b-col cols="12" md="3" class="mb-2 mb-md-0">
          <UiSegmented
            v-model="dateFilter"
            :options="[
              { value: 'all', text: 'Tümü' },
              { value: '7',   text: 'Son 7 Gün' },
              { value: '30',  text: 'Son 30 Gün' },
            ]"
          />
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
        <b-col cols="12" md="3">
          <UiSortSelect v-model="sortKey" :options="sortOptions" />
        </b-col>
      </b-row>
    </ui-header-card>

    <!-- Özet Kartları -->
    <div class="summary-cards-wrapper">
      <SummaryCards :items="meetingStatusCounts" />
    </div>

    <!-- Toplantı Kartları -->
    <div v-for="meeting in finalMeetings" :key="meeting.id" class="mb-4">
      <MeetingCardBase
        :meeting="meeting"
        :display="{
          participantsMode: 'names',   // History'de isimleri göster
          showOwner: true,
          showCountdown: false,        // geçmiş için geri sayım yok
          showStatusBadge: true
        }"
        :features="{
          addAgenda: false,
          ownerCancel: false,
          overrideCancel: false
        }"
        :helpers="{
          getUserName,
          getRoomName,
          statusColor
        }"
      >
        <!-- History'e özgü: Karar Bloğu -->
        <template #extra>
          <DecisionBlock
            :decision-obj="getMeetingDecisionObject(meeting.id)"
            :decision-text-exists="!!getMeetingDecision(meeting.id)"
            :can-edit="isOwner(meeting) && !getMeetingDecision(meeting.id)"
            :format-date="formatDate"
            @save="(text) => submitDecisionProxy(meeting, text)"
          />
        </template>
      </MeetingCardBase>
    </div>

    <b-alert show variant="info" v-if="finalMeetings.length === 0">
      Geçmiş toplantınız bulunmamaktadır.
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
import DecisionBlock from "@/components/meetings/panels/DecisionBlock.vue";
import MeetingCardBase from "@/components/meetings/base/MeetingCardBase.vue";
import { MEETING_STATUS } from "@/utils/constants";

export default {
  name: "HistoryPage",
  components: {
    UiHeaderCard,
    UiSearchInput,
    UiSegmented,
    UiSortSelect,
    UiStatusMulti,
    SummaryCards,
    DecisionBlock,
    MeetingCardBase
  },
  data() {
    return {
      search: "",
      dateFilter: "all", // all | 7 | 30
      statusSet: [],     // seçili durumlar
      sortKey: "timeDesc",
      newDecisionTexts: {},
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    ...mapGetters("users", ["getUserById"]),
    ...mapGetters("rooms", ["getRoomById"]),
    ...mapGetters("meetings", ["pastMeetings"]),
    ...mapGetters("decisions", ["getDecisionsByMeetingId"]),

    // Kullanıcıya ait geçmiş toplantılar
    userPastMeetings() {
      const uid = this.user?.id;
      if (!uid) return [];
      return this.pastMeetings.filter(
        (m) => m.ownerId === uid || (m.participants || []).includes(uid)
      );
    },

    // Özet kart verileri
    meetingStatusCounts() {
      const approved  = this.userPastMeetings.filter(m => m.status === MEETING_STATUS.ONAYLANDI).length;
      const pending   = this.userPastMeetings.filter(m => m.status === MEETING_STATUS.BEKLEMEDE).length;
      const rejected  = this.userPastMeetings.filter(m => m.status === MEETING_STATUS.REDDEDILDI).length;
      const cancelled = this.userPastMeetings.filter(m => m.status === MEETING_STATUS.IPTAL).length;
      return [
        { key: "approved",  title: "Onaylanan",  value: approved,  icon: "check-circle",    color: "#27ae60" },
        { key: "pending",   title: "Beklemede",  value: pending,   icon: "hourglass-split", color: "#f1c40f" },
        { key: "rejected",  title: "Reddedilen", value: rejected,  icon: "x-circle",        color: "#e74c3c" },
        { key: "cancelled", title: "İptal",      value: cancelled, icon: "slash-circle",    color: "#7f8c8d" },
      ];
    },

    sortOptions() {
      return [
        { value: "timeDesc", text: "Zamana Göre (Yeni → Eski)" },
        { value: "timeAsc",  text: "Zamana Göre (Eski → Yeni)" },
        { value: "titleAz",  text: "Başlık (A → Z)" },
      ];
    },

    activeStatusOptions() {
      return [
        { value: MEETING_STATUS.ONAYLANDI,  text: MEETING_STATUS.ONAYLANDI },
        { value: MEETING_STATUS.BEKLEMEDE,  text: MEETING_STATUS.BEKLEMEDE },
        { value: MEETING_STATUS.REDDEDILDI, text: MEETING_STATUS.REDDEDILDI },
        { value: MEETING_STATUS.IPTAL,      text: MEETING_STATUS.IPTAL },
      ];
    },

    // Arama + tarih + durum filtreleri
    filteredMeetings() {
      const term = this.search.trim().toLowerCase();
      const now = new Date();
      const endDT = (m) => new Date(`${m.date}T${m.endTime}`);

      // Tarih alt sınırı
      let lowerBound = null;
      if (this.dateFilter === "7")  { const d = new Date(now); d.setDate(d.getDate() - 7);  lowerBound = d; }
      if (this.dateFilter === "30") { const d = new Date(now); d.setDate(d.getDate() - 30); lowerBound = d; }

      return this.userPastMeetings.filter((m) => {
        // metin arama
        const ownerName = (m.owner?.name || this.getUserName(m.ownerId) || "").toLowerCase();
        const haystack = `${m.title} ${(m.agenda || "")} ${ownerName}`.toLowerCase();
        if (term && !haystack.includes(term)) return false;

        // tarih (geçmiş penceresi)
        const end = endDT(m);
        if (!(end < now)) return false; // gerçekten geçmiş olmalı
        if (lowerBound && (end < lowerBound || end > now)) return false;

        // durum
        if (this.statusSet.length && !this.statusSet.includes(m.status)) return false;

        return true;
      });
    },

    // Sıralama
    finalMeetings() {
      const list = [...this.filteredMeetings];
      const parseStart = (m) => new Date(`${m.date}T${m.startTime}`).getTime();

      if (this.sortKey === "timeDesc") return list.sort((a, b) => parseStart(b) - parseStart(a));
      if (this.sortKey === "timeAsc")  return list.sort((a, b) => parseStart(a) - parseStart(b));
      if (this.sortKey === "titleAz")  return list.sort((a, b) => a.title.localeCompare(b.title, "tr"));
      return list;
    },
  },

  watch: {
    // URL query ile senkron (isteğe bağlı)
    '$route.query': {
      immediate: true,
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
    ...mapActions("decisions", ["addDecision"]),

    // Query senkronizasyonu (opsiyonel ama faydalı)
    _applyFiltersFromRoute() {
      const q = this.$route.query;

      // search
      this.search = typeof q.search === "string" ? q.search : "";

      // dateFilter
      const allowedDates = ["all", "7", "30"];
      this.dateFilter = allowedDates.includes(q.date) ? q.date : "all";

      // sortKey
      const allowedSorts = ["timeDesc", "timeAsc", "titleAz"];
      this.sortKey = allowedSorts.includes(q.sort) ? q.sort : "timeDesc";

      // statusSet
      const rawStatus = q.status;
      const allowedStatuses = this.activeStatusOptions.map(o => o.value);
      if (!rawStatus) {
        this.statusSet = [];
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
    getParticipantNames(ids) {
      return (ids || []).map(this.getUserName).join(", ");
    },

    // Decision akışı
    isOwner(meeting) { return meeting.ownerId === this.user.id; },
    getMeetingDecision(meetingId) {
      const decisions = this.getDecisionsByMeetingId(meetingId);
      return decisions.length ? decisions[0].description : null;
    },
    getMeetingDecisionObject(meetingId) {
      const decisions = this.getDecisionsByMeetingId(meetingId);
      return decisions.length ? decisions[0] : null;
    },
    submitDecision(meeting) {
      const text = this.newDecisionTexts[meeting.id]?.trim();
      if (!text) return;
      this.addDecision({ meetingId: meeting.id, description: text, createdAt: new Date().toISOString() });
      this.$set(this.newDecisionTexts, meeting.id, "");
      this.$bvToast.toast("Toplantı kararı başarıyla kaydedildi.", {
        title: "Başarılı", variant: "success", solid: true
      });
    },
    submitDecisionProxy(meeting, text) {
      this.$set(this.newDecisionTexts, meeting.id, text);
      this.submitDecision(meeting);
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
    },

    // Durum rozet rengi
    statusColor(s) {
      const colors = {
        [MEETING_STATUS.ONAYLANDI]: "success",
        [MEETING_STATUS.REDDEDILDI]: "danger",
        [MEETING_STATUS.BEKLEMEDE]: "warning",
        [MEETING_STATUS.IPTAL]: "secondary",
      };
      return colors[s] || "secondary";
    },
  },
};
</script>

<style scoped lang="scss">
.history-page { font-family: "Poppins", sans-serif; }

.header-card {
  background-color: #f0f6fb;
  border-radius: 12px;
  padding: 1.5rem 1.5rem;
  border-left: 5px solid #002855;
}

.meeting-card {
  border-radius: 14px;
  transition: all 0.2s ease-in-out;
  border-left: 5px solid #0093d1 !important;
}
.meeting-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }

.btn-subu,
.btn-subu:hover { background-color: #0093d1; border-color: #0093d1; color: #fff; }

.text-header {
  font-size: 0.9rem;
  text-align: center;
  display: block;
  color: #6c757d;
}

/* Özet kart kapsayıcısı */
.summary-cards-wrapper {
  display: flex;
  justify-content: center;
  > * {
    width: 120%;
    max-width: 1800px;
    padding: 0 1rem;
  }
}
</style>
