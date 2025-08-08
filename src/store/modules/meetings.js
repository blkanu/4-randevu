// store/modules/meetings.js

const state = {
  meetings: [
    {
      id: 1,
      title: "Akreditasyon Hazırlığı",
      agenda: "Program çıktılarının gözden geçirilmesi",
      date: "2025-08-08",
      startTime: "10:00",
      endTime: "11:00",
      roomId: 1,
      owner: { id: 1, name: "Ahmet Yılmaz", email: "user@subu.edu.tr" },
      ownerId: 1,
      participants: [2, 3, 6],
      agendaItems: [
        { text: "Danışma kurulu raporları değerlendirilecek", userId: 2 },
      ],
      decisions: [],
      status: "Onaylandi",
    },
    {
      id: 2,
      title: "Lisans Kurulu Değerlendirmesi",
      agenda: "Yeni öğretim yılı planlaması",
      date: "2025-08-08",
      startTime: "13:00",
      endTime: "14:00",
      roomId: 2,
      owner: { id: 5, name: "Zeynep Kaya", email: "zeynep@subu.edu.tr" },
      ownerId: 5,
      participants: [1, 4, 6],
      agendaItems: [],
      decisions: [],
      status: "Beklemede",
    },
    {
      id: 3,
      title: "Yönetim Kurulu Toplantısı",
      agenda: "Stratejik planlama",
      date: "2025-08-08",
      startTime: "09:00",
      endTime: "10:00",
      roomId: 3,
      owner: { id: 2, name: "Ali Admin", email: "ali@subu.edu.tr" },
      ownerId: 2,
      participants: [1, 4, 6],
      agendaItems: [],
      decisions: [],
      status: "Reddedildi",
    },
    {
      id: 4,
      title: "Akademik Yıl Açılışı",
      agenda: "Yeni akademik yılın açılışı",
      date: "2025-08-09",
      startTime: "11:00",
      endTime: "12:00",
      roomId: 1,
      owner: { id: 3, name: "Seda Süper", email: "seda@subu.edu.tr" },
      ownerId: 3,
      participants: [2, 5, 6],
      agendaItems: [],
      decisions: [],
      status: "İptal Edildi",
    },
    {
      id: 5,
      title: "Araştırma Projeleri Değerlendirme",
      agenda: "Yeni projelerin değerlendirilmesi",
      date: "2025-08-01",
      startTime: "15:00",
      endTime: "16:00",
      roomId: 4,
      owner: { id: 4, name: "Rektör Yardımcısı", email: "rektör@subu.edu.tr" },
      ownerId: 1,
      participants: [1, 3, 6],
      agendaItems: [],
      decisions: [],
      status: "Onaylandi",
    },
    {
      id: 6,
      title: "Öğrenci Temsilcileri Toplantısı",
      agenda: "Öğrenci temsilcileri ile görüşme",
      date: "2025-08-05",
      startTime: "14:00",
      endTime: "15:00",
      roomId: 5,
      owner: { id: 5, name: "Veli Demir", email: "veli@subu.edu.tr" },
      ownerId: 5,
      participants: [1, 4, 6],
      agendaItems: [],
      decisions: [],
      status: "Onaylandi",
    },
  ],
};

const getters = {
  allMeetings: (state) => state.meetings,

  meetingById: (state) => (id) => {
    return state.meetings.find((m) => m.id === id);
  },

  activeMeetings: (state) => {
    const now = new Date();
return state.meetings.filter((m) => {
  const meetingDateTime = new Date(`${m.date}T${m.startTime}`);
  return meetingDateTime >= now;
});

  },

  upcomingWithin7Days: (state, getters) =>
    getters.activeMeetings.filter((m) => {
      const now = new Date();
      const in7 = new Date();
      in7.setDate(now.getDate() + 7);
      const date = new Date(m.date);
      return date >= now && date <= in7;
    }),

  pastMeetings: (state) => {
  const now = new Date();
  return state.meetings.filter((m) => {
    const meetingDateTime = new Date(`${m.date}T${m.startTime}`);
    return meetingDateTime < now;
  });
},


  userMeetings: (state) => (userId) =>
    state.meetings.filter(
      (m) => m.ownerId === userId || m.participants.includes(userId)
    ),
};

const mutations = {
  ADD_AGENDA_ITEM(state, { meetingId, text, userId }) {
    const meeting = state.meetings.find((m) => m.id === meetingId);
    if (meeting) {
      meeting.agendaItems.push({ text, userId });
    }
  },

  ADD_DECISION(state, { meetingId, text }) {
    const meeting = state.meetings.find((m) => m.id === meetingId);
    if (meeting) {
      const newDecision = {
        id: Date.now(),
        description: text,
        createdAt: new Date().toISOString(),
      };
      meeting.decisions.push(newDecision);
    }
  },

  CREATE_MEETING(state, meetingData) {
    const newMeeting = {
      id: Date.now(),
      ...meetingData,
      agendaItems: [],
      decisions: [],
    };
    state.meetings.push(newMeeting);
  },
};

const actions = {
  addAgendaItem({ commit }, payload) {
    commit("ADD_AGENDA_ITEM", payload);
  },

  addDecision({ commit }, payload) {
    commit("ADD_DECISION", payload);
  },

  createMeeting({ commit }, meetingData) {
    commit("CREATE_MEETING", meetingData);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
