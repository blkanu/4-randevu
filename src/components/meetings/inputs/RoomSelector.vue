<template>
  <div class="form-group font-weight-bold text-subu">
    <label>Toplantı Salonu</label>
    <select
      class="form-control"
      v-model.number="innerValue"
      :disabled="rooms.length === 0"
    >
      <option :value="null">Salon seçiniz</option>
      <option
        v-for="r in rooms"
        :key="r.id"
        :value="r.id"
      >
        {{ r.name }} ({{ r.capacity }}) - {{ r.status }}
      </option>
    </select>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "RoomSelector",
  props: {
    // Vue 2 v-model için 'value' + 'input' sözleşmesi
    value: { type: [Number, String, null], default: null },
    // Aktif odaları göstermek istiyorsan true yap
    onlyActive: { type: Boolean, default: true },
  },
  computed: {
    ...mapGetters("rooms", ["allRooms", "activeRooms"]),
    rooms() {
      return this.onlyActive ? this.activeRooms : this.allRooms;
    },
    innerValue: {
      get() {
        // dışarıdan string gelirse number’a çevirme
        return this.value === null ? null : Number(this.value);
      },
      set(v) {
        // Vue 2: v-model => 'input' eventi
        this.$emit("input", v);
      },
    },
  },
};
</script>
