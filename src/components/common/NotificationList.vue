<template>
  <div class="notification-container">
    <transition-group name="notification" tag="div" class="notification-list">
      <div
        v-for="notification in visibleNotifications"
        :key="notification.id"
        class="notification-item"
        :class="[`notification-${notification.type}`]"
      >
        <div class="notification-content">
          <div class="notification-header">
            <h6 class="notification-title">{{ notification.title }}</h6>
            <button 
              @click="removeNotification(notification.id)"
              class="btn-close"
              aria-label="Kapat"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <div v-if="notification.appointmentId" class="notification-actions">
            <router-link 
              :to="`/appointments/${notification.appointmentId}`"
              class="btn btn-sm btn-outline-primary"
              @click="markAsRead(notification.id)"
            >
              Detayları Görüntüle
            </router-link>
          </div>
        </div>
        
        <!-- Auto-hide progress bar -->
        <div 
          v-if="notification.autoHide"
          class="notification-progress"
          :style="{ animationDuration: `${notification.hideDelay}ms` }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'NotificationList',
  computed: {
    ...mapGetters({
      allNotifications: 'notifications/allNotifications'
    }),
    visibleNotifications() {
      // Show only recent notifications that should be displayed as toasts
      return this.allNotifications
        .filter(n => n.autoHide !== false || !n.isRead)
        .slice(0, 5)
    }
  },
  methods: {
    ...mapActions({
      removeNotification: 'notifications/removeNotification',
      markAsRead: 'notifications/markAsRead'
    })
  },
  watch: {
    allNotifications: {
      handler(newNotifications) {
        // Auto-hide notifications
        newNotifications.forEach(notification => {
          if (notification.autoHide && notification.hideDelay) {
            setTimeout(() => {
              this.removeNotification(notification.id)
            }, notification.hideDelay)
          }
        })
      },
      deep: true
    }
  }
}
</script>

<style scoped lang="scss">
.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1050;
  max-width: 400px;
  
  @media (max-width: 576px) {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border-left: 4px solid;
  min-width: 300px;
  
  @media (max-width: 576px) {
    min-width: auto;
  }
  
  &.notification-success {
    border-left-color: #28a745;
  }
  
  &.notification-error {
    border-left-color: #dc3545;
  }
  
  &.notification-warning {
    border-left-color: #ffc107;
  }
  
  &.notification-info {
    border-left-color: #17a2b8;
  }
}

.notification-content {
  padding: 15px 20px;
}

.notification-header {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
  flex-grow: 1;
}

.btn-close {
  background: none;
  border: none;
  color: #6c757d;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    color: #495057;
  }
}

.notification-message {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.notification-actions {
  margin-top: 10px;
  
  .btn {
    font-size: 0.8rem;
  }
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(to right, #007bff, #0056b3);
  animation: notification-countdown linear forwards;
}

@keyframes notification-countdown {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

// Transition animations
.notification-enter-active {
  transition: all 0.4s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>