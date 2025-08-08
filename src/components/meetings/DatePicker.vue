<template>
  <b-form-group class="font-weight-bold text-subu" label="Toplantı Tarihi" label-for="meetingDate">
    <b-form-datepicker
      id="meetingDate"
      v-model="selected"
      :min="today"
      locale="tr"
      class="w-100"
      :date-disabled-fn="isDateDisabled"
      @input="$emit('date-selected', selected)"
    />
  </b-form-group>
</template>

<script>
export default {
  name: "DatePicker",
  props: {
    value: {
      type: String,
      default: null,
    },
    disabledDates: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    today() {
      return new Date().toISOString().substr(0, 10);
    },
    selected: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  methods: {
    isDateDisabled(ymd) {
      const day = new Date(ymd).getDay();
      const isWeekend = day === 0 || day === 6;
      const formattedDisabled = this.disabledDates.map((d) =>
        d.toISOString().slice(0, 10)
      );
      return isWeekend || formattedDisabled.includes(ymd);
    },
  },
};
</script>
