<template>
  <span class="room-dot" :class="klass"></span>
</template>

<script>
import { ROOM_STATUS } from '@/utils/constants';

export default {
  name: 'RoomDot',
  props: { status: { type: String, default: null } },
  computed: {
    klass() {
      return {
        [ROOM_STATUS.AKTIF]: 'room-dot--active',
        [ROOM_STATUS.PASIF]: 'room-dot--passive',
        [ROOM_STATUS.BAKIMDA]: 'room-dot--maintenance'
      }[this.status] || 'room-dot--unknown';
    }
  }
};
</script>

<style scoped>
.room-dot { display:inline-block; width:.6rem; height:.6rem; border-radius:9999px; margin-right:.4rem; vertical-align:baseline; }
.room-dot--active { background:#28a745; }
.room-dot--passive { background:#6c757d; }
.room-dot--maintenance { background:#f39c12; }
.room-dot--unknown { background:#adb5bd; }
</style>
