import axios from 'axios'

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin', 
  USER: 'User',
  UST_MAKAM: 'UstMakam'
}

const state = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loginError: null
}

const getters = {
  currentUser: state => state.user,
  isAuthenticated: state => state.isAuthenticated,
  userRole: state => state.user ? state.user.role : null,
  isSuperAdmin: state => state.user && state.user.role === USER_ROLES.SUPER_ADMIN,
  isAdmin: state => state.user && state.user.role === USER_ROLES.ADMIN,
  isUser: state => state.user && state.user.role === USER_ROLES.USER,
  isUstMakam: state => state.user && state.user.role === USER_ROLES.UST_MAKAM,
  canManageRooms: state => state.user && [USER_ROLES.SUPER_ADMIN].includes(state.user.role),
  canManageUsers: state => state.user && [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(state.user.role),
  canApproveAppointments: state => state.user && [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN].includes(state.user.role),
  hasAccessToAllRooms: state => state.user && [USER_ROLES.SUPER_ADMIN, USER_ROLES.UST_MAKAM].includes(state.user.role),
  loginError: state => state.loginError
}

const mutations = {
  SET_USER(state, user) {
    state.user = user
    state.isAuthenticated = !!user
  },
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
  },
  SET_LOGIN_ERROR(state, error) {
    state.loginError = error
  },
  CLEAR_LOGIN_ERROR(state) {
    state.loginError = null
  }
}

const actions = {
  async login({ commit }, credentials) {
    try {
      commit('CLEAR_LOGIN_ERROR')
      
      // Validate email domain
      if (!credentials.email.endsWith('@subu.edu.tr')) {
        throw new Error('Sadece @subu.edu.tr uzantılı email adresleri kullanılabilir')
      }

      // Mock authentication for demo purposes
      const mockUsers = {
        'admin@subu.edu.tr': {
          id: 1,
          email: 'admin@subu.edu.tr',
          firstName: 'Admin',
          lastName: 'Kullanıcı',
          role: USER_ROLES.ADMIN,
          department: 'Bilgi İşlem',
          isActive: true
        },
        'user@subu.edu.tr': {
          id: 2,
          email: 'user@subu.edu.tr',
          firstName: 'Test',
          lastName: 'Kullanıcı',
          role: USER_ROLES.USER,
          department: 'Mühendislik',
          isActive: true
        },
        'ustmakam@subu.edu.tr': {
          id: 3,
          email: 'ustmakam@subu.edu.tr',
          firstName: 'Üst',
          lastName: 'Makam',
          role: USER_ROLES.UST_MAKAM,
          department: 'Rektörlük',
          isActive: true
        },
        'superadmin@subu.edu.tr': {
          id: 4,
          email: 'superadmin@subu.edu.tr',
          firstName: 'Süper',
          lastName: 'Admin',
          role: USER_ROLES.SUPER_ADMIN,
          department: 'Sistem Yönetimi',
          isActive: true
        }
      }

      const mockPasswords = {
        'admin@subu.edu.tr': 'admin123',
        'user@subu.edu.tr': 'user123',
        'ustmakam@subu.edu.tr': 'ustmakam123',
        'superadmin@subu.edu.tr': 'superadmin123'
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const user = mockUsers[credentials.email]
      const expectedPassword = mockPasswords[credentials.email]

      if (!user || credentials.password !== expectedPassword) {
        throw new Error('Email adresi veya şifre hatalı')
      }

      const token = 'mock_jwt_token_' + Date.now()
      
      commit('SET_USER', user)
      commit('SET_TOKEN', token)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.message || 'Giriş yapılırken bir hata oluştu'
      commit('SET_LOGIN_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    }
  },

  async logout({ commit }) {
    try {
      // Call logout endpoint if needed
      await axios.post('/auth/logout')
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      commit('SET_USER', null)
      commit('SET_TOKEN', null)
      commit('CLEAR_LOGIN_ERROR')
    }
  },

  async checkAuth({ commit, state }) {
    if (state.token) {
      try {
        // Mock user verification for demo
        if (state.token.startsWith('mock_jwt_token_')) {
          // Token is valid, user is already set
          return true
        } else {
          // Invalid token
          commit('SET_USER', null)
          commit('SET_TOKEN', null)
          return false
        }
      } catch (error) {
        // Token is invalid
        commit('SET_USER', null)
        commit('SET_TOKEN', null)
        return false
      }
    }
    return false
  },

  clearLoginError({ commit }) {
    commit('CLEAR_LOGIN_ERROR')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}