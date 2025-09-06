<template>
  <div class="dashboard">
    <!-- Hoşgeldiniz -->
    <b-card class="welcome-card mb-4">
      <h5 class="mb-0">
        Hoşgeldiniz, <span class="user-name">{{ user?.name || 'Kullanıcı' }}</span>!
      </h5>
    </b-card>

    <!-- Kartlar -->
    <b-row>
      <b-col cols="12" md="4" class="mb-4" v-for="card in dashboardCards" :key="card.title">
        <StatCard
          :title="card.title"
          :description="card.description"
          :icon="card.icon"
          :bg="card.color"
          :route="card.route"
          @navigate="goTo"
        />
      </b-col>
    </b-row>

    <!-- Yaklaşan / Devam Eden Toplantılar -->
    <b-card class="mt-4 p-3 shadow-sm border-left-right-subu">
      <h5 class="mb-3 text-subu font-weight-bold">Yaklaşan Toplantılar</h5>

      <div v-if="upcomingForUser.length">
        <b-row>
          <b-col cols="12" md="6" lg="4" v-for="m in upcomingForUser" :key="m.id" class="mb-3">
            <MeetingCard
              :id="m.id"
              :title="m.title"
              :status="m.status"
              :ownerName="getUserById(m.ownerId)?.name || 'Bilinmeyen'"
              :roomName="getRoomName(m.roomId)"
              :date="m.date"
              :startTime="m.startTime"
              :endTime="m.endTime"
              :participantsCount="Array.isArray(m.participants) ? m.participants.length : 0"
              :agenda="m.agenda"
              :ongoing="isOngoing(m)"
            />
          </b-col>
        </b-row>
      </div>

      <div v-else class="text-muted text-center py-3">
        Önümüzdeki 7 gün içinde planlı <strong>onaylanmış</strong> toplantınız bulunmamaktadır.
      </div>
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import StatCard from '@/components/ui/cards/StatCard.vue';
import MeetingCard from '@/components/meetings/cards/ActiveMeetingCard.vue'; // COMPAT sarmalayıcı

export default {
  name: 'UserDashboard',
  components: { StatCard, MeetingCard },
  computed: {
    ...mapGetters('auth', ['user']),
    ...mapGetters('meetings', ['allMeetings', 'pastMeetings']),
    ...mapGetters('rooms', ['getRoomById']),
    ...mapGetters('users', ['getUserById']),

    /**
     * Kullanıcıya ait, onaylanmış ve önümüzdeki 7 gün içinde başlayacak/veya devam eden toplantılar
     * - Sadece Onaylandi
     * - Şimdi < bitiş
     * - Başlangıç <= şimdi+7 gün
     * - Kullanıcı sahibi veya katılımcı
     */
    upcomingForUser() {
      const uid = this.user?.id;
      if (!uid) return [];

      const now = new Date();
      const in7 = new Date();
      in7.setDate(now.getDate() + 7);

      const startDT = (m) => new Date(`${m.date}T${m.startTime}`);
      const endDT   = (m) => new Date(`${m.date}T${m.endTime}`);

      return this.allMeetings
        .filter((m) => {
          const mine = m.ownerId === uid || (Array.isArray(m.participants) && m.participants.includes(uid));
          if (!mine) return false;

          if (m.status !== 'Onaylandi') return false;

          // Etkinlik zaman penceresi kontrolü
          return endDT(m) > now && startDT(m) <= in7;
        })
        .sort((a, b) => startDT(a) - startDT(b));
    },

    myPastMeetingsCount() {
      const uid = this.user?.id;
      if (!uid) return 0;
      return this.pastMeetings.filter(
        (m) => m.ownerId === uid || (Array.isArray(m.participants) && m.participants.includes(uid))
      ).length;
    },

    dashboardCards() {
      return [
        {
          title: 'Aktif Toplantılar',
          description: `Yaklaşan ${this.upcomingForUser.length} toplantınız var`,
          icon: 'calendar',
          color: '#0093D1',
          route: '/user/meetings'
        },
        {
          title: 'Geçmiş Toplantılar',
          description: `Toplam ${this.myPastMeetingsCount} toplantı`,
          icon: 'clock-history',
          color: '#005d8f',
          route: '/user/history'
        },
        {
          title: 'Yeni Toplantı',
          description: 'Toplantı planlayın',
          icon: 'plus-circle',
          color: '#002855',
          route: '/user/meeting-create'
        }
      ];
    }
  },
  methods: {
    getRoomName(id) {
      const r = this.getRoomById(id);
      return r ? r.name : 'Bilinmeyen Salon';
    },
    goTo(route) {
      if (route) this.$router.push(route);
    },
    isOngoing(m) {
      // Sadece Onaylandi toplantılar için "devam ediyor" izni
      if (m.status !== 'Onaylandi') return false;
      const start = new Date(`${m.date}T${m.startTime}`);
      const end   = new Date(`${m.date}T${m.endTime}`);
      const now   = new Date();
      return now >= start && now < end;
    }
  }
};
</script>

<style scoped lang="scss">
.dashboard { font-family: "Poppins", sans-serif; }
.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }
.card-hover { transition: all 0.25s ease; }
.card-hover:hover { transform: translateY(-6px); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12); }
.icon-circle { background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; padding: 0.6rem; display: flex; align-items: center; justify-content: center; }
.welcome-card { background-color: #f0f6fb; border-left: 5px solid #002855; border-radius: 15px; padding: 1.25rem 1.5rem; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05); }
.user-name { color: #002855; font-weight: 600; }
.text-primary { color: #003f91 !important; }
</style>
