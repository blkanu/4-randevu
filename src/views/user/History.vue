<template>
  <div class="history-page">
    <!-- Başlık -->
    <b-card class="header-card mb-4">
      <h4 class="mb-0 text-center text-subu font-weight-bold">🕓 Geçmiş Toplantılar</h4>
    </b-card>

    <!-- Toplantı Kartları -->
    <div v-for="meeting in userPastMeetings" :key="meeting.id" class="mb-4">
      <b-card class="meeting-card shadow-sm border-left-subu">
        <div class="d-flex justify-content-between">
          <div class="w-100">
            <h5 class="text-subu font-weight-bold">{{ meeting.title }}</h5>
            <p class="text-muted small mb-1"><b-icon icon="calendar-event" class="mr-1" /> {{ meeting.date }}</p>
            <p class="text-muted small mb-1"><b-icon icon="clock" class="mr-1" /> {{ meeting.startTime }} - {{ meeting.endTime }}</p>
            <p class="text-muted small mb-1"><b-icon icon="geo-alt" class="mr-1" /> {{ getRoomName(meeting.roomId) }}</p>
            <p class="text-muted small mb-1"><b-icon icon="person" class="mr-1" /> Sahibi: {{ getUserName(meeting.ownerId) }}</p>
            <p class="text-muted small mb-1">
              <b-icon icon="people-fill" class="mr-1" /> Katılımcılar:
              {{ getParticipantNames(meeting.participants) }}
            </p>

            <!-- Karar -->
            <div class="mt-3">
              <h6 class="text-subu">📌 Toplantı Kararı:</h6>
              <div v-if="getMeetingDecisionObject(meeting.id)">
                <p>
                  {{ getMeetingDecisionObject(meeting.id).description }}
                  
                  <small class="text-muted">
                    ({{ formatDate(getMeetingDecisionObject(meeting.id).createdAt) }} tarihinde eklendi)
                  </small>
                </p>
              </div>
              <p v-else class="text-muted font-italic">Henüz karar girilmemiş.</p>
            </div>


            <!-- Karar Giriş Formu -->
            <div v-if="isOwner(meeting) && !getMeetingDecision(meeting.id)" class="mt-2">
              <b-form @submit.prevent="submitDecision(meeting)">
                <b-form-textarea
                  v-model="newDecisionTexts[meeting.id]"
                  rows="2"
                  placeholder="Toplantı kararı giriniz..."
                  required
                />
                <b-button variant="subu" class="mt-2" size="sm" type="submit">
                  Kararı Kaydet
                </b-button>
              </b-form>
            </div>
          </div>
        </div>
      </b-card>
    </div>

    <b-alert show variant="info" v-if="userPastMeetings.length === 0">
      Geçmiş toplantınız bulunmamaktadır.
    </b-alert>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "HistoryPage",
  data() {
    return {
      newDecisionTexts: {}
    };
  },
  computed: {
    ...mapGetters("auth", ["user"]),
    ...mapGetters("users", ["getUserById"]),
    ...mapGetters("rooms", ["getRoomById"]),
    ...mapGetters("meetings", ["pastMeetings"]),
    ...mapGetters("decisions", ["getDecisionsByMeetingId"]),

    userPastMeetings() {
      return this.pastMeetings.filter(
        (m) =>
          m.ownerId === this.user.id ||
          m.participants.includes(this.user.id)
      );
    }
  },
  methods: {
    ...mapActions("decisions", ["addDecision"]),

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
    isOwner(meeting) {
      return meeting.ownerId === this.user.id;
    },
    getMeetingDecision(meetingId) {
      const decisions = this.getDecisionsByMeetingId(meetingId);
      return decisions.length ? decisions[0].description : null;
    },
    submitDecision(meeting) {
      const text = this.newDecisionTexts[meeting.id]?.trim();
      if (!text) return;

      this.addDecision({
        meetingId: meeting.id,
        description: text,
        createdAt: new Date().toISOString()
      });

      this.newDecisionTexts[meeting.id] = "";

      this.$bvToast.toast("Toplantı kararı başarıyla kaydedildi.", {
        title: "Başarılı",
        variant: "success",
        solid: true
      });
    },
    getMeetingDecisionObject(meetingId) {
      const decisions = this.getDecisionsByMeetingId(meetingId);
      return decisions.length ? decisions[0] : null;
    },

    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    },

  }
};
</script>

<style scoped lang="scss">
.history-page {
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
