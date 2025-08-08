<template>
  <div class="meeting-list">
    <!-- Başlık -->
    <b-card class="header-card mb-4">
      <h4 class="mb-0 text-center text-subu font-weight-bold">📅 Aktif Toplantılar</h4>
    </b-card>

    <!-- Toplantı Kartları -->
    <div v-for="meeting in filteredMeetings" :key="meeting.id" class="mb-4">
      <b-card class="meeting-card shadow-sm border-left-subu">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div class="w-100">
            <h5 class="text-subu font-weight-bold mb-2">{{ meeting.title }}</h5>

            <p class="text-muted mb-1"><b-icon icon="chat-left-text" class="mr-1" /> <strong>Gündem:</strong> {{ meeting.agenda }}</p>
            <p class="text-muted mb-1"><b-icon icon="calendar-event" class="mr-1" /> {{ meeting.date }} </p>
            <p class="text-muted mb-1"><b-icon icon="clock" class="mr-1" /> {{ meeting.startTime }} - {{ meeting.endTime }}</p>
            <p class="text-muted mb-1"><b-icon icon="geo-alt" class="mr-1" /> Salon: {{ getRoomName(meeting.roomId) }}</p>
            <p class="text-muted mb-1"><b-icon icon="person-fill" class="mr-1" /> Sahibi: {{ meeting.owner.name }}</p>
            <p class="text-muted mb-2"><b-icon icon="people-fill" class="mr-1" /> Katılımcılar: {{ getParticipantNames(meeting.participants) }}</p>

            <div v-if="canAddAgenda(meeting)" class="mt-3">
              <strong class="text-subu">📝 Gündem Maddeleri:</strong>
              <ul class="mt-2 pl-3">
                <li v-for="(item, index) in meeting.agendaItems" :key="index">
                  "{{ item.text }}" <small class="text-muted">(Ekleyen: {{ getUserName(item.userId) }})</small>
                </li>
              </ul>
            

            <!-- Gündem Ekleme (sadece onaylandıysa ve yetkiliyse) -->
            
              <b-input-group>
                <b-form-input
                  v-model="newAgendaTexts[meeting.id]"
                  placeholder="Gündeme madde ekleyin..."
                ></b-form-input>
                <b-input-group-append>
                  <b-button variant="subu" @click="addAgenda(meeting.id)">Ekle</b-button>
                </b-input-group-append>
              </b-input-group>
            </div>
          </div>

          <b-badge :variant="statusColor(meeting.status)">
            {{ meeting.status }}
          </b-badge>
        </div>
      </b-card>
    </div>

    <!-- Boş Durum -->
    <b-alert variant="info" show v-if="filteredMeetings.length === 0">
      Şu anda aktif toplantınız bulunmamaktadır.
    </b-alert>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "MeetingList",
  data() {
    return {
      newAgendaTexts: {}, // meetingId => inputText
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    ...mapGetters("meetings", ["activeMeetings"]),
    ...mapGetters("users", ["getUserById"]),
    ...mapGetters("rooms", ["getRoomById"]),
    // Sadece kullanıcının sahibi ya da katılımcısı olduğu toplantılar gösterilir
    filteredMeetings() {
      return this.activeMeetings
        .filter(
          (m) =>
            m.ownerId === this.user.id || m.participants.includes(this.user.id)
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },
  },
  methods: {
    ...mapActions("meetings", ["addAgendaItem"]),

    getUserName(id) {
      const user = this.getUserById(id);
      return user ? user.name : "Bilinmeyen";
    },
    getRoomName(roomId) {
    const room = this.getRoomById(roomId);
    return room ? room.name : "Bilinmeyen Salon";
  },
    getParticipantNames(ids) {
      return ids.map(this.getUserName).join(", ");
    },

    canAddAgenda(meeting) {
      const isUserRelated =
        this.user.id === meeting.ownerId ||
        meeting.participants.includes(this.user.id);
      const isApproved = meeting.status === "Onaylandi";
      return isUserRelated && isApproved;
    },

    addAgenda(meetingId) {
      const text = this.newAgendaTexts[meetingId]?.trim();
      if (!text) return;
      this.addAgendaItem({ meetingId, text, userId: this.user.id });
      this.newAgendaTexts[meetingId] = "";
    },

    statusColor(status) {
      return {
        Onaylandi: "success",
        Reddedildi: "danger",
        Beklemede: "warning",
        "Iptal Edildi": "secondary",
      }[status] || "secondary";
    },
  },
};
</script>

<style scoped lang="scss">
.meeting-list {
  font-family: "Poppins", sans-serif;
}

.header-card {
  background-color: #f0f6fb;
  border-radius: 12px;
  padding: 1rem 1.5rem;
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

.text-subu {
  color: #002855;
}

.border-left-subu {
  border-left: 5px solid #0093d1 !important;
}

.btn-subu,
.btn-subu:hover {
  background-color: #0093d1;
  border-color: #0093d1;
  color: #fff;
}
</style>
