<template>
  <div class="meeting-details">
    <div class="page-header">
      <h1>Toplantı Detayları</h1>
      <div class="header-actions">
        <router-link to="/meetings" class="btn btn-outline">
          <i class="icon-back"></i>
          Geri Dön
        </router-link>
        <button
          v-if="canEdit"
          @click="editMeeting"
          class="btn btn-primary"
        >
          Düzenle
        </button>
      </div>
    </div>
    
    <div v-if="meeting" class="meeting-content">
      <div class="meeting-info-card">
        <div class="card-header">
          <h2>{{ meeting.title }}</h2>
          <span class="status-badge" :class="getStatusClass(meeting.status)">
            {{ getStatusText(meeting.status) }}
          </span>
        </div>
        
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <label>Gündem:</label>
              <p>{{ meeting.agenda }}</p>
            </div>
            
            <div class="info-item">
              <label>Tarih ve Saat:</label>
              <p>{{ formatDate(meeting.date) }} - {{ meeting.startTime }} / {{ meeting.endTime }}</p>
            </div>
            
            <div class="info-item">
              <label>Salon:</label>
              <p>{{ getRoomName(meeting.roomId) }}</p>
            </div>
            
            <div class="info-item">
              <label>Toplantı Sahibi:</label>
              <p>{{ meeting.ownerName || 'Bilinmiyor' }}</p>
            </div>
            
            <div v-if="meeting.priorityLevel === 'UstMakam'" class="info-item">
              <label>Öncelik:</label>
              <span class="priority-badge">Üst Makam Öncelikli</span>
            </div>
          </div>
          
          <div v-if="meeting.participants && meeting.participants.length > 0" class="participants-section">
            <label>Katılımcılar:</label>
            <div class="participants-list">
              <span
                v-for="participant in meeting.participants"
                :key="participant"
                class="participant-tag"
              >
                {{ participant }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Admin Actions -->
      <div v-if="isAdmin && meeting.status === 'Beklemede'" class="admin-actions">
        <h3>Yönetici İşlemleri</h3>
        <div class="action-buttons">
          <button @click="approveMeeting" class="btn btn-success">
            <i class="icon-check"></i>
            Toplantıyı Onayla
          </button>
          <button @click="rejectMeeting" class="btn btn-danger">
            <i class="icon-x"></i>
            Toplantıyı Reddet
          </button>
        </div>
      </div>
      
      <!-- Meeting Decisions -->
      <div class="decisions-section">
        <h3>Toplantı Kararları</h3>
        <div v-if="decisions.length > 0" class="decisions-list">
          <div
            v-for="decision in decisions"
            :key="decision.id"
            class="decision-item"
          >
            <p>{{ decision.description }}</p>
            <small>{{ formatDateTime(decision.createdAt) }}</small>
          </div>
        </div>
        
        <div v-if="canAddDecision" class="add-decision">
          <textarea
            v-model="newDecision"
            class="form-control"
            placeholder="Toplantı kararı ekleyin..."
            rows="3"
          ></textarea>
          <button @click="addDecision" class="btn btn-primary" :disabled="!newDecision.trim()">
            Karar Ekle
          </button>
        </div>
        
        <div v-if="decisions.length === 0 && !canAddDecision" class="empty-state">
          Henüz toplantı kararı eklenmemiş.
        </div>
      </div>
    </div>
    
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Toplantı bilgileri yükleniyor...</p>
    </div>
    
    <div v-else class="empty-state">
      <h3>Toplantı bulunamadı</h3>
      <p>Aradığınız toplantı mevcut değil veya erişim yetkiniz bulunmuyor.</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MeetingDetails',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  
  data() {
    return {
      meeting: null,
      decisions: [],
      newDecision: '',
      loading: true
    }
  },
  
  computed: {
    ...mapGetters('auth', ['user', 'isAdmin']),
    ...mapGetters('rooms', ['activeRooms']),
    
    canEdit() {
      return this.meeting && 
             ((this.meeting.ownerId === this.user.id && this.meeting.status === 'Beklemede') || 
              this.isAdmin)
    },
    
    canAddDecision() {
      return this.meeting && 
             (this.meeting.ownerId === this.user.id || this.isAdmin) &&
             this.meeting.status === 'Onaylandi'
    }
  },
  
  async created() {
    await this.loadMeeting()
  },
  
  methods: {
    ...mapActions('meetings', ['fetchMeetings', 'approveMeeting', 'rejectMeeting']),
    ...mapActions('rooms', ['fetchRooms']),
    
    async loadMeeting() {
      try {
        await Promise.all([
          this.fetchMeetings(),
          this.fetchRooms()
        ])
        
        // Find meeting by ID (mock data for now)
        this.meeting = {
          id: parseInt(this.id),
          title: 'Proje Toplantısı',
          agenda: 'Proje ilerlemesi ve planlama konularının görüşülmesi',
          date: '2024-01-15',
          startTime: '09:00',
          endTime: '10:00',
          roomId: 1,
          status: 'Beklemede',
          priorityLevel: 'Normal',
          ownerId: 1,
          ownerName: 'Ahmet Yılmaz',
          participants: ['user1@subu.edu.tr', 'user2@subu.edu.tr']
        }
        
        // Mock decisions
        this.decisions = [
          {
            id: 1,
            description: 'Proje için bütçe artırımı onaylandı.',
            createdAt: '2024-01-15T10:00:00Z'
          }
        ]
      } catch (error) {
        console.error('Error loading meeting:', error)
      } finally {
        this.loading = false
      }
    },
    
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
    },
    
    getRoomName(roomId) {
      const room = this.activeRooms.find(r => r.id === roomId)
      return room ? room.name : `Salon ${roomId}`
    },
    
    editMeeting() {
      this.$router.push(`/meetings/${this.id}/edit`)
    },
    
    async approveMeeting() {
      if (confirm('Bu toplantıyı onaylamak istediğinize emin misiniz?')) {
        try {
          await this.approveMeeting(this.meeting.id)
          this.meeting.status = 'Onaylandi'
        } catch (error) {
          alert('Toplantı onaylanırken hata oluştu')
        }
      }
    },
    
    async rejectMeeting() {
      if (confirm('Bu toplantıyı reddetmek istediğinize emin misiniz?')) {
        try {
          await this.rejectMeeting(this.meeting.id)
          this.meeting.status = 'Reddedildi'
        } catch (error) {
          alert('Toplantı reddedilirken hata oluştu')
        }
      }
    },
    
    addDecision() {
      if (!this.newDecision.trim()) return
      
      const decision = {
        id: Date.now(),
        description: this.newDecision.trim(),
        createdAt: new Date().toISOString()
      }
      
      this.decisions.push(decision)
      this.newDecision = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.meeting-details {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    margin: 0;
    color: #333;
    font-size: 28px;
    font-weight: 700;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
  }
}

.meeting-info-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}

.card-body {
  padding: 25px;
}

.info-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 25px;
}

.info-item {
  label {
    display: block;
    font-weight: 600;
    color: #333;
    margin-bottom: 5px;
    font-size: 14px;
  }
  
  p {
    margin: 0;
    color: #666;
    line-height: 1.5;
  }
}

.participants-section {
  label {
    display: block;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
    font-size: 14px;
  }
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.participant-tag {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.priority-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
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

.admin-actions {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
  margin-bottom: 30px;
  
  h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  }
  
  .action-buttons {
    display: flex;
    gap: 15px;
  }
}

.decisions-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 25px;
  
  h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  }
}

.decisions-list {
  margin-bottom: 20px;
}

.decision-item {
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 0 6px 6px 0;
  
  p {
    margin: 0 0 5px 0;
    color: #333;
    line-height: 1.5;
  }
  
  small {
    color: #6c757d;
    font-size: 12px;
  }
}

.add-decision {
  .form-control {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    margin-bottom: 10px;
    resize: vertical;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
  }
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease-in-out;
  
  &.btn-primary {
    background: #667eea;
    color: white;
    
    &:hover:not(:disabled) {
      background: #5a6fd8;
    }
    
    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  }
  
  &.btn-outline {
    background: transparent;
    border: 2px solid #667eea;
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

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  
  h3 {
    margin-bottom: 10px;
    color: #333;
  }
  
  p {
    margin: 0;
  }
}

.spinner {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #e9ecef;
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon-back:before { content: "←"; }
.icon-check:before { content: "✓"; }
.icon-x:before { content: "✕"; }

@media (max-width: 768px) {
  .meeting-details {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>