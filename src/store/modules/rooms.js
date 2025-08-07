export default {
  namespaced: true,
  state: {
    rooms: [],
    loading: false,
    error: null
  },
  getters: {
    allRooms: state => state.rooms,
    activeRooms: state => state.rooms.filter(room => room.status === 'Aktif'),
    passiveRooms: state => state.rooms.filter(room => room.status === 'Pasif'),
    roomById: state => id => state.rooms.find(room => room.id === id),
    isLoading: state => state.loading
  },
  mutations: {
    SET_ROOMS(state, rooms) {
      state.rooms = rooms
    },
    ADD_ROOM(state, room) {
      state.rooms.push(room)
    },
    UPDATE_ROOM(state, updatedRoom) {
      const index = state.rooms.findIndex(r => r.id === updatedRoom.id)
      if (index !== -1) {
        state.rooms.splice(index, 1, updatedRoom)
      }
    },
    DELETE_ROOM(state, roomId) {
      state.rooms = state.rooms.filter(r => r.id !== roomId)
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchRooms({ commit }) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.get('/rooms')
        
        // Mock data for 12 rooms as specified
        const mockRooms = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          name: `Toplantı Salonu ${i + 1}`,
          capacity: Math.floor(Math.random() * 20) + 10, // 10-30 capacity
          status: i < 10 ? 'Aktif' : 'Pasif', // First 10 active, last 2 passive
          equipment: ['Projektor', 'Beyaz Tahta', 'Wi-Fi'],
          description: `${i + 1}. toplantı salonu açıklaması`
        }))
        
        commit('SET_ROOMS', mockRooms)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createRoom({ commit }, roomData) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.post('/rooms', roomData)
        
        const newRoom = {
          ...roomData,
          id: Date.now(),
          status: 'Aktif'
        }
        
        commit('ADD_ROOM', newRoom)
        return newRoom
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateRoom({ commit }, { id, updates }) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.put(`/rooms/${id}`, updates)
        
        const updatedRoom = { id, ...updates }
        commit('UPDATE_ROOM', updatedRoom)
        return updatedRoom
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteRoom({ commit }, roomId) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // await api.delete(`/rooms/${roomId}`)
        
        commit('DELETE_ROOM', roomId)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async toggleRoomStatus({ dispatch }, room) {
      const newStatus = room.status === 'Aktif' ? 'Pasif' : 'Aktif'
      return await dispatch('updateRoom', {
        id: room.id,
        updates: { ...room, status: newStatus }
      })
    }
  }
}