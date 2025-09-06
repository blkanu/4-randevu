// store/modules/meetings.js

const state = {
  meetings: [
    {
      id: 1,
      title: "Akreditasyon Hazırlığı",
      agenda: "Program çıktılarının gözden geçirilmesi",
      date: "2025-01-08",
      startTime: "10:00",
      endTime: "11:00",
      roomId: 1,
      ownerId: 1,
      owner: { id: 1, name: "Ahmet Yılmaz", email: "user@subu.edu.tr" },
      participants: [2, 3, 6],
      agendaItems: [{ text: "Danışma kurulu raporları değerlendirilecek", userId: 2 }],
      decisions: [],
      status: "Onaylandi",
    },
    {
      id: 2,
      title: "Lisans Kurulu Değerlendirmesi",
      agenda: "Yeni öğretim yılı planlaması",
      date: "2025-01-15",
      startTime: "13:00",
      endTime: "14:00",
      roomId: 2,
      ownerId: 5,
      owner: { id: 5, name: "Zeynep Kaya", email: "zeynep@subu.edu.tr" },
      participants: [1, 4, 6],
      agendaItems: [],
      decisions: [],
      status: "Beklemede",
    },
    {
      id: 3,
      title: "Yönetim Kurulu Toplantısı",
      agenda: "Stratejik planlama",
      date: "2025-01-09",
      startTime: "09:00",
      endTime: "10:00",
      roomId: 3,
      ownerId: 2,
      owner: { id: 2, name: "Ali Admin", email: "ali@subu.edu.tr" },
      participants: [1, 4, 6],
      agendaItems: [],
      decisions: [],
      status: "Reddedildi",
    },
    {
      id: 4,
      title: "Akademik Yıl Açılışı",
      agenda: "Yeni akademik yılın açılışı",
      date: "2025-01-19",
      startTime: "11:00",
      endTime: "12:00",
      roomId: 1,
      ownerId: 3,
      owner: { id: 3, name: "Seda Süper", email: "seda@subu.edu.tr" },
      participants: [2, 5, 6],
      agendaItems: [],
      decisions: [],
      status: "Iptal",
    },
    {
      id: 5,
      title: "Araştırma Projeleri Değerlendirme",
      agenda: "Yeni projelerin değerlendirilmesi",
      date: "2025-01-11",
      startTime: "15:00",
      endTime: "16:00",
      roomId: 4,
      ownerId: 4,
      owner: { id: 4, name: "Rektör Yardımcısı", email: "rektor@subu.edu.tr" },
      participants: [1, 3, 6],
      agendaItems: [],
      decisions: [],
      status: "Onaylandi",
    },
    {
      id: 6,
      title: "Öğrenci Temsilcileri Toplantısı",
      agenda: "Öğrenci temsilcileri ile görüşme",
      date: "2025-01-25",
      startTime: "14:00",
      endTime: "17:00",
      roomId: 5,
      ownerId: 5,
      owner: { id: 5, name: "Veli Demir", email: "veli@subu.edu.tr" },
      participants: [1, 4, 6],
      agendaItems: [],
      decisions: [],
      status: "Onaylandi",
    },
    {
      id: 7,
      title: "Eğitim Komisyonu Toplantısı",
      agenda: "Müfredat güncellemeleri",
      date: "2025-12-15",
      startTime: "10:00",
      endTime: "11:00",
      roomId: 3,
      ownerId: 2,
      owner: { id: 2, name: "Ali Admin", email: "admin@subu.edu.tr" },
      participants: [1, 5, 6],
      agendaItems: [],
      decisions: [],
      status: "Beklemede",
    },
    {
      id: 8,
      title: "Araştırma Proje Değerlendirme",
      agenda: "Yeni araştırma projelerinin incelenmesi",
      date: "2025-12-20",
      startTime: "14:00",
      endTime: "15:00",
      roomId: 4,
      ownerId: 3,
      owner: { id: 3, name: "Seda Süper", email: "seda@subu.edu.tr" },
      participants: [1, 2, 4],
      agendaItems: [],
      decisions: [],
      status: "Beklemede",
    },
    {
      id: 9,
      title: "Kalite Komisyonu Toplantısı",
      agenda: "Kalite standartları ve iyileştirmeler",
      date: "2025-12-25",
      startTime: "09:00",
      endTime: "10:00",
      roomId: 5,
      ownerId: 4,
      owner: { id: 4, name: "Rektör Yardımcısı", email: "ustmakam@subu.edu.tr" },
      participants: [1, 2, 3],
      agendaItems: [],
      decisions: [],
      status: "Beklemede",
    },
  ],
};

/* ----- Ortak zaman yardımcıları ----- */
function startDT(m) { return new Date(`${m.date}T${m.startTime}`); }
function endDT(m)   { return new Date(`${m.date}T${m.endTime}`); }
function nowDT()    { return new Date(); }

const getters = {
  allMeetings: (s) => s.meetings,
  meetingById: (s) => (id) => s.meetings.find(m => m.id === id),

  pendingMeetings: (s) => s.meetings.filter(m => m.status === "Beklemede"),

  pendingMeetingsForAdmin: (s, g, rS, rG) => (adminUserId) => {
    const rooms = rG["rooms/allRooms"];
    const roomIds = rooms.filter(r => r.adminId === adminUserId).map(r => r.id);
    return s.meetings.filter(m => m.status === "Beklemede" && roomIds.includes(m.roomId));
  },

  /* Aktif = Onaylandı ve bitiş gelecekte (devam edenler dahil) */
  activeMeetings: (s) => {
    const now = nowDT();
    return s.meetings.filter(m => m.status === "Onaylandi" && endDT(m) > now);
  },

  /* 7 gün penceresi: start ≤ now+7gün ve end > now (onaylı) */
  upcomingWithin7Days: (s) => {
    const now = nowDT();
    const in7 = new Date(now); in7.setDate(in7.getDate() + 7);
    return s.meetings.filter(m =>
      m.status === "Onaylandi" &&
      endDT(m) > now &&
      startDT(m) <= in7
    ).sort((a, b) => startDT(a) - startDT(b));
  },

  /* Geçmiş = end ≤ now */
  pastMeetings: (s) => {
    const now = nowDT();
    return s.meetings.filter(m => endDT(m) <= now);
  },

  userMeetings: (s) => (userId) =>
    s.meetings.filter(m => m.ownerId === userId || (m.participants || []).includes(userId)),

  meetingsByRoom: (s) => (roomId) => s.meetings.filter(m => m.roomId === roomId),

  todayMeetingsByRoom: (s, g) => (roomId) => {
    const today = new Date().toISOString().split("T")[0];
    return g.meetingsByRoom(roomId).filter(m => m.date === today);
  },
};

const mutations = {
  ADD_AGENDA_ITEM(state, { meetingId, text, userId }) {
    const m = state.meetings.find(m => m.id === meetingId);
    if (m) m.agendaItems.push({ text, userId });
  },
  ADD_DECISION(state, { meetingId, text }) {
    const m = state.meetings.find(m => m.id === meetingId);
    if (m) m.decisions.push({ id: Date.now(), description: text, createdAt: new Date().toISOString() });
  },
  CREATE_MEETING(state, meetingData) {
    state.meetings.push({
      id: Date.now(),
      ...meetingData,
      status: meetingData.status || "Beklemede",
      agendaItems: meetingData.agendaItems || [],
      decisions: [],
    });
  },
  UPDATE_MEETING_STATUS(state, { id, status }) {
    const m = state.meetings.find(x => x.id === id);
    if (m) m.status = status;
  },
};

// yardımcılar
function startInFuture(meeting) {
  return startDT(meeting) > nowDT();
}

function canUpdateStatus(ctx, meeting, nextStatus) {
  const me = ctx.rootGetters["auth/user"];
  if (!me) return false;

  const myRole = me.role; // "Admin" | "SuperAdmin" | "UstMakam" | "User"
  if (myRole === "SuperAdmin" || myRole === "UstMakam") return true; // tam yetki

  // OWNER: Onaylandi → Iptal (başlamadıysa)
  if (me.id === meeting.ownerId) {
    if (meeting.status === "Onaylandi" && nextStatus === "Iptal" && startInFuture(meeting)) {
      return true;
    }
  }

  if (myRole === "Admin") {
    const roomAdminId = ctx.rootGetters["rooms/getRoomById"](meeting.roomId)?.adminId;
    const isRoomAdmin = roomAdminId === me.id;

    // Admin: Beklemede → (Onay / Reddet)
    if (meeting.status === "Beklemede") return isRoomAdmin;

    // Admin: Onaylandi → Iptal (başlamadıysa)
    if (isRoomAdmin && meeting.status === "Onaylandi" && nextStatus === "Iptal" && startInFuture(meeting)) {
      return true;
    }

    return false;
  }

  return false;
}

const actions = {
  addAgendaItem({ commit }, payload) {
    commit("ADD_AGENDA_ITEM", payload);
  },

  addDecision({ commit }, payload) {
    commit("ADD_DECISION", payload);
  },

  createMeeting({ commit, rootGetters }, meetingData) {
    const me = rootGetters["auth/user"];
    const normalized = {
      ...meetingData,
      ownerId: meetingData.ownerId || me?.id,
      owner: meetingData.owner || (me ? { id: me.id, name: me.name, email: me.email } : null),
    };
    commit("CREATE_MEETING", normalized);
  },

  updateMeetingStatus(ctx, { id, status }) {
    const meeting = ctx.getters.meetingById(id);
    if (!meeting) return Promise.reject(new Error("Toplantı bulunamadı."));

    if (!canUpdateStatus(ctx, meeting, status)) {
      return Promise.reject(new Error("Bu işlem için yetkiniz yok."));
    }

    ctx.commit("UPDATE_MEETING_STATUS", { id, status });
    return Promise.resolve();
  },

  // E-posta bildirimi mock
  sendMeetingNotification() {
    return Promise.resolve();
  },
};

export default { namespaced: true, state, getters, mutations, actions };
