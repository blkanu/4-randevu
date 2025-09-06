// store/modules/specialDays.js
export default {
  namespaced: true,
  state: () => ({
    items: [
      { id: 1, date: "2025-08-30", description: "Zafer Bayramı" },
      { id: 2, date: "2025-10-29", description: "Cumhuriyet Bayramı" },
    ],
  }),
  getters: {
    allSpecialDays: (s) => s.items,
    isSpecialDay:   (s) => (isoDate) => s.items.some(d => d.date === isoDate),
    fullDayDates:   (s) => s.items.map(item => item.date),
  },
  mutations: {
    ADD_SPECIAL_DAY(s, payload) {
      s.items.push({ id: Date.now(), ...payload });
    },
    REMOVE_SPECIAL_DAY(s, id) {
      s.items = s.items.filter(x => x.id !== id);
    },
    UPDATE_SPECIAL_DAY(s, payload) {
      const idx = s.items.findIndex(x => x.id === payload.id);
      if (idx !== -1) s.items.splice(idx, 1, { ...s.items[idx], ...payload });
    },
  },
  actions: {
    addSpecialDay({ commit }, payload) {
      // API entegrasyonu burada olabilir
      commit("ADD_SPECIAL_DAY", payload);
    },
    // Bileşenlerin beklediği isim
    removeSpecialDayById({ commit }, { id }) {
      commit("REMOVE_SPECIAL_DAY", id);
    },
    // Alternatif kısa kullanım
    removeSpecialDay({ commit }, id) {
      commit("REMOVE_SPECIAL_DAY", id);
    },
    updateSpecialDay({ commit }, payload) {
      commit("UPDATE_SPECIAL_DAY", payload);
    },
  },
};
