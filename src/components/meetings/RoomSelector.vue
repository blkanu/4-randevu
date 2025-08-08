<template>
  <b-form-group
    class="font-weight-bold text-subu"
    label="Toplantı Salonu"
    label-for="meetingRoom"
  >
    <b-form-select
      id="meetingRoom"
      v-model="selected"
      :options="roomOptions"
      :disabled="roomOptions.length === 0"
      class="w-100"
      value-field="id"
      text-field="label"
    >
      <template #first>
        <b-form-select-option :value="null" disabled>Salon seçiniz</b-form-select-option>
      </template>
    </b-form-select>
  </b-form-group>
</template>

<script>
export default {
  name: "RoomSelector",
  props: {
    rooms: {
      type: Array,
      required: true,
    },
    value: {
      type: [String, Number, null],
      default: null,
    },
  },
  computed: {
    selected: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    roomOptions() {
      return this.rooms
        .filter((room) => room.status === "active")
        .map((room) => ({
          id: room.id,
          label: `${room.name} (Kapasite: ${room.capacity})`,
        }));
    },
  },
};
</script>
