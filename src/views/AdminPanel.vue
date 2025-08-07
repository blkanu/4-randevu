<template>
  <div class="admin-panel">
    <div class="page-header">
      <h1>Yönetici Paneli</h1>
    </div>
    
    <div class="dashboard-grid">
      <!-- Pending Approvals -->
      <div class="panel-section">
        <div class="section-header">
          <h2>Onay Bekleyen Toplantılar</h2>
          <span class="count-badge">{{ pendingMeetings.length }}</span>
        </div>
        
        <div class="pending-list">
          <div
            v-for="meeting in pendingMeetings"
            :key="meeting.id"
            class="pending-item"
          >
            <div class="meeting-info">
              <h4>{{ meeting.title }}</h4>
              <p>{{ meeting.ownerName }} - {{ formatDate(meeting.date) }}</p>
              <p>{{ meeting.startTime }} - {{ meeting.endTime }} | {{ getRoomName(meeting.roomId) }}</p>
            </div>
            
            <div class="meeting-actions">
              <button
                @click="viewMeetingDetails(meeting.id)"
                class="btn btn-sm btn-outline"
              >
                Detay
              </button>
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
      
      <!-- Quick Stats -->
      <div class="panel-section">
        <div class="section-header">
          <h2>İstatistikler</h2>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ totalMeetings }}</div>
            <div class="stat-label">Toplam Toplantı</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ pendingMeetings.length }}</div>
            <div class="stat-label">Bekleyen Onay</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ approvedMeetings.length }}</div>
            <div class="stat-label">Onaylanan</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-value">{{ activeRooms.length }}</div>
            <div class="stat-label">Aktif Salon</div>
          </div>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="panel-section">
        <div class="section-header">
          <h2>Son Aktiviteler</h2>
        </div>
        
        <div class="activity-list">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="activity-item"
          >
            <div class="activity-icon" :class="getActivityIconClass(activity.type)">
              {{ getActivityIcon(activity.type) }}
            </div>
            <div class="activity-content">
              <p>{{ activity.description }}</p>
              <small>{{ formatDateTime(activity.timestamp) }}</small>
            </div>
          </div>
          
          <div v-if="recentActivities.length === 0" class="empty-state">
            Henüz aktivite bulunmuyor
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="panel-section">
        <div class="section-header">
          <h2>Hızlı İşlemler</h2>
        </div>
        
        <div class="quick-actions">
          <router-link to="/rooms" class="action-card">
            <div class="action-icon">🏢</div>
            <div class="action-content">
              <h4>Salon Yönetimi</h4>
              <p>Toplantı salonlarını yönet</p>
            </div>
          </router-link>
          
          <router-link to="/special-days" class="action-card">
            <div class="action-icon">📅</div>
            <div class="action-content">
              <h4>Özel Günler</h4>
              <p>Tatil günlerini belirle</p>
            </div>
          </router-link>
          
          <router-link v-if="isSuperAdmin" to="/users" class="action-card">
            <div class="action-icon">👥</div>
            <div class="action-content">
              <h4>Kullanıcı Yönetimi</h4>
              <p>Kullanıcıları düzenle</p>
            </div>
          </router-link>
          
          <router-link to="/meetings" class="action-card">
            <div class="action-icon">📋</div>
            <div class="action-content">
              <h4>Tüm Toplantılar</h4>
              <p>Toplantı listesini görüntüle</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AdminPanel',
  data() {
    return {
      recentActivities: [
        {
          id: 1,
          type: 'meeting_created',
          description: 'Yeni toplantı oluşturuldu: "Proje Toplantısı"',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'meeting_approved',
          description: 'Toplantı onaylandı: "Bütçe Görüşmesi"',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          type: 'room_updated',
          description: 'Salon güncellendi: "Toplantı Salonu 1"',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    }
  },
  
  computed: {
    ...mapGetters('auth', ['isSuperAdmin']),
    ...mapGetters('meetings', ['allMeetings', 'pendingMeetings', 'approvedMeetings']),
    ...mapGetters('rooms', ['activeRooms']),
    
    totalMeetings() {
      return this.allMeetings.length
    }
  },
  
  async created() {
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
    
    formatDateTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleString('tr-TR')
    },
    
    getRoomName(roomId) {
      const room = this.activeRooms.find(r => r.id === roomId)
      return room ? room.name : `Salon ${roomId}`
    },
    
    getActivityIcon(type) {
      const icons = {
        'meeting_created': '➕',
        'meeting_approved': '✅',
        'meeting_rejected': '❌',
        'room_updated': '🏢',
        'user_created': '👤'
      }
      return icons[type] || '📋'
    },
    
    getActivityIconClass(type) {
      return {
        'icon-success': type === 'meeting_approved',
        'icon-danger': type === 'meeting_rejected',
        'icon-info': type === 'meeting_created' || type === 'room_updated',
        'icon-primary': type === 'user_created'
      }
    },
    
    viewMeetingDetails(id) {
      this.$router.push(`/meetings/${id}`)
    },
    
    async approveMeeting(id) {
      if (confirm('Bu toplantıyı onaylamak istediğinize emin misiniz?')) {
        try {
          await this.approveMeeting(id)
          this.addActivity('meeting_approved', `Toplantı onaylandı`)
        } catch (error) {
          alert('Toplantı onaylanırken hata oluştu')
        }
      }
    },
    
    async rejectMeeting(id) {
      if (confirm('Bu toplantıyı reddetmek istediğinize emin misiniz?')) {
        try {
          await this.rejectMeeting(id)
          this.addActivity('meeting_rejected', `Toplantı reddedildi`)
        } catch (error) {
          alert('Toplantı reddedilirken hata oluştu')
        }
      }
    },
    
    addActivity(type, description) {
      this.recentActivities.unshift({
        id: Date.now(),
        type,
        description,
        timestamp: new Date().toISOString()
      })
      
      // Keep only last 10 activities
      if (this.recentActivities.length > 10) {
        this.recentActivities = this.recentActivities.slice(0, 10)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-panel {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
  
  h1 {
    margin: 0;
    color: #333;
    font-size: 28px;
    font-weight: 700;
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
}

.panel-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.count-badge {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pending-list {
  .pending-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 12px;
    
    .meeting-info {
      flex: 1;
      
      h4 {
        margin: 0 0 5px 0;
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }
      
      p {
        margin: 0 0 3px 0;
        font-size: 13px;
        color: #666;
      }
    }
    
    .meeting-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }
}

.activity-list {
  .activity-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
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
      font-size: 14px;
      
      &.icon-success {
        background: #d4edda;
        color: #155724;
      }
      
      &.icon-danger {
        background: #f8d7da;
        color: #721c24;
      }
      
      &.icon-info {
        background: #d1ecf1;
        color: #0c5460;
      }
      
      &.icon-primary {
        background: #cce7ff;
        color: #004085;
      }
    }
    
    .activity-content {
      flex: 1;
      
      p {
        margin: 0 0 2px 0;
        font-size: 14px;
        color: #333;
        line-height: 1.4;
      }
      
      small {
        color: #6c757d;
        font-size: 12px;
      }
    }
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-1px);
    text-decoration: none;
    color: inherit;
  }
  
  .action-icon {
    font-size: 24px;
    flex-shrink: 0;
  }
  
  .action-content {
    h4 {
      margin: 0 0 4px 0;
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

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  
  &.btn-sm {
    padding: 4px 8px;
    font-size: 11px;
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

.empty-state {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .pending-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .meeting-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>