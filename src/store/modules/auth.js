const state = {
  user: JSON.parse(localStorage.getItem('user')) || null,
};

const getters = {
  isAuthenticated: (state) => !!state.user,
  user: (state) => state.user,
  userRole: (state) => state.user?.role || '',
  userRoleLabel: (state) => {
    const labels = {
      User: 'Kullanıcı',
      Admin: 'Salon Yöneticisi',
      SuperAdmin: 'Süper Admin',
      UstMakam: 'Üst Düzey',
    };
    return labels[state.user?.role] || 'Kullanıcı';
  },
};

const actions = {
  login({ commit, rootGetters }, { email, password }) {
    return new Promise((resolve, reject) => {
      const allUsers = rootGetters["users/allUsers"];

      const matchedUser = allUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (matchedUser) {
        // şifreyi localStorage'a kaydetmeye gerek yok
        const userToStore = { ...matchedUser };
        delete userToStore.password;

        commit("SET_USER", userToStore);
        resolve(userToStore);
      } else {
        reject(new Error("E-posta veya şifre hatalı"));
      }
    });
  },

  logout({ commit }) {
    commit('SET_USER', null);
  },
};

const mutations = {
  SET_USER(state, user) {
    state.user = user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
