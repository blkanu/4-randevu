// store/modules/users.js
const state = {
  users: [
    { id: 1, name: "Ahmet Yılmaz", email: "user@subu.edu.tr", password: "123456", role: "User" },
    { id: 2, name: "Ali Admin", email: "admin@subu.edu.tr", password: "123456", role: "Admin" },
    { id: 3, name: "Seda Süper", email: "superadmin@subu.edu.tr", password: "123456", role: "SuperAdmin" },
    { id: 4, name: "Rektör Yardımcısı", email: "ustduzey@subu.edu.tr", password: "123456", role: "UstMakam" },
    { id: 5, name: "Veli Demir", email: "veli@subu.edu.tr", password: "123456", role: "User" },
    { id: 6, name: "Zeynep Kaya", email: "zeynep@subu.edu.tr", password: "123456", role: "User" },
  ],
};

const getters = {
  allUsers: (state) => state.users,
  getUserById: (state) => (id) => state.users.find((u) => u.id === id),
};

export default {
  namespaced: true,
  state,
  getters,
};
