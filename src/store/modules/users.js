export default {
  namespaced: true,
  state: {
    users: [],
    loading: false,
    error: null
  },
  getters: {
    allUsers: state => state.users,
    activeUsers: state => state.users.filter(user => user.isActive),
    usersByRole: state => role => state.users.filter(user => user.role === role),
    admins: state => state.users.filter(user => user.role === 'Admin' || user.role === 'SuperAdmin'),
    regularUsers: state => state.users.filter(user => user.role === 'User'),
    ustMakamUsers: state => state.users.filter(user => user.role === 'UstMakam'),
    userById: state => id => state.users.find(user => user.id === id),
    isLoading: state => state.loading
  },
  mutations: {
    SET_USERS(state, users) {
      state.users = users
    },
    ADD_USER(state, user) {
      state.users.push(user)
    },
    UPDATE_USER(state, updatedUser) {
      const index = state.users.findIndex(u => u.id === updatedUser.id)
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser)
      }
    },
    DELETE_USER(state, userId) {
      state.users = state.users.filter(u => u.id !== userId)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchUsers({ commit }) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.get('/users')
        
        // Mock data
        const mockUsers = [
          {
            id: 1,
            name: 'Ahmet Yılmaz',
            email: 'ahmet.yilmaz@subu.edu.tr',
            role: 'SuperAdmin',
            isActive: true,
            department: 'Bilgi İşlem',
            createdAt: '2024-01-01'
          },
          {
            id: 2,
            name: 'Fatma Demir',
            email: 'fatma.demir@subu.edu.tr',
            role: 'Admin',
            isActive: true,
            department: 'İnsan Kaynakları',
            createdAt: '2024-01-02'
          },
          {
            id: 3,
            name: 'Mehmet Can',
            email: 'mehmet.can@subu.edu.tr',
            role: 'UstMakam',
            isActive: true,
            department: 'Rektörlük',
            createdAt: '2024-01-03'
          },
          {
            id: 4,
            name: 'Ayşe Kaya',
            email: 'ayse.kaya@subu.edu.tr',
            role: 'User',
            isActive: true,
            department: 'Muhasebe',
            createdAt: '2024-01-04'
          }
        ]
        
        commit('SET_USERS', mockUsers)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createUser({ commit }, userData) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.post('/users', userData)
        
        const newUser = {
          ...userData,
          id: Date.now(),
          isActive: true,
          createdAt: new Date().toISOString()
        }
        
        commit('ADD_USER', newUser)
        return newUser
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateUser({ commit }, { id, updates }) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.put(`/users/${id}`, updates)
        
        const updatedUser = { id, ...updates }
        commit('UPDATE_USER', updatedUser)
        return updatedUser
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteUser({ commit }, userId) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // await api.delete(`/users/${userId}`)
        
        commit('DELETE_USER', userId)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async toggleUserStatus({ dispatch }, user) {
      const isActive = !user.isActive
      return await dispatch('updateUser', {
        id: user.id,
        updates: { ...user, isActive }
      })
    },
    
    async changeUserRole({ dispatch }, { userId, newRole }) {
      const user = this.getters['users/userById'](userId)
      if (!user) throw new Error('Kullanıcı bulunamadı')
      
      return await dispatch('updateUser', {
        id: userId,
        updates: { ...user, role: newRole }
      })
    }
  }
}