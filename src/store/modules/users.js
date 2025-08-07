import axios from 'axios'
import { USER_ROLES } from './auth'

const state = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  filters: {
    role: '',
    isActive: null,
    searchTerm: ''
  }
}

const getters = {
  allUsers: state => state.users,
  activeUsers: state => state.users.filter(user => user.isActive),
  currentUser: state => state.currentUser,
  userById: state => id => state.users.find(user => user.id === id),
  usersByRole: state => role => state.users.filter(user => user.role === role),
  admins: state => state.users.filter(user => user.role === USER_ROLES.ADMIN),
  superAdmins: state => state.users.filter(user => user.role === USER_ROLES.SUPER_ADMIN),
  regularUsers: state => state.users.filter(user => user.role === USER_ROLES.USER),
  ustMakamUsers: state => state.users.filter(user => user.role === USER_ROLES.UST_MAKAM),
  filteredUsers: state => {
    let filtered = [...state.users]
    
    if (state.filters.role) {
      filtered = filtered.filter(user => user.role === state.filters.role)
    }
    
    if (state.filters.isActive !== null) {
      filtered = filtered.filter(user => user.isActive === state.filters.isActive)
    }
    
    if (state.filters.searchTerm) {
      const searchTerm = state.filters.searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.department?.toLowerCase().includes(searchTerm)
      )
    }
    
    return filtered.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
  },
  isLoading: state => state.loading,
  error: state => state.error
}

const mutations = {
  SET_USERS(state, users) {
    state.users = users
  },
  ADD_USER(state, user) {
    state.users.push(user)
  },
  UPDATE_USER(state, updatedUser) {
    const index = state.users.findIndex(user => user.id === updatedUser.id)
    if (index !== -1) {
      state.users.splice(index, 1, updatedUser)
    }
  },
  REMOVE_USER(state, userId) {
    state.users = state.users.filter(user => user.id !== userId)
  },
  SET_CURRENT_USER(state, user) {
    state.currentUser = user
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  CLEAR_ERROR(state) {
    state.error = null
  },
  SET_FILTERS(state, filters) {
    state.filters = { ...state.filters, ...filters }
  },
  CLEAR_FILTERS(state) {
    state.filters = {
      role: '',
      isActive: null,
      searchTerm: ''
    }
  }
}

const actions = {
  async fetchUsers({ commit }, params = {}) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.get('/users', { params })
      commit('SET_USERS', response.data.users)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Kullanıcılar yüklenirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchUser({ commit }, userId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.get(`/users/${userId}`)
      commit('SET_CURRENT_USER', response.data.user)
      
      return { success: true, user: response.data.user }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Kullanıcı yüklenirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createUser({ commit }, userData) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // Validate email domain
      if (!userData.email.endsWith('@subu.edu.tr')) {
        throw new Error('Email adresi @subu.edu.tr uzantısı ile bitmelidir')
      }
      
      const response = await axios.post('/users', userData)
      commit('ADD_USER', response.data.user)
      
      return { success: true, user: response.data.user }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Kullanıcı oluşturulurken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateUser({ commit }, { userId, data }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // Validate email domain if email is being updated
      if (data.email && !data.email.endsWith('@subu.edu.tr')) {
        throw new Error('Email adresi @subu.edu.tr uzantısı ile bitmelidir')
      }
      
      const response = await axios.put(`/users/${userId}`, data)
      commit('UPDATE_USER', response.data.user)
      
      return { success: true, user: response.data.user }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Kullanıcı güncellenirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteUser({ commit }, userId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      await axios.delete(`/users/${userId}`)
      commit('REMOVE_USER', userId)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Kullanıcı silinirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async toggleUserStatus({ commit }, userId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.patch(`/users/${userId}/toggle-status`)
      commit('UPDATE_USER', response.data.user)
      
      return { success: true, user: response.data.user }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Kullanıcı durumu değiştirilirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async assignUserRole({ commit }, { userId, role }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      if (!Object.values(USER_ROLES).includes(role)) {
        throw new Error('Geçersiz kullanıcı rolü')
      }
      
      const response = await axios.patch(`/users/${userId}/role`, { role })
      commit('UPDATE_USER', response.data.user)
      
      return { success: true, user: response.data.user }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Kullanıcı rolü atanırken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async resetUserPassword({ commit }, userId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.patch(`/users/${userId}/reset-password`)
      
      return { 
        success: true, 
        message: response.data.message || 'Şifre sıfırlama e-postası gönderildi'
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Şifre sıfırlanırken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  setFilters({ commit }, filters) {
    commit('SET_FILTERS', filters)
  },

  clearFilters({ commit }) {
    commit('CLEAR_FILTERS')
  },

  clearError({ commit }) {
    commit('CLEAR_ERROR')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}