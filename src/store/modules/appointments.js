import axios from 'axios'
import moment from 'moment'

// Appointment statuses
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

const state = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    roomId: '',
    dateRange: null,
    userId: ''
  }
}

const getters = {
  allAppointments: state => state.appointments,
  currentAppointment: state => state.currentAppointment,
  pendingAppointments: state => state.appointments.filter(apt => apt.status === APPOINTMENT_STATUS.PENDING),
  approvedAppointments: state => state.appointments.filter(apt => apt.status === APPOINTMENT_STATUS.APPROVED),
  rejectedAppointments: state => state.appointments.filter(apt => apt.status === APPOINTMENT_STATUS.REJECTED),
  userAppointments: (state, getters, rootState) => {
    const userId = rootState.auth.user?.id
    return state.appointments.filter(apt => apt.userId === userId)
  },
  todayAppointments: state => {
    const today = moment().format('YYYY-MM-DD')
    return state.appointments.filter(apt => apt.date === today)
  },
  upcomingAppointments: state => {
    const now = moment()
    return state.appointments.filter(apt => {
      const aptDateTime = moment(`${apt.date} ${apt.startTime}`)
      return aptDateTime.isAfter(now) && apt.status === APPOINTMENT_STATUS.APPROVED
    })
  },
  filteredAppointments: state => {
    let filtered = [...state.appointments]
    
    if (state.filters.status) {
      filtered = filtered.filter(apt => apt.status === state.filters.status)
    }
    
    if (state.filters.roomId) {
      filtered = filtered.filter(apt => apt.roomId === state.filters.roomId)
    }
    
    if (state.filters.userId) {
      filtered = filtered.filter(apt => apt.userId === state.filters.userId)
    }
    
    if (state.filters.dateRange) {
      const { start, end } = state.filters.dateRange
      filtered = filtered.filter(apt => {
        const aptDate = moment(apt.date)
        return aptDate.isBetween(start, end, 'day', '[]')
      })
    }
    
    return filtered.sort((a, b) => moment(`${a.date} ${a.startTime}`).diff(moment(`${b.date} ${b.startTime}`)))
  },
  isLoading: state => state.loading,
  error: state => state.error
}

const mutations = {
  SET_APPOINTMENTS(state, appointments) {
    state.appointments = appointments
  },
  ADD_APPOINTMENT(state, appointment) {
    state.appointments.push(appointment)
  },
  UPDATE_APPOINTMENT(state, updatedAppointment) {
    const index = state.appointments.findIndex(apt => apt.id === updatedAppointment.id)
    if (index !== -1) {
      state.appointments.splice(index, 1, updatedAppointment)
    }
  },
  REMOVE_APPOINTMENT(state, appointmentId) {
    state.appointments = state.appointments.filter(apt => apt.id !== appointmentId)
  },
  SET_CURRENT_APPOINTMENT(state, appointment) {
    state.currentAppointment = appointment
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
      status: '',
      roomId: '',
      dateRange: null,
      userId: ''
    }
  }
}

const actions = {
  async fetchAppointments({ commit }, params = {}) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // Mock appointments data
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const formatDate = (date) => date.toISOString().split('T')[0]
      
      const mockAppointments = [
        {
          id: 1,
          title: 'Haftalık Toplantı',
          description: 'Haftalık rutin toplantımız',
          date: formatDate(today),
          startTime: '09:00',
          endTime: '10:00',
          roomId: 1,
          roomName: 'Konferans Salonu A',
          userId: 2,
          organizerName: 'Test Kullanıcı',
          status: APPOINTMENT_STATUS.APPROVED,
          attendees: ['test@subu.edu.tr', 'admin@subu.edu.tr'],
          agenda: 'Proje durumu değerlendirmesi',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Proje Sunumu',
          description: 'Yıl sonu proje sunumu',
          date: formatDate(tomorrow),
          startTime: '14:00',
          endTime: '16:00',
          roomId: 2,
          roomName: 'Toplantı Salonu B',
          userId: 2,
          organizerName: 'Test Kullanıcı',
          status: APPOINTMENT_STATUS.PENDING,
          attendees: ['test@subu.edu.tr', 'ustmakam@subu.edu.tr'],
          agenda: 'Proje sonuçlarının sunumu',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Senato Toplantısı',
          description: 'Aylık senato toplantısı',
          date: formatDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)), // Next week
          startTime: '10:00',
          endTime: '12:00',
          roomId: 3,
          roomName: 'Senato Salonu',
          userId: 3,
          organizerName: 'Üst Makam',
          status: APPOINTMENT_STATUS.APPROVED,
          attendees: ['ustmakam@subu.edu.tr', 'admin@subu.edu.tr'],
          agenda: 'Üniversite politikaları',
          createdAt: new Date().toISOString()
        }
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      commit('SET_APPOINTMENTS', mockAppointments)
      
      return { success: true }
    } catch (error) {
      const errorMessage = 'Randevular yüklenirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchAppointment({ commit }, appointmentId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.get(`/appointments/${appointmentId}`)
      commit('SET_CURRENT_APPOINTMENT', response.data.appointment)
      
      return { success: true, appointment: response.data.appointment }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Randevu yüklenirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createAppointment({ commit }, appointmentData) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.post('/appointments', appointmentData)
      commit('ADD_APPOINTMENT', response.data.appointment)
      
      return { success: true, appointment: response.data.appointment }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Randevu oluşturulurken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateAppointment({ commit }, { appointmentId, data }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.put(`/appointments/${appointmentId}`, data)
      commit('UPDATE_APPOINTMENT', response.data.appointment)
      
      return { success: true, appointment: response.data.appointment }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Randevu güncellenirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async approveAppointment({ commit }, appointmentId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.patch(`/appointments/${appointmentId}/approve`)
      commit('UPDATE_APPOINTMENT', response.data.appointment)
      
      return { success: true, appointment: response.data.appointment }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Randevu onaylanırken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async rejectAppointment({ commit }, { appointmentId, reason }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.patch(`/appointments/${appointmentId}/reject`, { reason })
      commit('UPDATE_APPOINTMENT', response.data.appointment)
      
      return { success: true, appointment: response.data.appointment }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Randevu reddedilirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async cancelAppointment({ commit }, appointmentId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      const response = await axios.patch(`/appointments/${appointmentId}/cancel`)
      commit('UPDATE_APPOINTMENT', response.data.appointment)
      
      return { success: true, appointment: response.data.appointment }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Randevu iptal edilirken hata oluştu'
      commit('SET_ERROR', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteAppointment({ commit }, appointmentId) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      await axios.delete(`/appointments/${appointmentId}`)
      commit('REMOVE_APPOINTMENT', appointmentId)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Randevu silinirken hata oluştu'
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