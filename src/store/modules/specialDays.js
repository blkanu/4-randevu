const state = {
  decisions: [
    {
      id: 1,
      meetingId: 1,
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
  allDecisions: (state) => state.decisions,

  getDecisionsByMeetingId: (state) => (meetingId) =>
    state.decisions.filter((d) => d.meetingId === meetingId),

  getLastDecisionForMeeting: (state) => (meetingId) => {
    const decisions = state.decisions
      .filter((d) => d.meetingId === meetingId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return decisions[0] || null;
  }
};

const mutations = {
  ADD_DECISION(state, decision) {
    state.decisions.push(decision);
  }
};

const actions = {
  addDecision({ commit }, decision) {
    // İleride API entegrasyonu yapılabilir
    // decision objesi: { meetingId, description, createdAt }
    commit("ADD_DECISION", {
      id: Date.now(), // mock id
      ...decision
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
