<template>
  <div class="all-meetings">
    <!-- Başlık -->
    <ui-header-card icon="list-ul" title=" Tüm Toplantılar">
      <span class="text-header small mb-3">Durum, salon, tarih ve sıralama ile listeyi daraltabilirsiniz.</span>
    </ui-header-card>

    <!-- Özet Kartları (filtrelerle senkron) -->
    <div class="summary-cards-wrapper">
      <SummaryCards :items="meetingStatusCounts" />
    </div>

    <!-- Tablo + Filtreler -->
    <b-card class="p-3 shadow-sm border-left-right-subu">
      <!-- Satır 1: Arama + Salon + Sıralama -->
      <b-row class="align-items-end">
        <!-- Arama -->
        <b-col cols="12" md="5" class="mb-2 mb-md-0">
          <label class="filter-label">Arama</label>
          <UiSearchInput v-model="q" placeholder="Başlık, gündem…" />
        </b-col>

        <!-- Salon -->
        <b-col cols="12" md="4" class="mb-2 mb-md-0">
          <label class="filter-label">Salon</label>
          <UiSelect v-model="roomId" :options="roomOptions" size="sm" />
        </b-col>

        <!-- Sıralama -->
        <b-col cols="12" md="3">
          <label class="filter-label">Sıralama</label>
          <UiSortSelect v-model="sortKey" :options="sortOptions" />
        </b-col>
      </b-row>

      <!-- Satır 2: Tarih Aralığı + Durum Butonları -->
      <b-row class="align-items-end mt-3 mb-4 filter-label">
        <UiDateRange :from.sync="fromDate" :to.sync="toDate" size="sm" />
        <UiStatusFilter
          v-model="activeStatuses"
          :options="statusOptions"
          size="sm"
          @reset="resetFilters"
        />
      </b-row>

      <div v-if="pagedItems.length === 0" class="text-muted text-center py-4">
        Kriterlere uygun toplantı bulunamadı.
      </div>

      <MeetingsTable
        v-else
        :rows="pagedItems"
        :showActions="true"
        :stickyHeader="'60vh'"
        :sortBy="'date'"
        :sortDesc="false"
        role="UstMakam"
        :permissions="['MEETING_APPROVE','MEETING_OVERRIDE_CANCEL']"
        :actionConfig="{ approveReject: true, cancel: true }"
        @approve="approve"
        @reject="reject"
        @cancel="overrideCancel"
      />

      <!-- Sayfalama -->
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import UiHeaderCard from "@/components/ui/header/UiHeaderCard.vue";
import UiSearchInput from "@/components/ui/filters/UiSearchInput.vue";
import UiSortSelect from "@/components/ui/filters/UiSortSelect.vue";
import UiSelect from "@/components/ui/filters/UiSelect.vue";
import UiTableFooter from "@/components/ui/footer/UiTableFooter.vue";
import MeetingsTable from "@/components/ui/tables/MeetingsTable.vue";
import UiDateRange from "@/components/ui/filters/UiDateRange.vue";
import UiStatusFilter from "@/components/ui/filters/UiStatusFilter.vue";
import SummaryCards from "@/components/ui/cards/SummaryCards.vue";

export default {
  name: "UstMakamAll",
  components: {
    UiHeaderCard,
    UiSearchInput,
    UiSortSelect,
    UiSelect,
    UiTableFooter,
    MeetingsTable,
    UiDateRange,
    UiStatusFilter,
    SummaryCards,
  },

  data() {
    return {
      q: "",
      roomId: null,
      fromDate: null,
      toDate: null,
      activeStatuses: ["Beklemede", "Onaylandi", "Reddedildi", "Iptal"],
      sortKey: "timeAsc",
      page: 1,
      perPage: 10,

      perPageOptions: [
        { value: 10, text: "10" },
        { value: 20, text: "20" },
        { value: 50, text: "50" },
      ],
    };
  },

  computed: {
    ...mapGetters("meetings", ["allMeetings"]),
    ...mapGetters("rooms", ["allRooms", "getRoomById"]),
    ...mapGetters("users", ["allUsers", "getUserById"]),

    roomOptions() {
      return [{ value: null, text: "Tüm Salonlar" }].concat(
        this.allRooms.map((r) => ({ value: r.id, text: r.name }))
      );
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
        { value: "timeAsc",  text: "Tarih/Saat (Artan)" },
        { value: "timeDesc", text: "Tarih/Saat (Azalan)" },
        { value: "titleAz",  text: "Başlık (A → Z)" },
        { value: "status",   text: "Durum (A → Z)" },
      ];
    },

    // Filtrelenmiş liste
    filtered() {
      const term = this.q.toLowerCase();
      let list = this.allMeetings.filter((m) => {
        const hay = `${m.title} ${m.agenda || ""}`.toLowerCase();
        if (term && !hay.includes(term)) return false;
        if (this.roomId && m.roomId !== this.roomId) return false;
        if (!this.activeStatuses.includes(m.status)) return false;
        if (this.fromDate && m.date < this.fromDate) return false;
        if (this.toDate && m.date > this.toDate) return false;
        return true;
      });

      const parseDT = (m) => new Date(`${m.date}T${m.startTime}`).getTime();
      if (this.sortKey === "timeAsc") list.sort((a, b) => parseDT(a) - parseDT(b));
      if (this.sortKey === "timeDesc") list.sort((a, b) => parseDT(b) - parseDT(a));
      if (this.sortKey === "titleAz") list.sort((a, b) => a.title.localeCompare(b.title, "tr"));
      if (this.sortKey === "status") list.sort((a, b) => a.status.localeCompare(b.status, "tr"));

      return list;
    },

    // Özet kartlar (filtrelerle senkron)
    meetingStatusCounts() {
      const counts = { Onaylandi: 0, Beklemede: 0, Reddedildi: 0, Iptal: 0 };
      this.filtered.forEach((m) => {
        if (counts[m.status] !== undefined) counts[m.status]++;
      });
      return [
        { key: "approved",  title: "Onaylanan",  value: counts.Onaylandi,  icon: "check-circle",    color: "#27ae60" },
        { key: "pending",   title: "Beklemede",  value: counts.Beklemede,  icon: "hourglass-split", color: "#f1c40f" },
        { key: "rejected",  title: "Reddedilen", value: counts.Reddedildi, icon: "x-circle",        color: "#e74c3c" },
        { key: "canceled",  title: "İptal",      value: counts.Iptal,      icon: "slash-circle",    color: "#7f8c8d" },
      ];
    },

    // Sayfalama
    pagedItems() {
      const start = (this.page - 1) * this.perPage;
      const end = start + this.perPage;
      return this.filtered.slice(start, end).map((m) => ({
        id: m.id,
        title: m.title,
        owner: this.getUserById(m.ownerId)?.name || "Bilinmeyen",
        room: this.getRoomById(m.roomId)?.name || "-",
        date: m.date,
        time: `${m.startTime} - ${m.endTime}`,
        status: m.status,
      }));
    },

    totalPages() {
      return Math.ceil(this.filtered.length / this.perPage);
    },
  },

  watch: {
    q(newVal)        { this._updateQueryParam("q", newVal); },
    roomId(newVal)   { this._updateQueryParam("room", newVal); },
    fromDate(newVal) { this._updateQueryParam("from", newVal); },
    toDate(newVal)   { this._updateQueryParam("to", newVal); },
    sortKey(newVal)  { this._updateQueryParam("sort", newVal); },
    activeStatuses(newVal) {
      const val = (newVal && newVal.length) ? newVal.join(",") : null;
      this._updateQueryParam("status", val);
    },
    page(newVal) {
      if (Number.isInteger(newVal)) this._updateQueryParam("page", newVal.toString());
    },
    // filtre değişince sayfayı resetle
    filtered() {
      if (this.page > this.totalPages) this.page = 1;
    },
  },

  mounted() {
    const q = this.$route.query;

    this.q = q.q || "";
    this.roomId = q.room || null;
    this.fromDate = q.from || null;
    this.toDate = q.to || null;

    if (this.sortOptions.some((o) => o.value === q.sort)) this.sortKey = q.sort;
    if (q.page && !isNaN(Number(q.page))) this.page = parseInt(q.page);

    const allowedStatuses = this.statusOptions.map((s) => s.value);
    if (q.status) {
      const statuses = String(q.status).split(",").filter((s) => allowedStatuses.includes(s));
      this.activeStatuses = statuses.length ? statuses : allowedStatuses;
    }
  },

  methods: {
    ...mapActions("meetings", ["updateMeetingStatus", "sendMeetingNotification"]),

    _updateQueryParam(key, value) {
      const query = { ...this.$route.query };
      if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) delete query[key];
      else query[key] = value;
      this.$router.replace({ query }).catch(() => {});
    },

    resetFilters() {
      this.q = "";
      this.roomId = null;
      this.fromDate = null;
      this.toDate = null;
      this.sortKey = "timeAsc";
      this.activeStatuses = this.statusOptions.map((x) => x.value);
      this.page = 1;
      this.$router.replace({ query: {} }).catch(() => {});
    },

    // MeetingsTable event handlers
    async approve(id) {
      try {
        await this.updateMeetingStatus({ id, status: "Onaylandi" });
        await this.sendMeetingNotification({ meetingId: id, type: "approved" });
        this.$bvToast.toast("Toplantı onaylandı.", { title: "Başarılı", variant: "success", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "İşlem başarısız.", { title: "Hata", variant: "danger", solid: true });
      }
    },
    async reject(id) {
      try {
        await this.updateMeetingStatus({ id, status: "Reddedildi" });
        await this.sendMeetingNotification({ meetingId: id, type: "rejected" });
        this.$bvToast.toast("Toplantı reddedildi.", { title: "Bilgi", variant: "warning", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "İşlem başarısız.", { title: "Hata", variant: "danger", solid: true });
      }
    },
    async overrideCancel(id) {
      const ok = await this.$bvModal.msgBoxConfirm(
        "Toplantıyı iptal etmek istediğinize emin misiniz?",
        { title: "Onay", size: "sm", okVariant: "danger", okTitle: "Evet, İptal Et", cancelTitle: "Vazgeç" }
      );
      if (!ok) return;
      try {
        await this.updateMeetingStatus({ id, status: "Iptal" });
        await this.sendMeetingNotification({ meetingId: id, type: "canceled" });
        this.$bvToast.toast("Toplantı iptal edildi.", { title: "Override", variant: "warning", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "İşlem başarısız.", { title: "Hata", variant: "danger", solid: true });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.all-meetings { font-family: "Poppins", sans-serif; }

.header-card {
  background-color: #f0f6fb;
  border-radius: 12px;
  padding: 1.5rem 1.5rem;
  border-left: 5px solid #002855;
}

.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }

.filter-card {
  border-radius: 14px;
  background: #ffffff;
  border-left: 5px solid #0093d1;
  padding: 1rem 1.25rem;
}
.filter-label { font-size: .8rem; color: #6b7280; }

.input-elevated {
  border-radius: 12px; overflow: hidden;
  .input-group-text { background: #f6f9fc; border: 1px solid #e6edf3; }
  .form-control, .custom-select { border: 1px solid #e6edf3; background: #fff; }
}

.segmented .seg-btn { margin-right: .5rem; }
.text-header { font-size: 0.9rem; text-align: center; display: block; color: #6c757d; }

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
