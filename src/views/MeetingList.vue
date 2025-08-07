<template>
  <div class="meeting-list">
    <div class="page-header">
      <h1>Toplantılar</h1>
      <router-link to="/meetings/new" class="btn btn-primary">
        <i class="icon-plus"></i>
        Yeni Toplantı
      </router-link>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label>Durum:</label>
        <select v-model="selectedStatus" class="form-control">
          <option value="">Tümü</option>
          <option value="Beklemede">Beklemede</option>
          <option value="Onaylandi">Onaylandı</option>
          <option value="Reddedildi">Reddedildi</option>
          <option value="Iptal">İptal</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Tarih:</label>
        <input v-model="selectedDate" type="date" class="form-control" />
      </div>
      
      <div class="filter-group">
        <label>Salon:</label>
        <select v-model="selectedRoom" class="form-control">
          <option value="">Tümü</option>
          <option v-for="room in activeRooms" :key="room.id" :value="room.id">
            {{ room.name }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="meeting-table">
      <div class="table-header">
        <div class="table-row">
          <div class="table-cell">Toplantı</div>
          <div class="table-cell">Tarih & Saat</div>
          <div class="table-cell">Salon</div>
          <div class="table-cell">Durum</div>
          <div class="table-cell">İşlemler</div>
        </div>
      </div>
      
      <div class="table-body">
        <div
          v-for="meeting in filteredMeetings"
          :key="meeting.id"
          class="table-row"
          @click="viewMeeting(meeting.id)"
        >
          <div class="table-cell">
            <div class="meeting-info">
              <h4>{{ meeting.title }}</h4>
              <p>{{ meeting.agenda }}</p>
              <span v-if="meeting.priorityLevel === 'UstMakam'" class="priority-badge">
                Öncelikli
              </span>
            </div>
          </div>
          
          <div class="table-cell">
            <div class="datetime-info">
              <div class="date">{{ formatDate(meeting.date) }}</div>
              <div class="time">{{ meeting.startTime }} - {{ meeting.endTime }}</div>
            </div>
          </div>
          
          <div class="table-cell">
            <div class="room-info">
              {{ getRoomName(meeting.roomId) }}
            </div>
          </div>
          
          <div class="table-cell">
            <span class="status-badge" :class="getStatusClass(meeting.status)">
              {{ getStatusText(meeting.status) }}
            </span>
          </div>
          
          <div class="table-cell">
            <div class="action-buttons" @click.stop>
              <button
                v-if="canEdit(meeting)"
                @click="editMeeting(meeting.id)"
                class="btn btn-sm btn-outline"
              >
                Düzenle
              </button>
              
              <button
                v-if="canApprove(meeting)"
                @click="approveMeeting(meeting.id)"
                class="btn btn-sm btn-success"
              >
                Onayla
              </button>
              
              <button
                v-if="canReject(meeting)"
                @click="rejectMeeting(meeting.id)"
                class="btn btn-sm btn-danger"
              >
                Reddet
              </button>
              
              <button
                v-if="canCancel(meeting)"
                @click="cancelMeeting(meeting.id)"
                class="btn btn-sm btn-warning"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="filteredMeetings.length === 0" class="empty-state">
      <h3>Toplantı bulunamadı</h3>
      <p>Arama kriterlerinize uygun toplantı bulunmamaktadır.</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MeetingList',
  data() {
    return {
      selectedStatus: '',
      selectedDate: '',
      selectedRoom: ''
    }
  },
  
  computed: {
    ...mapGetters('auth', ['user', 'isAdmin', 'isUser']),
    ...mapGetters('meetings', ['allMeetings', 'userMeetings']),
    ...mapGetters('rooms', ['activeRooms']),
    
    filteredMeetings() {
      let meetings = this.isAdmin ? this.allMeetings : this.userMeetings
      
      if (this.selectedStatus) {
        meetings = meetings.filter(m => m.status === this.selectedStatus)
      }
      
      if (this.selectedDate) {
        meetings = meetings.filter(m => m.date === this.selectedDate)
      }
      
      if (this.selectedRoom) {
        meetings = meetings.filter(m => m.roomId == this.selectedRoom)
      }
      
      return meetings.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  },
  
  async created() {
    await Promise.all([
      this.fetchMeetings(),
      this.fetchRooms()
    ])
  },
  
  methods: {
    ...mapActions('meetings', [
      'fetchMeetings', 
      'approveMeeting', 
      'rejectMeeting',
      'updateMeeting'
    ]),
    ...mapActions('rooms', ['fetchRooms']),
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
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
    },
    
    getRoomName(roomId) {
      const room = this.activeRooms.find(r => r.id === roomId)
      return room ? room.name : `Salon ${roomId}`
    },
    
    canEdit(meeting) {
      return (meeting.ownerId === this.user.id && meeting.status === 'Beklemede') || this.isAdmin
    },
    
    canApprove(meeting) {
      return this.isAdmin && meeting.status === 'Beklemede'
    },
    
    canReject(meeting) {
      return this.isAdmin && meeting.status === 'Beklemede'
    },
    
    canCancel(meeting) {
      return (meeting.ownerId === this.user.id || this.isAdmin) && 
             (meeting.status === 'Beklemede' || meeting.status === 'Onaylandi')
    },
    
    viewMeeting(id) {
      this.$router.push(`/meetings/${id}`)
    },
    
    editMeeting(id) {
      this.$router.push(`/meetings/${id}/edit`)
    },
    
    async cancelMeeting(id) {
      if (confirm('Bu toplantıyı iptal etmek istediğinize emin misiniz?')) {
        try {
          await this.updateMeeting({ id, updates: { status: 'Iptal' } })
          this.$emit('notification', {
            type: 'success',
            message: 'Toplantı başarıyla iptal edildi'
          })
        } catch (error) {
          this.$emit('notification', {
            type: 'error',
            message: 'Toplantı iptal edilirken hata oluştu'
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.meeting-list {
  padding: 20px;
  max-width: 1400px;
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
  
  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  &.btn-primary {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a6fd8;
    }
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
  
  &.btn-warning {
    background: #ffc107;
    color: #212529;
    
    &:hover {
      background: #e0a800;
    }
  }
}

.filters {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    
    label {
      font-weight: 600;
      color: #333;
      font-size: 14px;
    }
    
    .form-control {
      padding: 8px 12px;
      border: 1px solid #e1e5e9;
      border-radius: 6px;
      font-size: 14px;
      min-width: 150px;
      
      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
      }
    }
  }
}

.meeting-table {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  
  .table-row {
    padding: 15px 20px;
    font-weight: 600;
    color: #333;
  }
}

.table-body {
  .table-row {
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
    
    &:hover {
      background: #f8f9fa;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1.5fr;
  gap: 20px;
  align-items: center;
  padding: 20px;
}

.table-cell {
  .meeting-info {
    h4 {
      margin: 0 0 5px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
  }
  
  .datetime-info {
    .date {
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
    }
    
    .time {
      font-size: 14px;
      color: #666;
    }
  }
  
  .room-info {
    font-weight: 500;
    color: #333;
  }
}

.priority-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge {
  padding: 4px 12px;
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

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

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

.icon-plus:before { content: "➕"; }

@media (max-width: 768px) {
  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .table-cell {
    padding: 0;
  }
  
  .filters {
    .filter-group {
      .form-control {
        min-width: 120px;
      }
    }
  }
  
  .action-buttons {
    margin-top: 10px;
  }
}
</style>