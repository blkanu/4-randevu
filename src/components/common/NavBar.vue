<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <!-- Brand -->
      <router-link to="/" class="navbar-brand">
        <i class="fas fa-calendar-alt me-2"></i>
        Randevu Sistemi
      </router-link>

      <!-- Mobile menu toggle -->
      <button 
        class="navbar-toggler" 
        type="button"
        @click="showMobileMenu = !showMobileMenu"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navigation Menu -->
      <div class="navbar-collapse" :class="{ 'show': showMobileMenu }">
        <ul class="navbar-nav me-auto">
          <!-- Dashboard -->
          <li class="nav-item">
            <router-link to="/" class="nav-link" @click="showMobileMenu = false">
              <i class="fas fa-home me-1"></i>
              Ana Sayfa
            </router-link>
          </li>

          <!-- Calendar -->
          <li class="nav-item">
            <router-link to="/calendar" class="nav-link" @click="showMobileMenu = false">
              <i class="fas fa-calendar me-1"></i>
              Takvim
            </router-link>
          </li>

          <!-- Appointments -->
          <li class="nav-item dropdown" @mouseover="showAppointmentsDropdown = true" @mouseleave="showAppointmentsDropdown = false">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              @click.prevent="showAppointmentsDropdown = !showAppointmentsDropdown"
            >
              <i class="fas fa-handshake me-1"></i>
              Randevular
            </a>
            <ul class="dropdown-menu" :class="{ show: showAppointmentsDropdown }">
              <li>
                <router-link to="/appointments" class="dropdown-item" @click="closeMobileMenu">
                  <i class="fas fa-list me-2"></i>
                  Tüm Randevular
                </router-link>
              </li>
              <li>
                <router-link to="/appointments/create" class="dropdown-item" @click="closeMobileMenu">
                  <i class="fas fa-plus me-2"></i>
                  Yeni Randevu
                </router-link>
              </li>
              <li v-if="canApproveAppointments"><hr class="dropdown-divider"></li>
              <li v-if="canApproveAppointments">
                <router-link to="/appointments?status=pending" class="dropdown-item" @click="closeMobileMenu">
                  <i class="fas fa-clock me-2"></i>
                  Bekleyen Randevular
                  <b-badge v-if="pendingCount > 0" variant="warning" class="ms-1">{{ pendingCount }}</b-badge>
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Rooms -->
          <li class="nav-item dropdown" @mouseover="showRoomsDropdown = true" @mouseleave="showRoomsDropdown = false">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              @click.prevent="showRoomsDropdown = !showRoomsDropdown"
            >
              <i class="fas fa-door-open me-1"></i>
              Salonlar
            </a>
            <ul class="dropdown-menu" :class="{ show: showRoomsDropdown }">
              <li>
                <router-link to="/rooms" class="dropdown-item" @click="closeMobileMenu">
                  <i class="fas fa-list me-2"></i>
                  Tüm Salonlar
                </router-link>
              </li>
              <li v-if="canManageRooms">
                <router-link to="/rooms/create" class="dropdown-item" @click="closeMobileMenu">
                  <i class="fas fa-plus me-2"></i>
                  Yeni Salon
                </router-link>
              </li>
            </ul>
          </li>

          <!-- User Management -->
          <li v-if="canManageUsers" class="nav-item dropdown" @mouseover="showUsersDropdown = true" @mouseleave="showUsersDropdown = false">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              @click.prevent="showUsersDropdown = !showUsersDropdown"
            >
              <i class="fas fa-users me-1"></i>
              Kullanıcılar
            </a>
            <ul class="dropdown-menu" :class="{ show: showUsersDropdown }">
              <li>
                <router-link to="/users" class="dropdown-item" @click="closeMobileMenu">
                  <i class="fas fa-list me-2"></i>
                  Tüm Kullanıcılar
                </router-link>
              </li>
              <li>
                <router-link to="/users/create" class="dropdown-item" @click="closeMobileMenu">
                  <i class="fas fa-user-plus me-2"></i>
                  Yeni Kullanıcı
                </router-link>
              </li>
            </ul>
          </li>
        </ul>

        <!-- User Menu -->
        <ul class="navbar-nav">
          <!-- Notifications -->
          <li class="nav-item dropdown" @mouseover="showNotificationsDropdown = true" @mouseleave="showNotificationsDropdown = false">
            <a 
              class="nav-link position-relative" 
              href="#" 
              @click.prevent="showNotificationsDropdown = !showNotificationsDropdown"
            >
              <i class="fas fa-bell"></i>
              <b-badge 
                v-if="unreadCount > 0" 
                variant="danger" 
                pill 
                class="position-absolute top-0 start-100 translate-middle"
              >
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </b-badge>
            </a>
            <ul class="dropdown-menu dropdown-menu-end notification-dropdown" :class="{ show: showNotificationsDropdown }">
              <li class="dropdown-header d-flex justify-content-between align-items-center">
                <span>Bildirimler</span>
                <button 
                  v-if="unreadCount > 0"
                  @click="markAllAsRead" 
                  class="btn btn-sm btn-link p-0 text-muted"
                >
                  Tümünü okundu işaretle
                </button>
              </li>
              <li><hr class="dropdown-divider"></li>
              <div class="notification-list">
                <li v-if="recentNotifications.length === 0" class="dropdown-item-text text-muted text-center">
                  Bildirim yok
                </li>
                <li v-for="notification in recentNotifications" :key="notification.id" class="notification-item">
                  <div class="dropdown-item" :class="{ 'unread': !notification.isRead }">
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="flex-grow-1">
                        <h6 class="mb-1">{{ notification.title }}</h6>
                        <p class="mb-1 text-muted small">{{ notification.message }}</p>
                        <small class="text-muted">{{ formatDate(notification.timestamp) }}</small>
                      </div>
                      <button @click="removeNotification(notification.id)" class="btn btn-sm btn-link p-0 text-muted">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </li>
              </div>
            </ul>
          </li>

          <!-- User Profile -->
          <li class="nav-item dropdown" @mouseover="showUserDropdown = true" @mouseleave="showUserDropdown = false">
            <a 
              class="nav-link dropdown-toggle" 
              href="#" 
              @click.prevent="showUserDropdown = !showUserDropdown"
            >
              <i class="fas fa-user-circle me-1"></i>
              {{ currentUser.firstName }} {{ currentUser.lastName }}
              <small class="text-muted ms-1">({{ currentUser.role }})</small>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showUserDropdown }">
              <li>
                <router-link to="/profile" class="dropdown-item" @click="closeMobileMenu">
                  <i class="fas fa-user me-2"></i>
                  Profil
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a href="#" class="dropdown-item" @click.prevent="logout">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  Çıkış Yap
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

export default {
  name: 'NavBar',
  data() {
    return {
      showMobileMenu: false,
      showAppointmentsDropdown: false,
      showRoomsDropdown: false,
      showUsersDropdown: false,
      showUserDropdown: false,
      showNotificationsDropdown: false
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/currentUser',
      canManageRooms: 'auth/canManageRooms',
      canManageUsers: 'auth/canManageUsers',
      canApproveAppointments: 'auth/canApproveAppointments',
      pendingAppointments: 'appointments/pendingAppointments',
      allNotifications: 'notifications/allNotifications',
      unreadCount: 'notifications/unreadCount'
    }),
    pendingCount() {
      return this.pendingAppointments.length
    },
    recentNotifications() {
      return this.allNotifications.slice(0, 5)
    }
  },
  methods: {
    ...mapActions({
      logoutUser: 'auth/logout',
      markAllAsRead: 'notifications/markAllAsRead',
      removeNotification: 'notifications/removeNotification'
    }),
    async logout() {
      try {
        await this.logoutUser()
        this.$router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    },
    closeMobileMenu() {
      this.showMobileMenu = false
      this.showAppointmentsDropdown = false
      this.showRoomsDropdown = false
      this.showUsersDropdown = false
      this.showUserDropdown = false
      this.showNotificationsDropdown = false
    },
    formatDate(date) {
      return moment(date).fromNow()
    }
  },
  mounted() {
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.closeMobileMenu()
      }
    })
  }
}
</script>

<style scoped lang="scss">
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1030;
}

.navbar-brand {
  font-weight: 600;
  font-size: 1.25rem;
}

.nav-link {
  font-weight: 500;
  padding: 0.5rem 1rem !important;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &.router-link-active {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
}

.dropdown {
  position: relative;
  
  .dropdown-menu {
    margin-top: 0;
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    
    .dropdown-item {
      padding: 0.5rem 1rem;
      
      &:hover {
        background-color: #f8f9fa;
      }
      
      &.router-link-active {
        background-color: #007bff;
        color: white;
      }
    }
  }
}

.notification-dropdown {
  width: 320px;
  max-height: 400px;
  
  .notification-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .notification-item {
    .dropdown-item {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f8f9fa;
      
      &.unread {
        background-color: #f8f9fa;
        border-left: 3px solid #007bff;
      }
      
      h6 {
        font-size: 0.875rem;
        font-weight: 600;
      }
      
      p {
        font-size: 0.8rem;
        line-height: 1.4;
      }
    }
  }
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.top-0 {
  top: 0;
}

.start-100 {
  left: 100%;
}

.translate-middle {
  transform: translate(-50%, -50%);
}

@media (max-width: 991px) {
  .navbar-collapse {
    margin-top: 1rem;
    
    .dropdown-menu {
      position: static !important;
      transform: none !important;
      box-shadow: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background-color: rgba(255, 255, 255, 0.05);
      
      .dropdown-item {
        color: rgba(255, 255, 255, 0.8);
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
        }
      }
    }
  }
}
</style>