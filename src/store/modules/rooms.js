// store/modules/rooms.js

const state = {
  rooms: [
    { id: 1, name: "Toplantı Salonu A", capacity: 10 , status: "active"},
    { id: 2, name: "Salon B", capacity: 12 , status: "active"},
    { id: 3, name: "Büyük Salon", capacity: 20 , status: "active"},
    { id: 4, name: "Küçük Salon", capacity: 8 , status: "active"},
    { id: 5, name: "Konferans Salonu", capacity: 30 , status: "active"}
  ],
};

const getters = {
  allRooms: (state) => state.rooms,

  getRoomById: (state) => (id) => {
    return state.rooms.find((room) => room.id === id);
  },
};

const mutations = {
  ADD_ROOM(state, room) {
    state.rooms.push(room);
  },

  UPDATE_ROOM(state, updatedRoom) {
    const index = state.rooms.findIndex((r) => r.id === updatedRoom.id);
    if (index !== -1) {
      state.rooms.splice(index, 1, updatedRoom);
    }
  },

  DELETE_ROOM(state, roomId) {
    state.rooms = state.rooms.filter((room) => room.id !== roomId);
  },
};

const actions = {
  addRoom({ commit }, room) {
    // ileride API çağrısı yapılabilir
    commit("ADD_ROOM", room);
  },

  updateRoom({ commit }, updatedRoom) {
    commit("UPDATE_ROOM", updatedRoom);
  },

  deleteRoom({ commit }, roomId) {
    commit("DELETE_ROOM", roomId);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
