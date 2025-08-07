export default {
  namespaced: true,
  state: {
    specialDays: [],
    loading: false,
    error: null
  },
  getters: {
    allSpecialDays: state => state.specialDays,
    specialDaysByDate: state => date => state.specialDays.find(day => day.date === date),
    isSpecialDay: state => date => state.specialDays.some(day => day.date === date),
    upcomingSpecialDays: state => {
      const today = new Date().toISOString().split('T')[0]
      return state.specialDays.filter(day => day.date >= today)
    },
    isLoading: state => state.loading
  },
  mutations: {
    SET_SPECIAL_DAYS(state, specialDays) {
      state.specialDays = specialDays
    },
    ADD_SPECIAL_DAY(state, specialDay) {
      state.specialDays.push(specialDay)
    },
    UPDATE_SPECIAL_DAY(state, updatedSpecialDay) {
      const index = state.specialDays.findIndex(d => d.id === updatedSpecialDay.id)
      if (index !== -1) {
        state.specialDays.splice(index, 1, updatedSpecialDay)
      }
    },
    DELETE_SPECIAL_DAY(state, specialDayId) {
      state.specialDays = state.specialDays.filter(d => d.id !== specialDayId)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchSpecialDays({ commit }) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.get('/special-days')
        
        // Mock data
        const mockSpecialDays = [
          {
            id: 1,
            date: '2024-01-01',
            description: 'Yılbaşı Tatili',
            type: 'holiday'
          },
          {
            id: 2,
            date: '2024-04-23',
            description: 'Ulusal Egemenlik ve Çocuk Bayramı',
            type: 'holiday'
          },
          {
            id: 3,
            date: '2024-05-01',
            description: 'İşçi Bayramı',
            type: 'holiday'
          },
          {
            id: 4,
            date: '2024-05-19',
            description: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
            type: 'holiday'
          },
          {
            id: 5,
            date: '2024-12-25',
            description: 'Sistem Bakım Günü',
            type: 'maintenance'
          }
        ]
        
        commit('SET_SPECIAL_DAYS', mockSpecialDays)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createSpecialDay({ commit }, specialDayData) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.post('/special-days', specialDayData)
        
        const newSpecialDay = {
          ...specialDayData,
          id: Date.now()
        }
        
        commit('ADD_SPECIAL_DAY', newSpecialDay)
        return newSpecialDay
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateSpecialDay({ commit }, { id, updates }) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.put(`/special-days/${id}`, updates)
        
        const updatedSpecialDay = { id, ...updates }
        commit('UPDATE_SPECIAL_DAY', updatedSpecialDay)
        return updatedSpecialDay
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteSpecialDay({ commit }, specialDayId) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // await api.delete(`/special-days/${specialDayId}`)
        
        commit('DELETE_SPECIAL_DAY', specialDayId)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}