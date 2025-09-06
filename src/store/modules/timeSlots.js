// src/store/modules/timeSlots.js
// Not: Backend'de slot status yok; FE görünürlük kontrolü için sanal alan.
// available | approved | unavailable => UI iş kuralı (oda durumu, özel gün, çakışma)

export default {
  namespaced: true,
  state: () => ({
    list: [
      { id: 1, start: "08:00", end: "09:00", status: "available" },
      { id: 2, start: "09:00", end: "10:00", status: "available" },
      { id: 3, start: "10:00", end: "11:00", status: "approved" },
      { id: 4, start: "11:00", end: "12:00", status: "available" },
      { id: 5, start: "12:00", end: "13:00", status: "available" },
      { id: 6, start: "13:00", end: "14:00", status: "unavailable" },
      { id: 7, start: "14:00", end: "15:00", status: "available" },
      { id: 8, start: "15:00", end: "16:00", status: "available" },
      { id: 9, start: "16:00", end: "17:00", status: "available" },
      { id: 10, start: "17:00", end: "18:00", status: "available" },
    ]
  }),
  getters: {
    allSlots: s => s.list,
    getSlotById: s => id => s.list.find(x => x.id === id),
  }
};
