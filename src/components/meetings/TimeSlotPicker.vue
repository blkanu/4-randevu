<template>
  <div class="time-slot-section mt-4">
    <label class="font-weight-bold text-subu">Toplantı Saat Aralığı</label>
    <div class="time-slots d-flex flex-wrap mt-2">
      <div
        v-for="slot in slots"
        :key="slot.id"
        class="slot-box"
        :class="[
          slot.status,
          { active: isSelected(slot), disabled: slot.status !== 'available' }
        ]"
        @click="toggleSlot(slot)"
      >
        {{ slot.start }} - {{ slot.end }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TimeSlotPicker",
  props: {
    slots: {
      type: Array,
      required: true,
    },
    value: {
      // v-model ile kullanılacak (selectedSlots)
      type: Array,
      default: () => [],
    },
    maxSelectable: {
      type: Number,
      default: 5,
    },
    date: { type: String, required: true },
  },
  methods: {
    toggleSlot(slot) {
      if (slot.status !== "available") return;

      const selected = [...this.value];
      const exists = selected.findIndex((s) => s.id === slot.id);

      if (exists !== -1) {
        this.$emit("input", []); // seçim iptali
        return;
      }

      const newSelection = [...selected, slot].sort((a, b) => a.id - b.id);

      for (let i = 1; i < newSelection.length; i++) {
        if (newSelection[i].id !== newSelection[i - 1].id + 1) {
          this.$emit("input", [slot]); // aralıklı tıklama -> sadece o slot kalır
          return;
        }
      }

      if (newSelection.length > this.maxSelectable) return;

      this.$emit("input", newSelection);
    },
    isSelected(slot) {
      return this.value.some((s) => s.id === slot.id);
    },
  },
};
</script>

<style scoped lang="scss">
.time-slot-section label {
  margin-bottom: 0.5rem;
}

.time-slots {
  gap: 0.5rem;
}

.slot-box {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  margin: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  user-select: none;
  min-width: 130px;
  text-align: center;
}

.slot-box.available {
  background-color: #93e9a7;
  color: #002855;
  border-color: #c3e6cb;
}
.slot-box.available:hover {
  background-color: #186d3e;
  color: white;
}

.slot-box.approved {
  background-color: #edd4d4;
  color: #571515;
  border-color: #e6c3c3;
  cursor: not-allowed;
}

.slot-box.unavailable {
  background-color: #f0f0f0;
  color: #999;
  border-color: #ccc;
  cursor: not-allowed;
}

.slot-box.active {
  background-color: #186d3e;
  color: white !important;
  border-color: #00ad34;
}
.text-subu {
  color: #002855;
}
</style>
