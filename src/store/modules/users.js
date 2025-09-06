// store/modules/users.js
const state = {
  users: [
    { id: 1, name: "Ahmet Yılmaz",       email: "user@subu.edu.tr",       password: "123456", role: "User" },
    { id: 2, name: "Ali Admin",          email: "admin@subu.edu.tr",      password: "123456", role: "Admin" },
    { id: 3, name: "Seda Süper",         email: "superadmin@subu.edu.tr", password: "123456", role: "SuperAdmin" },
    { id: 4, name: "Rektör Yardımcısı",  email: "ustmakam@subu.edu.tr",   password: "123456", role: "UstMakam" },
    { id: 5, name: "Veli Demir",         email: "veli@subu.edu.tr",       password: "123456", role: "User" },
    { id: 6, name: "Zeynep Kaya",        email: "zeynep@subu.edu.tr",     password: "123456", role: "User" },
  ],
};

const getters = {
  allUsers:    (s) => s.users,
  getUserById: (s) => (id) => s.users.find(u => u.id === id),
};

const mutations = {
  UPDATE_USER_ROLE(state, { userId, role }) {
    const u = state.users.find(x => x.id === userId);
    if (u) u.role = role;
  },
  ADD_USER(state, payload) {
    state.users.push({ id: Date.now(), ...payload });
  },
  REMOVE_USER(state, userId) {
    state.users = state.users.filter(u => u.id !== userId);
  },
};

const actions = {
  // Bileşenlerden beklenen action
  updateUserRole({ commit }, { userId, role }) {
    // API çağrısı gelecekse burada yapılır
    commit("UPDATE_USER_ROLE", { userId, role });
  },

  // İleride gerekirse
  addUser({ commit }, payload) {
    commit("ADD_USER", payload);
  },
  removeUser({ commit }, userId) {
    commit("REMOVE_USER", userId);
  },
};

export default { namespaced: true, state, getters, mutations, actions };
