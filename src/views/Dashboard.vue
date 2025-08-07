<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>{{ getDashboardTitle }}</h1>
      <p class="welcome-message">Hoş geldiniz, {{ user.name }}</p>
    </div>
    
    <div class="dashboard-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-calendar"></i>
        </div>
        <div class="stat-content">
          <h3>{{ totalMeetings }}</h3>
          <p>Toplam Toplantı</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ pendingMeetings.length }}</h3>
          <p>Bekleyen Onay</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-check"></i>
        </div>
        <div class="stat-content">
          <h3>{{ approvedMeetings.length }}</h3>
          <p>Onaylanan</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <i class="icon-room"></i>
        </div>
        <div class="stat-content">
          <h3>{{ activeRooms.length }}</h3>
          <p>Aktif Salon</p>
        </div>
      </div>
    </div>
    
    <div class="dashboard-grid">
      <!-- Recent Meetings -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Son Toplantılar</h2>
          <router-link to="/meetings" class="btn btn-sm btn-outline">
            Tümünü Gör
          </router-link>
        </div>
        <div class="meeting-list">
          <div
            v-for="meeting in recentMeetings"
            :key="meeting.id"
            class="meeting-item"
            @click="$router.push(`/meetings/${meeting.id}`)"
          >
            <div class="meeting-info">
              <h4>{{ meeting.title }}</h4>
              <p>{{ formatDate(meeting.date) }} - {{ meeting.startTime }}</p>
            </div>
            <div class="meeting-status" :class="getStatusClass(meeting.status)">
              {{ getStatusText(meeting.status) }}
            </div>
          </div>
          <div v-if="recentMeetings.length === 0" class="empty-state">
            Henüz toplantı bulunmuyor
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Hızlı Erişim</h2>
        </div>
        <div class="quick-actions">
          <router-link to="/meetings/new" class="action-card">
            <i class="icon-plus"></i>
            <span>Yeni Toplantı</span>
          </router-link>
          
          <router-link to="/calendar" class="action-card">
            <i class="icon-calendar"></i>
            <span>Takvim</span>
          </router-link>
          
          <router-link v-if="isAdmin" to="/admin" class="action-card">
            <i class="icon-settings"></i>
            <span>Yönetim</span>
          </router-link>
          
          <router-link v-if="isAdmin" to="/rooms" class="action-card">
            <i class="icon-room"></i>
            <span>Salon Yönetimi</span>
          </router-link>
        </div>
      </div>
      
      <!-- Admin Panel (only for admins) -->
      <div v-if="isAdmin" class="dashboard-section">
        <div class="section-header">
          <h2>Onay Bekleyenler</h2>
          <router-link to="/admin" class="btn btn-sm btn-outline">
            Yönetim Paneli
          </router-link>
        </div>
        <div class="approval-list">
          <div
            v-for="meeting in pendingMeetings.slice(0, 5)"
            :key="meeting.id"
            class="approval-item"
          >
            <div class="approval-info">
              <h4>{{ meeting.title }}</h4>
              <p>{{ meeting.ownerName }} - {{ formatDate(meeting.date) }}</p>
            </div>
            <div class="approval-actions">
              <button 
                @click="approveMeeting(meeting.id)" 
                class="btn btn-sm btn-success"
              >
                Onayla
              </button>
              <button 
                @click="rejectMeeting(meeting.id)" 
                class="btn btn-sm btn-danger"
              >
                Reddet
              </button>
            </div>
          </div>
          <div v-if="pendingMeetings.length === 0" class="empty-state">
            Onay bekleyen toplantı bulunmuyor
          </div>
        </div>
      </div>
      
      <!-- Calendar Preview -->
      <div class="dashboard-section">
        <div class="section-header">
          <h2>Bugün</h2>
          <router-link to="/calendar" class="btn btn-sm btn-outline">
            Takvimi Aç
          </router-link>
        </div>
        <div class="today-meetings">
          <div
            v-for="meeting in todayMeetings"
            :key="meeting.id"
            class="today-meeting"
          >
            <div class="time-slot">{{ meeting.startTime }}</div>
            <div class="meeting-details">
              <h4>{{ meeting.title }}</h4>
              <p>Salon {{ meeting.roomId }}</p>
            </div>
          </div>
          <div v-if="todayMeetings.length === 0" class="empty-state">
            Bugün toplantı bulunmuyor
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters('auth', ['user', 'isAdmin', 'isSuperAdmin']),
    ...mapGetters('meetings', ['allMeetings', 'pendingMeetings', 'approvedMeetings']),
    ...mapGetters('rooms', ['activeRooms']),
    
    getDashboardTitle() {
      const role = this.user?.role
      switch (role) {
        case 'SuperAdmin':
          return 'Süper Yönetici Paneli'
        case 'Admin':
          return 'Yönetici Paneli'
        case 'UstMakam':
          return 'Üst Makam Paneli'
        default:
          return 'Dashboard'
      }
    },
    
    totalMeetings() {
      return this.allMeetings.length
    },
    
    recentMeetings() {
      return this.allMeetings
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    },
    
    todayMeetings() {
      const today = new Date().toISOString().split('T')[0]
      return this.allMeetings
        .filter(meeting => meeting.date === today && meeting.status === 'Onaylandi')
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    }
  },
  
  async created() {
    // Load initial data
    await Promise.all([
      this.fetchMeetings(),
      this.fetchRooms()
    ])
  },
  
  methods: {
    ...mapActions('meetings', ['fetchMeetings', 'approveMeeting', 'rejectMeeting']),
    ...mapActions('rooms', ['fetchRooms']),
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },
    
    getStatusText(status) {
      const statusMap = {
        'Beklemede': 'Beklemede',
        'Onaylandi': 'Onaylandı',
        'Reddedildi': 'Reddedildi',
        'Iptal': 'İptal'
      }
      return statusMap[status] || status
    },
    
    getStatusClass(status) {
      return {
        'status-pending': status === 'Beklemede',
        'status-approved': status === 'Onaylandi',
        'status-rejected': status === 'Reddedildi',
        'status-cancelled': status === 'Iptal'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 30px;
  
  h1 {
    color: #333;
    margin-bottom: 5px;
    font-size: 28px;
    font-weight: 700;
  }
  
  .welcome-message {
    color: #666;
    margin: 0;
    font-size: 16px;
  }
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  
  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    
    i {
      font-size: 20px;
      color: white;
    }
  }
  
  .stat-content {
    h3 {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 5px 0;
      color: #333;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
}

.dashboard-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.15s ease-in-out;
  
  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  &.btn-outline {
    background: transparent;
    border: 1px solid #667eea;
    color: #667eea;
    
    &:hover {
      background: #667eea;
      color: white;
    }
  }
  
  &.btn-success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.btn-danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
}

.meeting-list {
  .meeting-item {
    display: flex;
    justify-content: between;
    align-items: center;
    padding: 15px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    
    &:hover {
      border-color: #667eea;
      transform: translateY(-1px);
    }
    
    .meeting-info {
      h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
      
      p {
        margin: 0;
        font-size: 12px;
        color: #666;
      }
    }
    
    .meeting-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      
      &.status-pending {
        background: #fff3cd;
        color: #856404;
      }
      
      &.status-approved {
        background: #d4edda;
        color: #155724;
      }
      
      &.status-rejected {
        background: #f8d7da;
        color: #721c24;
      }
      
      &.status-cancelled {
        background: #e2e3e5;
        color: #6c757d;
      }
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    text-decoration: none;
    color: #667eea;
  }
  
  i {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  span {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }
}

.approval-list {
  .approval-item {
    display: flex;
    justify-content: between;
    align-items: center;
    padding: 15px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 10px;
    
    .approval-info {
      flex: 1;
      
      h4 {
        margin: 0 0 5px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
      
      p {
        margin: 0;
        font-size: 12px;
        color: #666;
      }
    }
    
    .approval-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.today-meetings {
  .today-meeting {
    display: flex;
    align-items: center;
    padding: 12px;
    border-left: 4px solid #667eea;
    margin-bottom: 10px;
    background: #f8f9fa;
    border-radius: 0 8px 8px 0;
    
    .time-slot {
      font-weight: 600;
      color: #667eea;
      min-width: 60px;
      font-size: 14px;
    }
    
    .meeting-details {
      margin-left: 15px;
      
      h4 {
        margin: 0 0 2px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }
      
      p {
        margin: 0;
        font-size: 12px;
        color: #666;
      }
    }
  }
}

.empty-state {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

// Icon placeholders (replace with actual icon font)
.icon-calendar:before { content: "📅"; }
.icon-clock:before { content: "⏰"; }
.icon-check:before { content: "✅"; }
.icon-room:before { content: "🏢"; }
.icon-plus:before { content: "➕"; }
.icon-settings:before { content: "⚙️"; }

@media (max-width: 768px) {
  .dashboard {
    padding: 15px;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
  
  .meeting-item,
  .approval-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>