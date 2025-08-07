export default {
  namespaced: true,
  state: {
    meetings: [],
    currentMeeting: null,
    loading: false,
    error: null
  },
  getters: {
    allMeetings: state => state.meetings,
    meetingsByStatus: state => status => state.meetings.filter(m => m.status === status),
    meetingsByDate: state => date => state.meetings.filter(m => m.date === date),
    meetingsByRoom: state => roomId => state.meetings.filter(m => m.roomId === roomId),
    pendingMeetings: state => state.meetings.filter(m => m.status === 'Beklemede'),
    approvedMeetings: state => state.meetings.filter(m => m.status === 'Onaylandi'),
    userMeetings: (state, getters, rootState) => {
      const userId = rootState.auth.user?.id
      return userId ? state.meetings.filter(m => m.ownerId === userId) : []
    },
    currentMeeting: state => state.currentMeeting,
    isLoading: state => state.loading
  },
  mutations: {
    SET_MEETINGS(state, meetings) {
      state.meetings = meetings
    },
    ADD_MEETING(state, meeting) {
      state.meetings.push(meeting)
    },
    UPDATE_MEETING(state, updatedMeeting) {
      const index = state.meetings.findIndex(m => m.id === updatedMeeting.id)
      if (index !== -1) {
        state.meetings.splice(index, 1, updatedMeeting)
      }
    },
    DELETE_MEETING(state, meetingId) {
      state.meetings = state.meetings.filter(m => m.id !== meetingId)
    },
    SET_CURRENT_MEETING(state, meeting) {
      state.currentMeeting = meeting
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  actions: {
    async fetchMeetings({ commit }) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.get('/meetings')
        
        // Mock data for now
        const mockMeetings = [
          {
            id: 1,
            title: 'Proje Toplantısı',
            agenda: 'Proje ilerlemesi ve planlama',
            ownerId: 1,
            roomId: 1,
            date: '2024-01-15',
            startTime: '09:00',
            endTime: '10:00',
            status: 'Onaylandi',
            priorityLevel: 'Normal',
            participants: ['user1@subu.edu.tr', 'user2@subu.edu.tr']
          }
        ]
        
        commit('SET_MEETINGS', mockMeetings)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createMeeting({ commit }, meetingData) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.post('/meetings', meetingData)
        
        // Mock response
        const newMeeting = {
          ...meetingData,
          id: Date.now(),
          status: 'Beklemede',
          createdAt: new Date().toISOString()
        }
        
        commit('ADD_MEETING', newMeeting)
        return newMeeting
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateMeeting({ commit }, { id, updates }) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // const response = await api.put(`/meetings/${id}`, updates)
        
        const updatedMeeting = { id, ...updates }
        commit('UPDATE_MEETING', updatedMeeting)
        return updatedMeeting
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteMeeting({ commit }, meetingId) {
      commit('SET_LOADING', true)
      try {
        // API call would go here
        // await api.delete(`/meetings/${meetingId}`)
        
        commit('DELETE_MEETING', meetingId)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async approveMeeting({ commit }, meetingId) {
      return await commit('UPDATE_MEETING', { id: meetingId, status: 'Onaylandi' })
    },
    
    async rejectMeeting({ commit }, meetingId) {
      return await commit('UPDATE_MEETING', { id: meetingId, status: 'Reddedildi' })
    }
  }
}