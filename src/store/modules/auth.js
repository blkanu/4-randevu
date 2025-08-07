export default {
  namespaced: true,
  state: {
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem('token') || null
  },
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    user: state => state.user,
    userRole: state => state.user ? state.user.role : null,
    isSuperAdmin: state => state.user && state.user.role === 'SuperAdmin',
    isAdmin: state => state.user && (state.user.role === 'Admin' || state.user.role === 'SuperAdmin'),
    isUstMakam: state => state.user && state.user.role === 'UstMakam',
    isUser: state => state.user && state.user.role === 'User'
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    LOGOUT(state) {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      localStorage.removeItem('token')
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        // API call would go here
        // const response = await api.post('/auth/login', credentials)
        
        // Mock response for now
        const mockUser = {
          id: 1,
          name: credentials.email.split('@')[0],
          email: credentials.email,
          role: 'User', // This would come from backend
          isActive: true
        }
        
        commit('SET_USER', mockUser)
        commit('SET_TOKEN', 'mock-token-' + Date.now())
        
        return { success: true, user: mockUser }
      } catch (error) {
        throw new Error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
      }
    },
    
    logout({ commit }) {
      commit('LOGOUT')
    },
    
    async checkAuth({ commit, state }) {
      if (state.token && !state.user) {
        try {
          // API call to validate token and get user info
          // const response = await api.get('/auth/me')
          // commit('SET_USER', response.data)
          
          // Mock for now - in real app this would validate the token
          return false
        } catch (error) {
          commit('LOGOUT')
          return false
        }
      }
      return !!state.user
    }
  }
}