<template>
  <div class="create-meeting container py-4">
    <b-card class="mb-4 shadow-sm header-card">
      <h4 class="mb-0 text-subu font-weight-bold">📝 Yeni Toplantı Oluştur</h4>
    </b-card>

    <!-- Toplantı Adı -->
    <b-form-group label="Toplantı Adı" label-for="meetingTitle" class="font-weight-bold text-subu">
      <b-form-input
        id="meetingTitle"
        v-model="meetingTitle"
        placeholder="Toplantı başlığını giriniz..."
        required
      />
    </b-form-group>

    <!-- Tarih -->
    <DatePicker
      v-model="selectedDate"
      :disabled-dates="disabledDates"
    />

    <!-- Saat Dilimi -->
    <TimeSlotPicker :slots="allTimeSlots" :date="selectedDate" v-model="selectedSlots" />

    <!-- Salon Seçimi -->
    <RoomSelector :rooms="rooms" v-model="selectedRoomId" />

    <!-- Katılımcılar -->
    <b-form-group class="font-weight-bold text-subu" label="Katılımcılar">
      <ParticipantSelector @update-participants="handleParticipantUpdate" />
    </b-form-group>

    <!-- Gündem -->
    <b-form-group class="font-weight-bold text-subu" label="Toplantı Gündemi">
      <AgendaInput v-model="agendaItems" />
    </b-form-group>

    <!-- Oluştur Butonu -->
    <b-button
      variant="success"
      class="mt-4 font-weight-bold"
      :disabled="!isFormValid"
      @click="showSummary = true"
    >
      Toplantıyı Oluştur
    </b-button>

    <!-- Modal -->
    <b-modal
      v-model="showSummary"
      title="Toplantı Özeti"
      @ok="submitMeeting"
      ok-title="Oluştur"
      cancel-title="İptal"
    >
      <p><strong>Toplantı:</strong> {{ meetingTitle }}</p>
      <p><strong>Tarih:</strong> {{ selectedDate }}</p>
      <p><strong>Saat:</strong> {{ selectedSlots.map(s => s.start + ' - ' + s.end).join(', ') }}</p>
      <p><strong>Salon:</strong> {{ selectedRoomLabel }}</p>
      <p><strong>Katılımcılar:</strong></p>
      <ul>
        <li v-for="u in participants" :key="u.id">{{ u.name }} ({{ u.email }})</li>
      </ul>
      <p><strong>Gündemler:</strong></p>
      <ul>
        <li v-for="(item, i) in agendaItems" :key="i">{{ item }}</li>
      </ul>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DatePicker from "@/components/meetings/DatePicker.vue";
import TimeSlotPicker from "@/components/meetings/TimeSlotPicker.vue";
import RoomSelector from "@/components/meetings/RoomSelector.vue";
import ParticipantSelector from "@/components/meetings/ParticipantSelector.vue";
import AgendaInput from "@/components/meetings/AgendaInput.vue";

export default {
  name: "MeetingCreate",
  components: {
    DatePicker,
    TimeSlotPicker,
    RoomSelector,
    ParticipantSelector,
    AgendaInput,
  },
  data() {
    return {
      meetingTitle: "",
      selectedDate: new Date().toISOString().substr(0, 10),
      selectedSlots: [],
      selectedRoomId: null,
      agendaItems: [],
      participants: [],
      showSummary: false,
      disabledDates: [
        new Date("2025-10-29"),
        new Date("2025-01-01"),
        new Date("2025-08-30"),
      ],
    };
  },
  computed: {
    ...mapGetters({
      rooms: "rooms/allRooms",
      allUsers: "users/allUsers",
      allTimeSlots: "timeSlots/allSlots",
      currentUser: "auth/currentUser", // auth modülün varsa
    }),
    selectedRoomLabel() {
      const room = this.rooms.find((r) => r.id === this.selectedRoomId);
      return room ? room.name : "-";
    },
    isFormValid() {
      return (
        this.meetingTitle.trim() &&
        this.selectedDate &&
        this.selectedSlots.length &&
        this.selectedRoomId &&
        this.participants.length &&
        this.agendaItems.length
      );
    },
  },
  methods: {
    ...mapActions("meetings", ["createMeeting"]),
    handleParticipantUpdate(selectedUsers) {
      this.participants = selectedUsers;
    },
    submitMeeting() {
      const meeting = {
        title: this.meetingTitle,
        date: this.selectedDate,
        startTime: this.selectedSlots[0].start,
        endTime: this.selectedSlots[this.selectedSlots.length - 1].end,
        roomId: this.selectedRoomId,
        agenda: this.agendaItems.join(", "),
        ownerId: this.currentUser?.id || 1,
        owner: this.currentUser,
        participants: this.participants.map((u) => u.id),
        agendaItems: this.agendaItems.map((text) => ({
          text,
          userId: this.currentUser?.id || 1,
        })),
        status: "Beklemede",
        decisions: [],
      };
      const now = new Date();
      const selectedDateTime = new Date(`${this.selectedDate}T${this.selectedSlots[0]?.start}`);

  if (selectedDateTime < now) {
    this.$bvToast.toast("Geçmiş saatli toplantı oluşturamazsınız.", {
      title: "Geçersiz Zaman",
      variant: "danger",
      solid: true,
    });
    return;
      };

      this.createMeeting(meeting);

      this.$bvToast.toast("Toplantı başarıyla oluşturuldu", {
        title: "Başarılı",
        variant: "success",
        solid: true,
      });

      this.resetForm();
    },
    resetForm() {
      this.meetingTitle = "";
      this.selectedDate = new Date().toISOString().substr(0, 10);
      this.selectedSlots = [];
      this.selectedRoomId = null;
      this.agendaItems = [];
      this.participants = [];
      this.showSummary = false;
    },
  },
};
</script>

<style scoped lang="scss">
.create-meeting {
  font-family: "Poppins", sans-serif;
}
.header-card {
  background-color: #f0f6fb;
  border-left: 5px solid #002855;
  border-radius: 12px;
}
.text-subu {
  color: #002855;
}
</style>
