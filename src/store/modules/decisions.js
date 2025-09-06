// store/modules/decisions.js
// Backend modeline uyumlu: MeetingDecision { id, meetingId, description, createdAt }

const state = {
  decisions: [
    {
      id: 1,
      meetingId: 6,
      description: "Program çıktılarının yeniden yapılandırılmasına karar verildi.",
      createdAt: "2025-08-07T11:00:00"
    },
    {
      id: 2,
      meetingId: 2,
      description: "Yeni öğretim yılı planı onaylandı.",
      createdAt: "2025-08-07T14:15:00"
    }
  ]
};

const getters = {
  allDecisions: (s) => s.decisions,

  // Belirli toplantıya ait kararlar (tarihe göre yeni -> eski)
  getDecisionsByMeetingId: (s) => (meetingId) =>
    s.decisions
      .filter(d => d.meetingId === meetingId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

  // Son karar (tek kayıt)
  getLastDecisionForMeeting: (s, g) => (meetingId) => {
    const list = g.getDecisionsByMeetingId(meetingId);
    return list[0] || null;
  }
};

const mutations = {
  ADD_DECISION(state, decision) {
    state.decisions.push(decision);
  },
  SET_DECISIONS(state, list) {
    state.decisions = Array.isArray(list) ? list : [];
  }
};

const actions = {
  // Toplantı bitince veya süreçte karar ekleme
  addDecision({ commit }, { meetingId, description, createdAt }) {
    if (!meetingId) throw new Error("meetingId zorunludur.");
    if (!description || !description.trim()) throw new Error("Açıklama zorunludur.");

    const item = {
      id: Date.now(), // mock ID, backend geldiğinde gerçek ID döner
      meetingId,
      description: description.trim(),
      createdAt: createdAt || new Date().toISOString(),
    };

    commit("ADD_DECISION", item);
    return item;
  },

  // API geldiğinde senkronizasyon için
  loadDecisions({ commit }, list) {
    commit("SET_DECISIONS", list);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
