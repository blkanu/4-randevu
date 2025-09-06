<template>
  <div class="time-slot-section mt-4">
    <label class="font-weight-bold text-subu">Toplantı Saat Aralığı</label>
    <div class="time-slots d-flex flex-wrap mt-0 mb-3">
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
  display: block;
}

.time-slots {
  gap: 0.5rem;
  justify-content: flex-start;
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
  font-size: 0.9rem;
}

.slot-box.available {
  background-color: #93e9a7;
  color: #002855;
  border-color: #c3e6cb;
}

.slot-box.available:hover {
  background-color: #186d3e;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  box-shadow: 0 2px 8px rgba(24, 109, 62, 0.3);
}

.text-subu {
  color: #002855;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .slot-box {
    min-width: calc(50% - 1rem);
    margin: 0.25rem 0.5rem 0.25rem 0;
    padding: 0.7rem 0.5rem;
    font-size: 0.85rem;
  }
  
  .time-slots {
    gap: 0.25rem;
  }
}

@media (max-width: 576px) {
  .slot-box {
    min-width: calc(50% - 0.5rem);
    padding: 0.6rem 0.4rem;
    font-size: 0.8rem;
    margin: 0.2rem 0.25rem 0.2rem 0;
  }
  
  .time-slot-section {
    margin-top: 1rem;
  }
}
</style>
