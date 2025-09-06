<template>
  <div class="dashboard">
    <!-- Hoşgeldiniz Modal -->
    <!-- Hoşgeldiniz Modal (Bileşen) -->
    <WelcomeModal />

    <!-- Başlık Kartı -->
    <b-card class="welcome-card mb-4 d-flex align-items-center justify-content-between">
      <div>
        <h4 class="mb-0 text-subu font-weight-bold"><b-icon icon="building"></b-icon> Salon Yöneticisi Paneli</h4>
        <p class="mb-0 ms-2 text-center text-muted">
          <strong>Toplantı Salonu: </strong>{{ assignedRoom?.name || 'Tüm Salonlar' }}
        </p>
      </div>
    </b-card>

    <!-- Stat Kartları -->
    <b-row>
      <b-col cols="12" sm="6" md="4" lg="3" v-for="s in dashboardStats" :key="s.title" class="mb-4">
        <StatCard
          :title="s.title"
          :value="s.value"
          :icon="s.icon"
          :bg="s.bg"
          :route="s.route"
          @navigate="onNavigate"
        />
      </b-col>
    </b-row>

    <!-- Bekleyen Onaylar -->
    <b-card class="mt-2 p-3 shadow-sm border-left-right-subu">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0 text-subu font-weight-bold">
          <b-icon icon="hourglass-split"></b-icon> Onay Bekleyen Toplantılar
        </h5>
      </div>
      <!-- Bekleyen Onaylar -->
      <PendingApprovalsTable
        :rows="tablePending"
        @approve="approve"
        @reject="handleReject"
      />
      <div v-if="!tablePending || tablePending.length === 0" class="text-muted text-center py-3">
        Bekleyen onay yok.
      </div>

    </b-card>

    <!-- Son Toplantılar -->
    <b-card class="mt-4 p-3 shadow-sm border-left-right-subu">
      <h5 class="mb-3 text-subu font-weight-bold">
        <b-icon icon="calendar2"></b-icon> Son Toplantılar
      </h5>

      <MeetingsTable
        :rows="tableRecent"
        :showActions="false"
      />
      <div v-if="!tableRecent || tableRecent.length === 0" class="text-muted text-center py-3">
        Görüntülenecek toplantı yok.
      </div>

    </b-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { startDT, endDT } from '@/utils/datetime';
import StatCard from '@/components/ui/cards/StatCard.vue';
import WelcomeModal from '@/components/ui/modals/UiWelcomeModal.vue';
import PendingApprovalsTable from '@/components/ui/tables/PendingApprovalsTable.vue';
import MeetingsTable from '@/components/ui/tables/MeetingsTable.vue';

export default {
  name: 'AdminDashboard',
  components: { StatCard, WelcomeModal, PendingApprovalsTable, MeetingsTable },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('rooms', ['allRooms', 'getRoomById']),
    ...mapGetters('users', ['getUserById']),
    ...mapGetters('meetings', ['allMeetings']),
    assignedRoom() { return this.allRooms.find(r => r.adminId === this.user.id) || null; },
    scopeMeetings() { return this.assignedRoom ? this.allMeetings.filter(m => m.roomId === this.assignedRoom.id) : this.allMeetings; },
    pendingMeetings() { return this.scopeMeetings.filter(m => m.status === 'Beklemede'); },
    myMeetings() {
      const uid = this.user?.id; if (!uid) return [];
      return this.allMeetings.filter(m => m.ownerId === uid || (Array.isArray(m.participants) && m.participants.includes(uid)));
    },
    myActiveCount() {
      const now = new Date();
      return this.myMeetings.filter(m => (m.status === 'Onaylandi' && endDT(m) > now) || (m.status === 'Beklemede' && startDT(m) > now)).length;
    },
    myPastCount() {
      const now = new Date();
      return this.myMeetings.filter(m => endDT(m) <= now).length;
    },
    dashboardStats() {
      const s = this.scopeMeetings; const by = st => s.filter(m => m.status === st).length;
      const activeRoomsValue = this.allRooms.find(r => r.adminId === this.user.id) ? 1 : 'Tüm Salonlar';
      return [
        { title: 'Onay Bekleyenler', value: by('Beklemede'), icon: 'hourglass-split', bg: '#f39c12', route: '/admin/approvals' },
        { title: 'Reddedilen Toplantılar', value: by('Reddedildi'), icon: 'calendar-x', bg: '#e74c3c', route: '/admin/adminmeetings?status=Reddedildi' },
        { title: 'Onaylanan Toplantılar', value: by('Onaylandi'), icon: 'calendar-check', bg: '#27ae60', route: '/admin/adminmeetings?status=Onaylandi' },
        { title: 'Toplantı Listesi', value: s.length, icon: 'journal-text', bg: '#8e44ad', route: '/admin/adminmeetings' },
        { title: 'Aktif Salonlar', value: activeRoomsValue, icon: 'building', bg: '#5d6d7e', route: '/admin/rooms' },
        { title: 'Toplantı Planlayın', value: 'Yeni Toplantı Oluştur', icon: 'plus-circle', bg: '#002855', route: '/user/meeting-create' },
        { title: 'Aktif Toplantılar', value: this.myActiveCount, icon: 'calendar3', bg: '#0093D1', route: '/user/meetings' },
        { title: 'Geçmiş Toplantılar', value: this.myPastCount, icon: 'clock-history', bg: '#005d8f', route: '/user/history' }
      ];
    },
    tablePending() {
  return this.pendingMeetings.map(m => ({
    id: m.id,
    title: m.title,
    owner: this.getUserById(m.ownerId)?.name || 'Bilinmeyen',
    date: m.date,
    time: `${m.startTime} - ${m.endTime}`,
    room: this.getRoomById(m.roomId)?.name || '-',
    status: m.status,
    roomStatus: this.getRoomById(m.roomId)?.status || 'Bilinmiyor',
    isPastOrStarted: startDT(m) < new Date() // başlama zamanı geçmişse true
  }));
}
,
    recentMeetings() {
      const list = this.scopeMeetings; return [...list].sort((a,b) => startDT(b) - startDT(a)).slice(0,5);
    },
    tableRecent() {
      return this.recentMeetings.map(m => ({
        id: m.id,
        title: m.title,
        owner: this.getUserById(m.ownerId)?.name || 'Bilinmeyen',
        date: m.date,
        time: `${m.startTime} - ${m.endTime}`,
        room: this.getRoomById(m.roomId)?.name || '-',
        status: m.status
      }));
    },
    fieldsPending() {
      return [
        { key: 'title',   label: 'Toplantı' },
        { key: 'owner',   label: 'Sahibi'   },
        { key: 'room',    label: 'Salon'    },
        { key: 'date',    label: 'Tarih'    },
        { key: 'time',    label: 'Saat'     },
        { key: 'status',  label: 'Durum'    },
        { key: 'actions', label: 'İşlemler' }
      ];
    },
    fieldsRecent() {
      return [
        { key: 'title',  label: 'Toplantı' },
        { key: 'owner',  label: 'Sahibi'   },
        { key: 'room',   label: 'Salon'    },
        { key: 'date',   label: 'Tarih'    },
        { key: 'time',   label: 'Saat'     },
        { key: 'status', label: 'Durum'    }
      ];
    }
  },
  methods: {
    ...mapActions('meetings', ['updateMeetingStatus', 'sendMeetingNotification']),
    onNavigate(route) { if (route) this.$router.push(route); },
    async approve(id) {
      try {
        await this.updateMeetingStatus({ id, status: 'Onaylandi' });
        await this.sendMeetingNotification({ meetingId: id, type: 'approved' });
        this.$bvToast.toast('Toplantı onaylandı.', { title: 'Başarılı', variant: 'success', solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || 'Hata oluştu', { title: 'Hata', variant: 'danger', solid: true });
      }
    },
    async handleReject({ id, reason }) {
  try {
    await this.updateMeetingStatus({ id, status: 'Reddedildi', reason });
    await this.sendMeetingNotification({ meetingId: id, type: 'rejected', reason });
    this.$bvToast.toast('Toplantı reddedildi.', {
      title: 'İşlem',
      variant: 'warning',
      solid: true
    });
  } catch (e) {
    this.$bvToast.toast(e?.message || 'Hata oluştu', {
      title: 'Hata',
      variant: 'danger',
      solid: true
    });
  }
}

  },
  mounted() {
    const shown = localStorage.getItem('welcome_shown');
    if (!shown) { this.$bvModal.show('welcome-modal'); localStorage.setItem('welcome_shown', 'true'); }
  }
};
</script>

<style scoped lang="scss">
/* mevcut stiller aynen */
.dashboard { font-family: 'Poppins', sans-serif; }
.welcome-card { background-color:#f0f6fb; border-left:5px solid #002855; border-radius:15px; padding:1.25rem 1.5rem; box-shadow:0 2px 6px rgba(0,0,0,.05); }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }
.text-subu { color: #002855; }
</style>
