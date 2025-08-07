<template>
  <div class="room-management">
    <div class="page-header">
      <h1>Salon Yönetimi</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Yeni Salon Ekle
      </button>
    </div>
    
    <div class="rooms-grid">
      <div
        v-for="room in allRooms"
        :key="room.id"
        class="room-card"
        :class="{ 'room-inactive': room.status === 'Pasif' }"
      >
        <div class="room-header">
          <h3>{{ room.name }}</h3>
          <div class="room-actions">
            <button @click="editRoom(room)" class="btn btn-sm btn-outline">
              Düzenle
            </button>
            <button
              @click="toggleRoomStatus(room)"
              class="btn btn-sm"
              :class="room.status === 'Aktif' ? 'btn-warning' : 'btn-success'"
            >
              {{ room.status === 'Aktif' ? 'Pasif Yap' : 'Aktif Yap' }}
            </button>
          </div>
        </div>
        
        <div class="room-info">
          <div class="info-item">
            <label>Kapasite:</label>
            <span>{{ room.capacity }} kişi</span>
          </div>
          
          <div class="info-item">
            <label>Durum:</label>
            <span class="status-badge" :class="getStatusClass(room.status)">
              {{ room.status }}
            </span>
          </div>
          
          <div v-if="room.equipment" class="info-item">
            <label>Donanım:</label>
            <div class="equipment-list">
              <span
                v-for="item in room.equipment"
                :key="item"
                class="equipment-tag"
              >
                {{ item }}
              </span>
            </div>
          </div>
          
          <div v-if="room.description" class="info-item">
            <label>Açıklama:</label>
            <p>{{ room.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Salon Düzenle' : 'Yeni Salon' }}</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="saveRoom" class="modal-body">
          <div class="form-group">
            <label for="roomName">Salon Adı *</label>
            <input
              id="roomName"
              v-model="roomForm.name"
              type="text"
              class="form-control"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="roomCapacity">Kapasite *</label>
            <input
              id="roomCapacity"
              v-model.number="roomForm.capacity"
              type="number"
              class="form-control"
              min="1"
              max="100"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="roomDescription">Açıklama</label>
            <textarea
              id="roomDescription"
              v-model="roomForm.description"
              class="form-control"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Donanım</label>
            <div class="equipment-checkboxes">
              <label
                v-for="equipment in availableEquipment"
                :key="equipment"
                class="checkbox-label"
              >
                <input
                  v-model="roomForm.equipment"
                  type="checkbox"
                  :value="equipment"
                />
                <span class="checkmark"></span>
                {{ equipment }}
              </label>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-outline">
              İptal
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Kaydediliyor...' : 'Kaydet' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'RoomManagement',
  data() {
    return {
      showCreateModal: false,
      showEditModal: false,
      editingRoom: null,
      loading: false,
      roomForm: {
        name: '',
        capacity: 10,
        description: '',
        equipment: []
      },
      availableEquipment: [
        'Projektor',
        'Beyaz Tahta',
        'Wi-Fi',
        'Telefon',
        'Klima',
        'Ses Sistemi',
        'Video Konferans',
        'Flip Chart'
      ]
    }
  },
  
  computed: {
    ...mapGetters('rooms', ['allRooms'])
  },
  
  async created() {
    await this.fetchRooms()
  },
  
  methods: {
    ...mapActions('rooms', ['fetchRooms', 'createRoom', 'updateRoom', 'toggleRoomStatus']),
    
    getStatusClass(status) {
      return {
        'status-active': status === 'Aktif',
        'status-passive': status === 'Pasif'
      }
    },
    
    editRoom(room) {
      this.editingRoom = room
      this.roomForm = {
        name: room.name,
        capacity: room.capacity,
        description: room.description || '',
        equipment: [...(room.equipment || [])]
      }
      this.showEditModal = true
    },
    
    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.editingRoom = null
      this.resetForm()
    },
    
    resetForm() {
      this.roomForm = {
        name: '',
        capacity: 10,
        description: '',
        equipment: []
      }
    },
    
    async saveRoom() {
      this.loading = true
      
      try {
        if (this.showEditModal) {
          await this.updateRoom({
            id: this.editingRoom.id,
            updates: this.roomForm
          })
        } else {
          await this.createRoom(this.roomForm)
        }
        
        this.closeModal()
      } catch (error) {
        alert('Salon kaydedilirken hata oluştu: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    async toggleRoomStatus(room) {
      const action = room.status === 'Aktif' ? 'pasif' : 'aktif'
      
      if (confirm(`${room.name} salonunu ${action} yapmak istediğinize emin misiniz?`)) {
        try {
          await this.toggleRoomStatus(room)
        } catch (error) {
          alert('Salon durumu değiştirilirken hata oluştu')
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.room-management {
  padding: 20px;
  max-width: 1200px;
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

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.room-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  &.room-inactive {
    opacity: 0.7;
    background: #f8f9fa;
  }
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  }
  
  .room-actions {
    display: flex;
    gap: 8px;
  }
}

.room-info {
  .info-item {
    margin-bottom: 12px;
    
    label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
      font-size: 14px;
    }
    
    span {
      color: #666;
    }
    
    p {
      margin: 0;
      color: #666;
      line-height: 1.4;
    }
  }
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.status-active {
    background: #d4edda;
    color: #155724;
  }
  
  &.status-passive {
    background: #f8d7da;
    color: #721c24;
  }
}

.equipment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.equipment-tag {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
  
  &.btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }
  
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
  
  &.btn-warning {
    background: #ffc107;
    color: #212529;
    
    &:hover {
      background: #e0a800;
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  
  h2 {
    margin: 0;
    color: #333;
    font-size: 20px;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    
    &:hover {
      color: #333;
    }
  }
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 6px;
    color: #333;
    font-weight: 600;
    font-size: 14px;
  }
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }
}

textarea.form-control {
  resize: vertical;
}

.equipment-checkboxes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    
    &:checked + .checkmark {
      background: #667eea;
      border-color: #667eea;
      
      &:after {
        display: block;
      }
    }
  }
  
  .checkmark {
    width: 16px;
    height: 16px;
    background: white;
    border: 2px solid #e1e5e9;
    border-radius: 3px;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      display: none;
      left: 3px;
      top: 0px;
      width: 3px;
      height: 7px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .rooms-grid {
    grid-template-columns: 1fr;
  }
  
  .room-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .equipment-checkboxes {
    grid-template-columns: 1fr;
  }
}
</style>