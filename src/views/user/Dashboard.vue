<template>
  <div class="dashboard">
    <!-- Hoşgeldiniz -->
    <b-card class="welcome-card mb-4">
      <h5 class="mb-0">
        Hoşgeldiniz, <span class="user-name">{{ user.name }}</span>!
      </h5>
    </b-card>

    <!-- Kartlar -->
    <b-row>
      <b-col
        cols="12"
        md="4"
        class="mb-4"
        v-for="card in dashboardCards"
        :key="card.title"
      >
        <b-card
          class="text-white card-hover shadow"
          :style="{ backgroundColor: card.color, borderRadius: '20px', cursor: 'pointer' }"
          @click="goTo(card.route)"
        >
          <div class="d-flex align-items-center">
            <div class="icon-circle mr-3">
              <b-icon :icon="card.icon" variant="white" font-scale="1.6" />
            </div>
            <div>
              <h5 class="mb-1 font-weight-bold">{{ card.title }}</h5>
              <p class="mb-0">{{ card.description }}</p>
            </div>
          </div>
        </b-card>
      </b-col>
    </b-row>

    <!-- Yaklaşan Toplantılar (sadece Onaylandı olanlar) -->
    <b-card class="mt-4 p-3 shadow-sm border-left-subu">
      <h5 class="mb-3 text-subu font-weight-bold">Yaklaşan Toplantılar</h5>

      <div v-if="filteredMeetings.length">
        
        <b-row>
          <b-col
            cols="12"
            md="6"
            lg="4"
            v-for="meeting in filteredMeetings"
            :key="meeting.id"
            class="mb-3"
          >
            <b-card class="h-100 shadow-sm" style="border-radius: 16px;">
              <h5 class="text-primary font-weight-bold mb-2">
                {{ meeting.title }}
              </h5>
              <p class="mb-1">
                <b-icon icon="person" class="mr-1" />
                <strong>Sahibi:</strong> {{ meeting.owner.name }}
              </p>
              <p class="mb-1">
                <b-icon icon="geo-alt" class="mr-1" />
                <strong>Salon:</strong> {{ getRoomName(meeting.roomId) }}
              </p>
              <p class="mb-1">
                <b-icon icon="calendar-event" class="mr-1" />
                <strong>Tarih:</strong> {{ meeting.date }}
              </p>
              <p class="mb-1">
                <b-icon icon="clock" class="mr-1" />
                <strong>Saat:</strong> {{ meeting.startTime }} - {{ meeting.endTime }}
              </p>
              <p class="mb-1">
                <b-icon icon="people" class="mr-1" />
                <strong>Katılımcı:</strong> {{ meeting.participants.length }}
              </p>
              <p class="mb-1">
                <b-icon icon="list-task" class="mr-1" />
                <strong>Gündem:</strong> {{ meeting.agenda }}
              </p>
              <p class="mb-0">
                <b-badge :variant="statusColor(meeting.status)">
                  {{ meeting.status }}
                </b-badge>
              </p>
            </b-card>
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
import { mapGetters } from "vuex";

export default {
  name: "Dashboard",
  computed: {
    ...mapGetters("auth", ["user"]),
    ...mapGetters("meetings", ["upcomingWithin7Days", "pastMeetings"]),
    ...mapGetters("rooms", ["getRoomById"]),
    filteredMeetings() {
      // Sadece Onaylandı olan toplantılar
      return this.upcomingWithin7Days.filter((m) => m.status === "Onaylandi");
    },
    dashboardCards() {
      return [
        {
          title: "Aktif Toplantılar",
          description: `Yaklaşan ${this.filteredMeetings.length} toplantınız var`,
          icon: "calendar",
          color: "#0093D1",
          route: "/user/meetings",
        },
        {
          title: "Geçmiş Toplantılar",
          description: `Toplam ${this.pastMeetings.length} toplantı`,
          icon: "clock-history",
          color: "#005d8f",
          route: "/user/history",
        },
        {
          title: "Yeni Toplantı",
          description: "Toplantı planlayın",
          icon: "plus-circle",
          color: "#002855",
          route: "/user/meeting-create",
        },
      ];
    },
  },
  methods: {
    getRoomName(roomId) {
    const room = this.getRoomById(roomId);
    return room ? room.name : "Bilinmeyen Salon";
  },

    goTo(route) {
      this.$router.push(route);
    },
    statusColor(status) {
      return {
        Onaylandi: "success",
        Reddedildi: "danger",
        Beklemede: "warning",
        Iptal: "secondary",
      }[status] || "secondary";
    },
  },
};
</script>

<style scoped lang="scss">
.dashboard {
  font-family: "Poppins", sans-serif;
}
.text-subu {
  color: #002855;
}
.border-left-subu {
  border-left: 5px solid #0093d1 !important;
}
.card-hover {
  transition: all 0.25s ease;
}
.card-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}
.icon-circle {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.welcome-card {
  background-color: #f0f6fb;
  border-left: 5px solid #002855;
  border-radius: 15px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.user-name {
  color: #002855;
  font-weight: 600;
}
.text-primary {
  color: #003f91 !important;
}
</style>
