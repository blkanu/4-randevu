import axios from 'axios'

const state = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null
}

const getters = {
  allRooms: state => state.rooms,
  activeRooms: state => state.rooms.filter(room => room.isActive),
  currentRoom: state => state.currentRoom,
  roomById: state => id => state.rooms.find(room => room.id === id),
  roomsForUser: (state, getters, rootState) => {
    const user = rootState.auth.user
    if (!user) return []
    
    // UstMakam and SuperAdmin can access all rooms
    if (['UstMakam', 'SuperAdmin'].includes(user.role)) {
      return state.rooms.filter(room => room.isActive)
    }
    
    // Admin can access assigned rooms
    if (user.role === 'Admin') {
      return state.rooms.filter(room => room.isActive && room.adminIds?.includes(user.id))
    }
    
    // Regular users can access public rooms or rooms they have permission for
    return state.rooms.filter(room => room.isActive && (room.isPublic || room.allowedUserIds?.includes(user.id)))
  },
  isLoading: state => state.loading,
  error: state => state.error
}

const mutations = {
  SET_ROOMS(state, rooms) {
    state.rooms = rooms
  },
  ADD_ROOM(state, room) {
    state.rooms.push(room)
  },
  UPDATE_ROOM(state, updatedRoom) {
    const index = state.rooms.findIndex(room => room.id === updatedRoom.id)
    if (index !== -1) {
      state.rooms.splice(index, 1, updatedRoom)
    }
  },
  REMOVE_ROOM(state, roomId) {
    state.rooms = state.rooms.filter(room => room.id !== roomId)
  },
  SET_CURRENT_ROOM(state, room) {
    state.currentRoom = room
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  async fetchRooms({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // Mock rooms data
      const mockRooms = [
        {
          id: 1,
          name: 'Konferans Salonu A',
          capacity: 50,
          location: 'Ana Bina 1. Kat',
          isActive: true,
          isPublic: true,
          equipment: ['Projeksiyon', 'Ses Sistemi', 'Klima'],
          adminIds: [1]
        },
        {
          id: 2,
          name: 'Toplantı Salonu B',
          capacity: 20,
          location: 'Ana Bina 2. Kat',
          isActive: true,
          isPublic: true,
          equipment: ['TV', 'Beyaz Tahta'],
          adminIds: [1]
        },
        {
          id: 3,
          name: 'Senato Salonu',
          capacity: 100,
          location: 'Rektörlük Binası',
          isActive: true,
          isPublic: false,
          equipment: ['Projeksiyon', 'Ses Sistemi', 'Klima', 'Simultane Çeviri'],
          adminIds: [1],
          allowedUserIds: [3, 4]
        },
        {
          id: 4,
          name: 'Seminer Salonu',
          capacity: 30,
          location: 'Akademik Bina',
          isActive: true,
          isPublic: true,
          equipment: ['Projeksiyon', 'Beyaz Tahta'],
          adminIds: [1]
        }
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      commit('SET_ROOMS', mockRooms)
      
      return { success: true }
    } catch (error) {
      const errorMessage = 'Toplantı salonları yüklenirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchRoom({ commit }, roomId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.get(`/rooms/${roomId}`)
      commit('SET_CURRENT_ROOM', response.data.room)
      
      return { success: true, room: response.data.room }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Toplantı salonu yüklenirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createRoom({ commit }, roomData) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.post('/rooms', roomData)
      commit('ADD_ROOM', response.data.room)
      
      return { success: true, room: response.data.room }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Toplantı salonu oluşturulurken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateRoom({ commit }, { roomId, data }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.put(`/rooms/${roomId}`, data)
      commit('UPDATE_ROOM', response.data.room)
      
      return { success: true, room: response.data.room }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Toplantı salonu güncellenirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteRoom({ commit }, roomId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      await axios.delete(`/rooms/${roomId}`)
      commit('REMOVE_ROOM', roomId)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Toplantı salonu silinirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async toggleRoomStatus({ commit }, roomId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.patch(`/rooms/${roomId}/toggle-status`)
      commit('UPDATE_ROOM', response.data.room)
      
      return { success: true, room: response.data.room }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Salon durumu değiştirilirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async checkRoomAvailability({ commit }, { roomId, date, startTime, endTime, excludeAppointmentId = null }) {
    try {
      const params = {
        roomId,
        date,
        startTime,
        endTime
      }
      
      if (excludeAppointmentId) {
        params.excludeAppointmentId = excludeAppointmentId
      }
      
      const response = await axios.get('/rooms/check-availability', { params })
      
      return { 
        success: true, 
        isAvailable: response.data.isAvailable,
        conflicts: response.data.conflicts || []
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Salon müsaitliği kontrol edilirken hata oluştu'
      return { success: false, error: errorMessage }
    }
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