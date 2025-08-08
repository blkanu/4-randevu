<template>
  <b-card class="mb-3 shadow-sm card-hover" :title="meeting.title">
    <p class="mb-1 text-muted"><b-icon icon="calendar-event" class="mr-1"/> {{ meeting.date }} - {{ meeting.time }}</p>
    <p class="mb-1"><b-icon icon="geo-alt" class="mr-1"/> Salon: {{ meeting.room }}</p>
    <p class="mb-1"><b-icon icon="people-fill" class="mr-1"/> Katılımcı: {{ meeting.participants.length }}</p>
    <b-badge :variant="statusVariant" class="mt-2">{{ meeting.status }}</b-badge>
  </b-card>
</template>

<script>
export default {
  name: "MeetingCard",
  props: {
    meeting: Object
  },
  computed: {
    statusVariant() {
      return {
        'Onaylandı': 'success',
        'Reddedildi': 'danger',
        'Beklemede': 'warning'
      }[this.meeting.status] || 'secondary';
    }
  }
}
</script>

<style scoped>
.card-hover:hover {
  transform: scale(1.01);
  transition: all 0.2s ease;
}
</style>
