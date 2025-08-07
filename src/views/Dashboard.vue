<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <div class="row align-items-center">
        <div class="col-md-8">
          <h1 class="mb-2">
            Hoş geldiniz, {{ currentUser.firstName }} {{ currentUser.lastName }}
          </h1>
          <p class="text-muted mb-0">
            <i class="fas fa-user-tag me-2"></i>
            {{ getRoleDisplayName(currentUser.role) }}
          </p>
        </div>
        <div class="col-md-4 text-md-end">
          <div class="current-time">
            <i class="fas fa-clock me-2"></i>
            {{ currentDateTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <i class="fas fa-handshake"></i>
          </div>
          <div class="stat-content">
            <h3>{{ userAppointments.length }}</h3>
            <p>Toplam Randevularım</p>
          </div>
        </div>
      </div>
      
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card stat-success">
          <div class="stat-icon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div class="stat-content">
            <h3>{{ upcomingAppointments.length }}</h3>
            <p>Yaklaşan Randevular</p>
          </div>
        </div>
      </div>
      
      <div class="col-lg-3 col-md-6 mb-3" v-if="canApproveAppointments">
        <div class="stat-card stat-warning">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ pendingAppointments.length }}</h3>
            <p>Bekleyen Onaylar</p>
          </div>
        </div>
      </div>
      
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="stat-card stat-info">
          <div class="stat-icon">
            <i class="fas fa-door-open"></i>
          </div>
          <div class="stat-content">
            <h3>{{ availableRooms.length }}</h3>
            <p>Müsait Salonlar</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Left Column -->
      <div class="col-lg-8 mb-4">
        <!-- Quick Actions -->
        <div class="card mb-4">
          <div class="card-header">
            <h5><i class="fas fa-bolt me-2"></i>Hızlı İşlemler</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <router-link to="/appointments/create" class="quick-action-btn">
                  <i class="fas fa-plus"></i>
                  <span>Yeni Randevu</span>
                </router-link>
              </div>
              <div class="col-md-6 mb-3">
                <router-link to="/calendar" class="quick-action-btn">
                  <i class="fas fa-calendar"></i>
                  <span>Takvimi Görüntüle</span>
                </router-link>
              </div>
              <div class="col-md-6 mb-3" v-if="canManageRooms">
                <router-link to="/rooms/create" class="quick-action-btn">
                  <i class="fas fa-door-closed"></i>
                  <span>Yeni Salon</span>
                </router-link>
              </div>
              <div class="col-md-6 mb-3" v-if="canManageUsers">
                <router-link to="/users" class="quick-action-btn">
                  <i class="fas fa-users"></i>
                  <span>Kullanıcı Yönetimi</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Today's Appointments -->
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5><i class="fas fa-calendar-day me-2"></i>Bugünkü Randevular</h5>
            <router-link to="/appointments" class="btn btn-sm btn-outline-primary">
              Tümünü Görüntüle
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="todayAppointments.length === 0" class="text-center text-muted py-4">
              <i class="fas fa-calendar-times fa-3x mb-3"></i>
              <p>Bugün herhangi bir randevunuz bulunmuyor.</p>
            </div>
            <div v-else class="appointment-list">
              <div 
                v-for="appointment in todayAppointments.slice(0, 5)" 
                :key="appointment.id"
                class="appointment-item"
              >
                <div class="appointment-time">
                  <strong>{{ appointment.startTime }}</strong>
                  <small>{{ appointment.endTime }}</small>
                </div>
                <div class="appointment-details">
                  <h6>{{ appointment.title }}</h6>
                  <p class="text-muted mb-1">
                    <i class="fas fa-door-open me-1"></i>
                    {{ appointment.roomName }}
                  </p>
                  <b-badge :variant="getStatusVariant(appointment.status)">
                    {{ getStatusDisplayName(appointment.status) }}
                  </b-badge>
                </div>
                <div class="appointment-actions">
                  <router-link 
                    :to="`/appointments/${appointment.id}`" 
                    class="btn btn-sm btn-outline-primary"
                  >
                    Detay
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-lg-4">
        <!-- Pending Approvals (for Admins) -->
        <div v-if="canApproveAppointments && pendingAppointments.length > 0" class="card mb-4">
          <div class="card-header">
            <h5><i class="fas fa-tasks me-2"></i>Bekleyen Onaylar</h5>
          </div>
          <div class="card-body">
            <div class="pending-list">
              <div 
                v-for="appointment in pendingAppointments.slice(0, 3)" 
                :key="appointment.id"
                class="pending-item"
              >
                <div class="pending-details">
                  <h6>{{ appointment.title }}</h6>
                  <p class="text-muted mb-1">
                    <i class="fas fa-user me-1"></i>
                    {{ appointment.organizerName }}
                  </p>
                  <p class="text-muted mb-1">
                    <i class="fas fa-calendar me-1"></i>
                    {{ formatDate(appointment.date) }}
                  </p>
                </div>
                <div class="pending-actions">
                  <router-link 
                    :to="`/appointments/${appointment.id}`" 
                    class="btn btn-sm btn-primary"
                  >
                    İncele
                  </router-link>
                </div>
              </div>
            </div>
            <router-link 
              to="/appointments?status=pending" 
              class="btn btn-outline-primary btn-sm w-100 mt-2"
            >
              Tüm Bekleyen Randevular
            </router-link>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="card-header">
            <h5><i class="fas fa-history me-2"></i>Son Aktiviteler</h5>
          </div>
          <div class="card-body">
            <div v-if="recentNotifications.length === 0" class="text-center text-muted">
              <i class="fas fa-inbox fa-2x mb-2"></i>
              <p>Henüz aktivite yok.</p>
            </div>
            <div v-else class="activity-list">
              <div 
                v-for="notification in recentNotifications.slice(0, 5)" 
                :key="notification.id"
                class="activity-item"
              >
                <div class="activity-icon" :class="`activity-${notification.type}`">
                  <i :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="activity-content">
                  <p class="mb-1">{{ notification.message }}</p>
                  <small class="text-muted">{{ formatDate(notification.timestamp) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'

export default {
  name: 'Dashboard',
  data() {
    return {
      currentDateTime: ''
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/currentUser',
      canApproveAppointments: 'auth/canApproveAppointments',
      canManageRooms: 'auth/canManageRooms',
      canManageUsers: 'auth/canManageUsers',
      userAppointments: 'appointments/userAppointments',
      pendingAppointments: 'appointments/pendingAppointments',
      upcomingAppointments: 'appointments/upcomingAppointments',
      todayAppointments: 'appointments/todayAppointments',
      availableRooms: 'rooms/activeRooms',
      recentNotifications: 'notifications/allNotifications'
    })
  },
  mounted() {
    this.updateDateTime()
    this.timeInterval = setInterval(this.updateDateTime, 1000)
    
    // Load initial data
    this.loadDashboardData()
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  },
  methods: {
    updateDateTime() {
      this.currentDateTime = moment().format('DD MMMM YYYY, HH:mm:ss')
    },
    async loadDashboardData() {
      try {
        await Promise.all([
          this.$store.dispatch('appointments/fetchAppointments'),
          this.$store.dispatch('rooms/fetchRooms')
        ])
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    },
    getRoleDisplayName(role) {
      const roles = {
        'SuperAdmin': 'Süper Yönetici',
        'Admin': 'Yönetici',
        'User': 'Kullanıcı',
        'UstMakam': 'Üst Makam'
      }
      return roles[role] || role
    },
    getStatusDisplayName(status) {
      const statuses = {
        'pending': 'Bekliyor',
        'approved': 'Onaylandı',
        'rejected': 'Reddedildi',
        'cancelled': 'İptal Edildi'
      }
      return statuses[status] || status
    },
    getStatusVariant(status) {
      const variants = {
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'cancelled': 'secondary'
      }
      return variants[status] || 'secondary'
    },
    getNotificationIcon(type) {
      const icons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
      }
      return icons[type] || 'fas fa-bell'
    },
    formatDate(date) {
      return moment(date).format('DD.MM.YYYY HH:mm')
    }
  }
}
</script>

<style scoped lang="scss">
.dashboard {
  .welcome-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 30px;
    
    h1 {
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .current-time {
      font-size: 1.1rem;
      font-weight: 500;
      
      @media (max-width: 768px) {
        margin-top: 15px;
      }
    }
  }
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    
    i {
      font-size: 24px;
      color: white;
    }
  }
  
  .stat-content {
    h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: #2c3e50;
    }
    
    p {
      margin: 0;
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: 500;
    }
  }
  
  &.stat-primary .stat-icon {
    background: linear-gradient(45deg, #007bff, #0056b3);
  }
  
  &.stat-success .stat-icon {
    background: linear-gradient(45deg, #28a745, #1e7e34);
  }
  
  &.stat-warning .stat-icon {
    background: linear-gradient(45deg, #ffc107, #e0a800);
  }
  
  &.stat-info .stat-icon {
    background: linear-gradient(45deg, #17a2b8, #138496);
  }
}

.quick-action-btn {
  display: block;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  text-decoration: none;
  color: #495057;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    border-color: #007bff;
    color: #007bff;
    text-decoration: none;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
  }
  
  i {
    display: block;
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  span {
    font-weight: 600;
  }
}

.appointment-list {
  .appointment-item {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #f1f3f4;
    
    &:last-child {
      border-bottom: none;
    }
    
    .appointment-time {
      min-width: 80px;
      text-align: center;
      
      strong {
        display: block;
        font-size: 1.1rem;
        color: #007bff;
      }
      
      small {
        color: #6c757d;
      }
    }
    
    .appointment-details {
      flex-grow: 1;
      margin-left: 15px;
      
      h6 {
        margin: 0 0 5px 0;
        font-weight: 600;
      }
      
      p {
        margin: 0 0 5px 0;
        font-size: 0.9rem;
      }
    }
    
    .appointment-actions {
      margin-left: 15px;
    }
  }
}

.pending-list {
  .pending-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #f1f3f4;
    
    &:last-child {
      border-bottom: none;
    }
    
    .pending-details {
      flex-grow: 1;
      
      h6 {
        margin: 0 0 5px 0;
        font-weight: 600;
        font-size: 0.9rem;
      }
      
      p {
        margin: 0;
        font-size: 0.8rem;
      }
    }
  }
}

.activity-list {
  .activity-item {
    display: flex;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid #f1f3f4;
    
    &:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
      
      i {
        font-size: 14px;
        color: white;
      }
      
      &.activity-success {
        background: #28a745;
      }
      
      &.activity-error {
        background: #dc3545;
      }
      
      &.activity-warning {
        background: #ffc107;
      }
      
      &.activity-info {
        background: #17a2b8;
      }
    }
    
    .activity-content {
      flex-grow: 1;
      
      p {
        margin: 0 0 3px 0;
        font-size: 0.85rem;
        line-height: 1.4;
      }
      
      small {
        font-size: 0.75rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    .welcome-header {
      padding: 20px;
      margin-bottom: 20px;
      
      h1 {
        font-size: 1.5rem;
      }
    }
  }
  
  .stat-card {
    padding: 20px;
    margin-bottom: 15px;
    
    .stat-icon {
      width: 50px;
      height: 50px;
      
      i {
        font-size: 20px;
      }
    }
    
    .stat-content h3 {
      font-size: 1.5rem;
    }
  }
  
  .quick-action-btn {
    padding: 15px;
    
    i {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }
  }
  
  .appointment-item {
    flex-direction: column;
    align-items: flex-start;
    
    .appointment-time {
      margin-bottom: 10px;
    }
    
    .appointment-details {
      margin-left: 0;
      margin-bottom: 10px;
    }
    
    .appointment-actions {
      margin-left: 0;
    }
  }
}
</style>