// store/modules/rooms.js
import { ROOM_STATUS } from "@/utils/constants";

const state = {
  rooms: [
    { id: 1, name: "Toplantı Salonu A", capacity: 10, status: ROOM_STATUS.AKTIF,  adminId: 1 },
    { id: 2, name: "Salon B",            capacity: 12, status: ROOM_STATUS.AKTIF,  adminId: 2 },
    { id: 3, name: "Büyük Salon",        capacity: 20, status: ROOM_STATUS.AKTIF,  adminId: 3 },
    { id: 4, name: "Küçük Salon",        capacity:  8, status: ROOM_STATUS.PASIF,  adminId: 4 }, // Test için pasif
    { id: 5, name: "Konferans Salonu",   capacity: 30, status: ROOM_STATUS.AKTIF,  adminId: 5 },
    { id: 6, name: "Toplantı Salonu C",  capacity: 15, status: ROOM_STATUS.BAKIMDA, adminId: 2 }, // Test için bakımda
  ],
};

const getters = {
  allRooms:     (s) => s.rooms,
  getRoomById:  (s) => (id) => s.rooms.find(r => r.id === id),
  activeRooms:  (s) => s.rooms.filter(r => r.status === ROOM_STATUS.AKTIF),
  roomsByAdmin: (s) => (adminId) => s.rooms.filter(r => r.adminId === adminId),
};

const mutations = {
  ADD_ROOM(state, room) {
    state.rooms.push(room);
  },
  UPDATE_ROOM(state, updatedRoom) {
    const idx = state.rooms.findIndex(r => r.id === updatedRoom.id);
    if (idx !== -1) state.rooms.splice(idx, 1, { ...state.rooms[idx], ...updatedRoom });
  },
  SET_ROOM_STATUS(state, { roomId, status }) {
    const idx = state.rooms.findIndex(r => r.id === roomId);
    if (idx !== -1) state.rooms.splice(idx, 1, { ...state.rooms[idx], status });
  },
  CYCLE_ROOM_STATUS(state, roomId) {
    const idx = state.rooms.findIndex(r => r.id === roomId);
    if (idx === -1) return;
    const current = state.rooms[idx];
    let next;
    if (current.status === ROOM_STATUS.AKTIF)      next = ROOM_STATUS.PASIF;
    else if (current.status === ROOM_STATUS.PASIF) next = ROOM_STATUS.BAKIMDA;
    else                                           next = ROOM_STATUS.AKTIF;
    state.rooms.splice(idx, 1, { ...current, status: next });
  },
  DELETE_ROOM(state, roomId) {
    state.rooms = state.rooms.filter(r => r.id !== roomId);
  },
};

const actions = {
  addRoom({ commit }, payload) {
    const id = Date.now();
    commit("ADD_ROOM", { id, status: ROOM_STATUS.AKTIF, adminId: null, ...payload });
  },
  updateRoom({ commit }, updatedRoom) {
    commit("UPDATE_ROOM", updatedRoom);
  },

  // Bileşenlerin beklediği isim
  updateRoomStatus({ commit }, { roomId, status }) {
    // API entegrasyonu burada olabilir
    commit("SET_ROOM_STATUS", { roomId, status });
  },

  // Var olan yardımcılar
  setRoomStatus({ commit }, payload) {
    commit("SET_ROOM_STATUS", payload);
  },
  cycleRoomStatus({ commit }, roomId) {
    commit("CYCLE_ROOM_STATUS", roomId);
  },
  deleteRoom({ commit }, roomId) {
    commit("DELETE_ROOM", roomId);
  },
};

export default { namespaced: true, state, getters, mutations, actions };
