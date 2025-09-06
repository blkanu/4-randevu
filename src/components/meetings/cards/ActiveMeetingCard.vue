<template>
  <MeetingCardBase
    :meeting="baseMeeting"
    :display="{
      participantsMode: 'count',
      showOwner: true,
      showCountdown: true,
      showStatusBadge: true
    }"
    :features="features"
    :can="can"
    :helpers="helpers"
    @add-agenda="$emit('add-agenda', $event)"
    @owner-cancel="$emit('owner-cancel', $event.meeting)"
    @override-cancel="$emit('override-cancel', $event.meeting)"
  >
    <template #actions>
      <slot name="footer"></slot>
    </template>
    <template #extra>
      <slot name="extra"></slot>
    </template>
  </MeetingCardBase>
</template>

<script>
import MeetingCardBase from '@/components/meetings/base/MeetingCardBase.vue';

export default {
  name: 'ActiveMeetingCardCompat',
  components: { MeetingCardBase },
  props: {
    id: { type: [String, Number], default: null }, // varsa gerçek id geçilebilir
    title: { type: String, required: true },
    status: { type: String, required: true },
    ownerName: { type: String, default: '' },
    roomName: { type: String, default: '' },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    participantsCount: { type: [Number, String], default: 0 },
    agenda: { type: String, default: '' },
    ongoing: { type: Boolean, default: false },
    enableOwnerCancel: { type: Boolean, default: false },
    enableOverrideCancel: { type: Boolean, default: false },
  },
  computed: {
    baseMeeting() {
      const count = Number(this.participantsCount || 0);
      return {
        id: this.id ?? this._uid, // id yoksa güvenli fallback
        title: this.title,
        status: this.status,
        agenda: this.agenda,
        date: this.date,
        startTime: this.startTime,
        endTime: this.endTime,
        roomName: this.roomName,
        ownerName: this.ownerName,
        participants: Array.from({ length: isNaN(count) ? 0 : count }).map((_, i) => ({ id: `p${i}` })),
      };
    },
    features() {
      return {
        addAgenda: false,
        ownerCancel: this.enableOwnerCancel,
        overrideCancel: this.enableOverrideCancel,
      };
    },
    can() {
      return {
        addAgenda: () => false,
        ownerCancel: (m) =>
          this.enableOwnerCancel &&
          m.status === 'Onaylandi' &&
          !this._hasStarted(m),
        overrideCancel: (m) =>
          this.enableOverrideCancel &&
          m.status === 'Onaylandi' &&
          !this._hasStarted(m),
      };
    },
    helpers() {
      return {
        // Eğer dışarıdan 'ongoing' veriliyorsa onu kullan; aksi halde Base defaultlarına bırak.
        isOngoing: () => !!this.ongoing,
        countdownText: (m) => {
          if (m.status !== 'Onaylandi') return '';
          const now = new Date();
          const start = new Date(`${m.date}T${m.startTime}`);
          if (now >= start) return '';
          const mins = Math.round((start - now) / 60000);
          if (mins <= 0) return '';
          if (mins < 60) return `${mins} dk kaldı`;
          const h = Math.floor(mins / 60), r = mins % 60;
          return r ? `${h} sa ${r} dk kaldı` : `${h} saat kaldı`;
        },
      };
    },
  },
  methods: {
    _hasStarted(m) {
      const now = new Date();
      const s = new Date(`${m.date}T${m.startTime}`);
      return now >= s;
    },
  },
};
</script>
