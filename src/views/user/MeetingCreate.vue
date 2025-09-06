<template>
  <div class="create-meeting container py-4">
    <b-card class="mb-4 shadow-sm header-card">
      <h4 class="mb-0 text-subu font-weight-bold">📝 Yeni Toplantı Oluştur</h4>
    </b-card>

    <b-form-group label="Toplantı Adı" label-for="meetingTitle" class="font-weight-bold text-subu">
      <b-form-input id="meetingTitle" v-model="meetingTitle" placeholder="Toplantı başlığını giriniz..." required />
    </b-form-group>

    <RoomSelector v-model="selectedRoomId" />

      <DatePicker
    v-model="selectedDate"
    :disabled-dates="disabledDaysFromStore"
  />

  <TimeSlotPicker
    :slots="uiSlots"
    :date="selectedDate"
    v-model="selectedSlots"
  />

    <b-form-group class="font-weight-bold text-subu" label="Katılımcılar">
      <ParticipantSelector @update-participants="handleParticipantUpdate" />
    </b-form-group>

    <b-form-group class="font-weight-bold text-subu" label="Toplantı Gündemi">
      <AgendaInput v-model="agendaItems" :min="AGENDA_MIN" :max="AGENDA_MAX" />
    </b-form-group>

    <b-button variant="success" class="mt-4 font-weight-bold" :disabled="!isFormValid" @click="showSummary = true">
      Toplantıyı Oluştur
    </b-button>

    <b-modal v-model="showSummary" title="Toplantı Özeti" @ok="submitMeeting" ok-title="Oluştur" cancel-title="İptal">
      <p><strong>Toplantı:</strong> {{ meetingTitle }}</p>
      <p><strong>Tarih:</strong> {{ selectedDate }}</p>
      <p><strong>Saat:</strong> {{ selectedSlots.map(s => s.start + ' - ' + s.end).join(', ') }}</p>
      <p><strong>Salon:</strong> {{ selectedRoomLabel }}</p>
      <p><strong>Katılımcılar:</strong></p>
      <ul>
        <li v-for="u in [currentUser, ...participantsResolved]" :key="(u && (u.id || u.email))">{{ u?.name }} ({{ u?.email }})</li>
      </ul>
      <p><strong>Gündemler:</strong></p>
      <ul><li v-for="(item, i) in agendaItems" :key="i">{{ item }}</li></ul>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DatePicker from "@/components/meetings/inputs/DatePicker.vue";
import TimeSlotPicker from "@/components/meetings/inputs/TimeSlotPicker.vue";
import RoomSelector from "@/components/meetings/inputs/RoomSelector.vue";
import ParticipantSelector from "@/components/meetings/inputs/ParticipantSelector.vue";
import AgendaInput from "@/components/meetings/inputs/AgendaInput.vue";
import { ROOM_STATUS, MEETING_STATUS } from "@/utils/constants";

export default {
  name: "MeetingCreate",
  components: { DatePicker, TimeSlotPicker, RoomSelector, ParticipantSelector, AgendaInput },
  data() {
    return {
      meetingTitle: "",
      selectedDate: new Date().toISOString().substr(0, 10),
      selectedSlots: [],
      selectedRoomId: null,
      agendaItems: [],
      participantsSelected: [],
      showSummary: false,
      AGENDA_MIN: 1,
      AGENDA_MAX: 10,
    };
  },
  computed: {
    ...mapGetters({
      rooms: "rooms/allRooms",
      allUsers: "users/allUsers",
      allTimeSlots: "timeSlots/allSlots",
      currentUser: "auth/user",
      meetingsByRoom: "meetings/meetingsByRoom",
      fullDayDates: "specialDays/fullDayDates",
      rangesByDate: "specialDays/rangesByDate",
    }),

    // !!! STRING LIST — Date objesi değil !!!
    disabledDaysFromStore() {
      return this.fullDayDates; // örn: ["2025-08-30", "2025-10-29"]
    },

    selectedRoom() { return this.rooms.find(r => r.id === this.selectedRoomId) || null; },
    selectedRoomLabel() { return this.selectedRoom ? this.selectedRoom.name : "-"; },

    // Kullanıcılara vs... (değişmedi)
    participantsResolved() { /* ... sizin önceki kodunuzla aynı ... */ 
      const byEmail = new Map(this.allUsers.map(u => [u.email, u]));
      const byId    = new Map(this.allUsers.map(u => [u.id, u]));
      const list = (this.participantsSelected || []).map(u => {
        if (u.id && byId.get(u.id)) return byId.get(u.id);
        if (u.email && byEmail.get(u.email)) return byEmail.get(u.email);
        return { ...u, id: u.id || undefined };
      });
      const seen = new Set();
      return list.filter(u => {
        const key = u.id ?? u.email; if (!key || seen.has(key)) return false;
        seen.add(key); return true;
      });
    },

    isFormValid() {
      const minOK = this.agendaItems.length >= this.AGENDA_MIN;
      const maxOK = this.agendaItems.length <= this.AGENDA_MAX;
      return (
        this.meetingTitle.trim() &&
        this.selectedDate &&
        this.selectedSlots.length > 0 &&
        !!this.selectedRoomId &&
        minOK && maxOK &&
        !this.closedBySpecialDay.allDay
      );
    },

    now() { return new Date(); },
    todayISO() { return new Date().toISOString().split("T")[0]; },
    hhmmToMin() { return (s) => { const [h,m]=s.split(":").map(Number); return h*60+m; }; },

    sameDayRoomMeetings() {
      if (!this.selectedRoomId || !this.selectedDate) return [];
      return this.meetingsByRoom(this.selectedRoomId).filter(m => m.date === this.selectedDate);
    },

    // Özel gün durumu
    closedBySpecialDay() {
      if (!this.selectedDate) return { allDay: false, ranges: [] };
      return this.rangesByDate(this.selectedDate);
    },

    // SLOT HESABI (oda durumu + tarih + onaylı toplantılar + PARTIAL özel gün)
    uiSlots() {
      const base = this.allTimeSlots.map(s => ({ ...s }));
      const room = this.selectedRoom;

      // oda aktif değilse
      if (!room || room.status !== ROOM_STATUS.AKTIF) {
        return base.map(s => ({ ...s, status: "unavailable" }));
      }

      // geçmiş tarih
      if (this.selectedDate && this.selectedDate < this.todayISO) {
        return base.map(s => ({ ...s, status: "unavailable" }));
      }

      // FULL özel gün => tüm slotlar kapalı
      if (this.closedBySpecialDay.allDay) {
        return base.map(s => ({ ...s, status: "unavailable" }));
      }

      const isToday = this.selectedDate === this.todayISO;
      const nowMin = this.hhmmToMin(`${this.now.getHours().toString().padStart(2,"0")}:${this.now.getMinutes().toString().padStart(2,"0")}`);

      const overlaps = (slot, m) => {
        const sS = this.hhmmToMin(slot.start), sE = this.hhmmToMin(slot.end);
        const mS = this.hhmmToMin(m.startTime), mE = this.hhmmToMin(m.endTime);
        return sS < mE && sE > mS;
      };
      const rangeOverlaps = (slot, r) => {
        const sS = this.hhmmToMin(slot.start), sE = this.hhmmToMin(slot.end);
        const rS = this.hhmmToMin(r.start),   rE = this.hhmmToMin(r.end);
        return sS < rE && sE > rS;
      };

      return base.map(slot => {
        let status = slot.status || "available";

        if (isToday) {
          const endMin = this.hhmmToMin(slot.end);
          if (endMin <= nowMin) status = "unavailable";
        }

        // mevcut toplantı çakışmaları
        for (const m of this.sameDayRoomMeetings) {
          if (!overlaps(slot, m)) continue;
          if (m.status === MEETING_STATUS?.ONAYLANDI || m.status === "Onaylandi" || m.status === "Onaylandı") {
            status = "approved"; break;
          }
          if (m.status === MEETING_STATUS?.BEKLEMEDE || m.status === "Beklemede") {
            if (status !== "approved") status = "unavailable";
          }
        }

        // PARTIAL özel gün aralıkları
        if (status !== "approved" && this.closedBySpecialDay.ranges?.length) {
          if (this.closedBySpecialDay.ranges.some(r => rangeOverlaps(slot, r))) {
            status = "unavailable";
          }
        }

        return { ...slot, status };
      });
    },
  },

  watch: {
    selectedDate(val) {
      // FULL güne kullanıcı bir şekilde set ederse temizle + uyar
      if (val && this.fullDayDates.includes(val)) {
        this.$nextTick(() => { this.selectedDate = null; });
        this.$bvToast.toast("Seçtiğiniz gün tüm gün kapalıdır.", {
          title: "Kapalı Gün", variant: "warning", solid: true,
        });
      }
      this.dropInvalidSelections();
    },
    selectedRoomId() { this.dropInvalidSelections(); },
    uiSlots() { this.dropInvalidSelections(); },
  },

  methods: {
    ...mapActions("meetings", ["createMeeting"]),

    handleParticipantUpdate(list) { this.participantsSelected = list || []; },

    dropInvalidSelections() {
      if (!this.selectedSlots.length) return;
      const ok = new Set(this.uiSlots.filter(s => s.status === "available").map(s => s.id));
      const next = this.selectedSlots.filter(s => ok.has(s.id));
      if (next.length !== this.selectedSlots.length) this.selectedSlots = next;
    },

    submitMeeting() {
      const now = new Date();
      const start = this.selectedSlots[0]?.start;
      if (!start) return;

      const dt = new Date(`${this.selectedDate}T${start}`);
      if (dt < now) {
        this.$bvToast.toast("Geçmiş saatli toplantı oluşturamazsınız.", { title: "Geçersiz Zaman", variant: "danger", solid: true });
        return;
      }

      const ownerId = this.currentUser?.id || 1;
      const participantIds = [ownerId, ...this.participantsResolved.map(u => u.id).filter(Boolean)];
      const uniq = Array.from(new Set(participantIds));

      const meeting = {
        title: this.meetingTitle,
        date: this.selectedDate,
        startTime: this.selectedSlots[0].start,
        endTime: this.selectedSlots[this.selectedSlots.length - 1].end,
        roomId: this.selectedRoomId,
        agenda: this.agendaItems.join(", "),
        ownerId,
        owner: this.currentUser,
        participants: uniq,
        agendaItems: this.agendaItems.map(text => ({ text, userId: ownerId })),
        status: MEETING_STATUS?.BEKLEMEDE || "Beklemede",
        decisions: [],
      };

      this.createMeeting(meeting);
      this.$bvToast.toast("Toplantı yönetici onayına gönderildi.", { title: "Başarılı", variant: "success", solid: true });
      this.resetForm();
    },

    resetForm() {
      this.meetingTitle = "";
      this.selectedDate = new Date().toISOString().substr(0, 10);
      this.selectedSlots = [];
      this.selectedRoomId = null;
      this.agendaItems = [];
      this.participantsSelected = [];
      this.showSummary = false;
    },
  },
};
</script>

<style scoped lang="scss">
.create-meeting { font-family: "Poppins", sans-serif; }
.header-card { background-color: #f0f6fb; border-left: 5px solid #002855; border-radius: 12px; }
.text-subu { color: #002855; }
</style>
