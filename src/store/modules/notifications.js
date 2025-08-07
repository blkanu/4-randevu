const state = {
  notifications: [],
  unreadCount: 0
}

const getters = {
  allNotifications: state => state.notifications,
  unreadNotifications: state => state.notifications.filter(n => !n.isRead),
  readNotifications: state => state.notifications.filter(n => n.isRead),
  unreadCount: state => state.unreadCount,
  hasUnreadNotifications: state => state.unreadCount > 0
}

const mutations = {
  ADD_NOTIFICATION(state, notification) {
    state.notifications.unshift({
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      isRead: false,
      ...notification
    })
    state.unreadCount++
  },
  MARK_AS_READ(state, notificationId) {
    const notification = state.notifications.find(n => n.id === notificationId)
    if (notification && !notification.isRead) {
      notification.isRead = true
      state.unreadCount = Math.max(0, state.unreadCount - 1)
    }
  },
  MARK_ALL_AS_READ(state) {
    state.notifications.forEach(n => {
      n.isRead = true
    })
    state.unreadCount = 0
  },
  REMOVE_NOTIFICATION(state, notificationId) {
    const index = state.notifications.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      const notification = state.notifications[index]
      if (!notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.notifications.splice(index, 1)
    }
  },
  CLEAR_ALL_NOTIFICATIONS(state) {
    state.notifications = []
    state.unreadCount = 0
  },
  SET_NOTIFICATIONS(state, notifications) {
    state.notifications = notifications
    state.unreadCount = notifications.filter(n => !n.isRead).length
  }
}

const actions = {
  showSuccess({ commit }, message) {
    commit('ADD_NOTIFICATION', {
      type: 'success',
      title: 'Başarılı',
      message,
      autoHide: true,
      hideDelay: 5000
    })
  },

  showError({ commit }, message) {
    commit('ADD_NOTIFICATION', {
      type: 'error',
      title: 'Hata',
      message,
      autoHide: true,
      hideDelay: 8000
    })
  },

  showWarning({ commit }, message) {
    commit('ADD_NOTIFICATION', {
      type: 'warning',
      title: 'Uyarı',
      message,
      autoHide: true,
      hideDelay: 6000
    })
  },

  showInfo({ commit }, message) {
    commit('ADD_NOTIFICATION', {
      type: 'info',
      title: 'Bilgi',
      message,
      autoHide: true,
      hideDelay: 5000
    })
  },

  showAppointmentNotification({ commit }, { type, appointment, message }) {
    let title = ''
    let notificationType = 'info'
    
    switch (type) {
      case 'approved':
        title = 'Randevu Onaylandı'
        notificationType = 'success'
        break
      case 'rejected':
        title = 'Randevu Reddedildi'
        notificationType = 'error'
        break
      case 'cancelled':
        title = 'Randevu İptal Edildi'
        notificationType = 'warning'
        break
      case 'created':
        title = 'Yeni Randevu'
        notificationType = 'info'
        break
      case 'updated':
        title = 'Randevu Güncellendi'
        notificationType = 'info'
        break
      default:
        title = 'Randevu Bildirimi'
    }

    commit('ADD_NOTIFICATION', {
      type: notificationType,
      title,
      message: message || `${appointment.title} - ${appointment.date} ${appointment.startTime}`,
      autoHide: false,
      appointmentId: appointment.id,
      roomName: appointment.roomName
    })
  },

  markAsRead({ commit }, notificationId) {
    commit('MARK_AS_READ', notificationId)
  },

  markAllAsRead({ commit }) {
    commit('MARK_ALL_AS_READ')
  },

  removeNotification({ commit }, notificationId) {
    commit('REMOVE_NOTIFICATION', notificationId)
  },

  clearAllNotifications({ commit }) {
    commit('CLEAR_ALL_NOTIFICATIONS')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}