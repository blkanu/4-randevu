<!-- src/views/UstMakamDashboard.vue -->
<template>
  <div class="dashboard">
    <!-- Başlık + Salon Filtresi -->
    <b-card class="welcome-card mb-4 d-flex flex-column align-items-center text-center">
      <div class="mb-2">
        <h4 class="mb-1 text-subu font-weight-bold">
          <b-icon icon="person-circle"></b-icon> Üst Düzey Yönetici Paneli
        </h4>
        <small class="text-muted">Toplantı oluşturabilir, onaylayabilir ve iptal edebilirsiniz.</small>
      </div>
      <UiSelect
  v-model="selectedRoomId"
  :options="roomOptions"
  class="mt-2"
  clearable
  query-key="room"
/>

    </b-card>

    <WelcomeModal />

    <!-- Kartlar -->
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
          :route="c.route"
          @navigate="onNavigate"
        />
      </b-col>
    </b-row>

    <!-- Sizin Yaklaşan Toplantılarınız -->
    <b-card class="mt-4 p-3 shadow-sm border-left-right-subu">
      <h5 class="mb-3 text-subu font-weight-bold">
        <b-icon icon="calendar2-check"></b-icon> Yaklaşan Toplantılar
      </h5>

      <div v-if="upcomingForUser.length">
        <b-row>
          <b-col
            cols="12" md="6" lg="4"
            v-for="m in upcomingForUser"
            :key="m.id"
            class="mb-3"
          >
            <!-- ActiveMeetingCardCompat -->
            <MeetingCard
              :id="m.id"
              :title="m.title"
              :status="m.status"
              :ownerName="getUserById(m.ownerId)?.name || 'Bilinmeyen'"
              :roomName="getRoomName(m.roomId)"
              :date="m.date"
              :startTime="m.startTime"
              :endTime="m.endTime"
              :participantsCount="Array.isArray(m.participants) ? m.participants.length : Number(m.participants || 0)"
              :agenda="m.agenda"
              :agendaItems="m.agendaItems || []"
              :ongoing="isOngoing(m)"
              :enableOwnerCancel="false"
              :enableOverrideCancel="canOverrideCancel(m)"
              @override-cancel="() => overrideCancel(m.id)"
            />
          </b-col>
        </b-row>
      </div>
      <div v-else class="text-muted text-center py-3">
        Önümüzdeki 7 gün içinde size ait onaylanmış toplantı bulunmuyor.
      </div>
    </b-card>

    <!-- Tüm Salonlar: Yaklaşan Toplantılar -->
    <b-card class="mt-2 p-3 shadow-sm border-left-right-subu">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="mb-0 text-subu font-weight-bold">
          <b-icon icon="calendar3"></b-icon>
          Görüntülenen Diğer Toplantılar —
          <small class="text-muted">{{ selectedRoomName || 'Tüm Salonlar' }}</small>
        </h5>
      </div>

<MeetingsTable
  :rows="tableUpcomingAll"  
  :showActions="true"
  :showCountdown="true"
  :stickyHeader="'60vh'"
  :sortBy="'date'"
  :sortDesc="false"
  role="UstMakam"
  :permissions="['MEETING_OVERRIDE_CANCEL']"
  :actionConfig="{ approveReject: false, cancel: true }"
  @cancel="overrideCancel"
/>


      <div v-if="!tableUpcomingAll.length" class="text-muted text-center py-3">
        Önümüzdeki 7 gün içinde sistemde onaylanmış toplantı bulunmuyor.
      </div>
    </b-card>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import StatCard from '@/components/ui/cards/StatCard.vue';
import WelcomeModal from '@/components/ui/modals/UiWelcomeModal.vue';
import MeetingsTable from '@/components/ui/tables/MeetingsTable.vue';
import UiSelect from '@/components/ui/filters/UiSelect.vue';

/**
 * Bu import, compat (ActiveMeetingCardCompat) sürümüdür.
 * İçeride MeetingCardBase kullanır, flat props'ları map'ler.
 * Diğer sayfalar etkilenmez.
 */
import MeetingCard from '@/components/meetings/cards/ActiveMeetingCard.vue';

export default {
  name: 'UstMakamDashboard',
  components: { StatCard, WelcomeModal, MeetingCard, MeetingsTable, UiSelect },

  data() {
    return {
      selectedRoomId: null,
      tick: 0,
      tickTimer: null,
    };
  },

  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('meetings', ['allMeetings']),
    ...mapGetters('rooms', ['allRooms', 'getRoomById']),
    ...mapGetters('users', ['getUserById']),

    // Üst makam/yetki tespiti
    isUstMakam() {
      const u = this.user || {};
      return (
        u.role === 'UstMakam' ||
        (Array.isArray(u.roles) && u.roles.includes('UST_MAKAM')) ||
        (Array.isArray(u.permissions) && u.permissions.includes('MEETING_OVERRIDE_CANCEL'))
      );
    },

    roomOptions() {
      return [{ value: null, text: 'Tüm Salonlar' }].concat(
        this.allRooms.map(r => ({ value: r.id, text: r.name }))
      );
    },

    selectedRoomName() {
      if (!this.selectedRoomId) return '';
      return this.getRoomById(this.selectedRoomId)?.name || '';
    },

    scopedMeetings() {
      return this.selectedRoomId
        ? this.allMeetings.filter(m => m.roomId === this.selectedRoomId)
        : this.allMeetings;
    },

    counts() {
      const s = this.scopedMeetings;
      const by = st => s.filter(m => m.status === st).length;
      const activeRooms = this.allRooms.filter(r => r.status === 'Aktif').length;
      return {
        pending: by('Beklemede'),
        approved: by('Onaylandi'),
        rejected: by('Reddedildi'),
        canceled: by('Iptal'),
        total: s.length,
        activeRooms
      };
    },

    cards() {
      const roomQuery = this.selectedRoomId ? `&room=${this.selectedRoomId}` : '';
      return [
        { title: 'Onay Bekleyenler', value: this.counts.pending, icon: 'hourglass-split', color: '#f39c12', route: `/ustmakam/all?status=Beklemede${roomQuery}` },
        { title: 'Onaylanan', value: this.counts.approved, icon: 'check2-circle', color: '#27ae60', route: `/ustmakam/all?status=Onaylandi${roomQuery}` },
        { title: 'Reddedilen', value: this.counts.rejected, icon: 'x-circle', color: '#e74c3c', route: `/ustmakam/all?status=Reddedildi${roomQuery}` },
        { title: 'İptal', value: this.counts.canceled, icon: 'slash-circle', color: '#7f8c8d', route: `/ustmakam/all?status=Iptal${roomQuery}` },
        { title: 'Tüm Toplantılar', value: this.counts.total, icon: 'list-ul', color: '#8e44ad', route: `/ustmakam/all${roomQuery}` },
        { title: 'Aktif Salonlar', value: this.counts.activeRooms, icon: 'building', color: '#5d6d7e', route: `/ustmakam/rooms` },
        { title: 'Aktif Toplantılarım', value: this.upcomingForUser.length, icon: 'calendar3', color: '#0093D1', route: `/user/meetings` },
        { title: 'Yeni Toplantı', value: 'Oluştur', icon: 'plus-circle', color: '#002855', route: `/user/meeting-create` }
      ];
    },

    // 7 gün içindeki tüm onaylı (henüz bitmemiş) toplantılar
    upcomingAll() {
      const now = new Date();
      const in7 = new Date(); in7.setDate(now.getDate() + 7);
      const startDT = m => new Date(`${m.date}T${m.startTime}`);
      const endDT   = m => new Date(`${m.date}T${m.endTime}`);
      return this.scopedMeetings
        .filter(m => m.status === 'Onaylandi' && endDT(m) > now && startDT(m) <= in7)
        .sort((a, b) => startDT(a) - startDT(b));
    },

    // MeetingsTable satırları (geri sayım dahil)
    tableUpcomingAll() {
      // geri sayımı periyodik güncelleme için tetikle
      void this.tick;

      return this.upcomingAll.map(m => {
        const room  = this.getRoomById(m.roomId);
        const owner = this.getUserById(m.ownerId);

        return {
          id: m.id,
          title: m.title || '-',
          owner: owner?.name || 'Bilinmeyen',
          room: room?.name || '-',
          date: m.date || '-',
          time: `${m.startTime || '--:--'} - ${m.endTime || '--:--'}`,
          status: m.status,
          countdown: this.countdownText(m), // yeni kolon
          canApprove: false,
          canReject: false,
          canCancel: false,
          __raw: m, // actions slot’unda kullanacağız
        };
      });
    },

    // Kullanıcıya ait toplantılar (7 gün)
    upcomingForUser() {
      const uid = this.user?.id;
      const now = new Date();
      const in7 = new Date(); in7.setDate(now.getDate() + 7);
      const startDT = m => new Date(`${m.date}T${m.startTime}`);
      const endDT   = m => new Date(`${m.date}T${m.endTime}`);
      return this.allMeetings
        .filter(m =>
          m.status === 'Onaylandi' &&
          endDT(m) > now && startDT(m) <= in7 &&
          (m.ownerId === uid || (Array.isArray(m.participants) && m.participants.includes(uid)))
        )
        .map(m => ({
          ...m,
          role: m.ownerId === uid ? 'Sahibi' : 'Katılımcı',
          participants: Array.isArray(m.participants) ? m.participants.length : Number(m.participants || 0)
        }))
        .sort((a, b) => startDT(a) - startDT(b));
    }
  },

  created() {
    // geri sayım metnini 30sn'de bir tazelemek için
    this.tickTimer = setInterval(() => { this.tick++; }, 30000);
  },
  beforeDestroy() {
    if (this.tickTimer) clearInterval(this.tickTimer);
  },

  methods: {
    ...mapActions('meetings', ['updateMeetingStatus', 'sendMeetingNotification']),

    onNavigate(route) { if (route) this.$router.push(route); },
    getRoomName(id) { return this.getRoomById(id)?.name || '-'; },

    isOngoing(m) {
      const now = new Date();
      const s = new Date(`${m.date}T${m.startTime}`);
      const e = new Date(`${m.date}T${m.endTime}`);
      return now >= s && now < e;
    },

    hasStarted(m) {
      const now = new Date();
      const s = new Date(`${m.date}T${m.startTime}`);
      return now >= s;
    },

    cancelTitle(m) {
      if (m.status !== 'Onaylandi') return 'Sadece onaylı toplantılar iptal edilebilir.';
      if (this.hasStarted(m)) return 'Başlayan toplantılar iptal edilemez.';
      return 'Toplantıyı iptal et';
    },

    countdownText(m) {
      // reactive tetikleyici
      void this.tick;
      const now = new Date();
      const start = new Date(`${m.date}T${m.startTime}`);
      if (now >= start) return '';
      const mins = Math.round((start - now) / 60000);
      if (mins <= 0) return '';
      if (mins < 60) return `${mins} dk kaldı`;
      const h = Math.floor(mins / 60), r = mins % 60;
      return r ? `${h} sa ${r} dk kaldı` : `${h} saat kaldı`;
    },

    // Yalnızca üst makam ve başlamamış onaylı toplantılarda override iptal
    canOverrideCancel(m) {
      return this.isUstMakam && m.status === 'Onaylandi' && !this.hasStarted(m);
    },

    async overrideCancel(id) {
      const ok = await this.$bvModal.msgBoxConfirm(
        'Bu toplantıyı iptal etmek istediğinize emin misiniz?',
        { title: 'Onay', size: 'sm', okVariant: 'danger', okTitle: 'Evet, İptal Et', cancelTitle: 'Vazgeç' }
      );
      if (!ok) return;

      try {
        await this.updateMeetingStatus({ id, status: 'Iptal' });
        await this.sendMeetingNotification({ meetingId: id, type: 'canceled' });
        this.$bvToast.toast('Toplantı iptal edildi.', {
          title: 'Override', variant: 'warning', solid: true
        });
      } catch (e) {
        this.$bvToast.toast(e?.message || 'İşlem başarısız.', {
          title: 'Hata', variant: 'danger', solid: true
        });
      }
    }
  }
};
</script>

<style scoped lang="scss">
.dashboard { font-family: "Poppins", sans-serif; }
.text-subu { color: #002855; }
.border-left-right-subu {
  border-left: 5px solid #0093d1 !important;
  border-right: 5px solid #0093d1 !important;
}
.card-hover { transition: all .25s ease; }
.card-hover:hover { transform: translateY(-6px); box-shadow: 0 8px 20px rgba(0,0,0,.12); }
.icon-circle {
  background-color: rgba(255,255,255,.2);
  border-radius: 50%;
  padding: .6rem;
  display:flex; align-items:center; justify-content:center;
}
.welcome-card {
  background-color:#f0f6fb;
  border-left:5px solid #002855;
  border-radius:15px;
  padding:1.25rem 1.5rem;
  box-shadow:0 2px 6px rgba(0,0,0,.05);
}
.select-ghost { max-width: 240px; }
</style>
