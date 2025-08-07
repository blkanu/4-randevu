<template>
  <div class="special-days">
    <div class="page-header">
      <h1>Özel Günler Yönetimi</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Yeni Özel Gün Ekle
      </button>
    </div>
    
    <div class="special-days-grid">
      <div
        v-for="specialDay in allSpecialDays"
        :key="specialDay.id"
        class="special-day-card"
        :class="getCardClass(specialDay)"
      >
        <div class="card-header">
          <div class="date-info">
            <div class="date">{{ formatDate(specialDay.date) }}</div>
            <div class="day-name">{{ getDayName(specialDay.date) }}</div>
          </div>
          <div class="card-actions">
            <button @click="editSpecialDay(specialDay)" class="btn btn-sm btn-outline">
              Düzenle
            </button>
            <button @click="deleteSpecialDay(specialDay.id)" class="btn btn-sm btn-danger">
              Sil
            </button>
          </div>
        </div>
        
        <div class="card-body">
          <h3>{{ specialDay.description }}</h3>
          <span class="type-badge" :class="getTypeClass(specialDay.type)">
            {{ getTypeText(specialDay.type) }}
          </span>
        </div>
      </div>
    </div>
    
    <div v-if="allSpecialDays.length === 0" class="empty-state">
      <h3>Henüz özel gün eklenmemiş</h3>
      <p>Toplantı sisteminin kapalı olacağı özel günleri buradan yönetebilirsiniz.</p>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Özel Gün Düzenle' : 'Yeni Özel Gün' }}</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="saveSpecialDay" class="modal-body">
          <div class="form-group">
            <label for="specialDate">Tarih *</label>
            <input
              id="specialDate"
              v-model="specialDayForm.date"
              type="date"
              class="form-control"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="specialDescription">Açıklama *</label>
            <input
              id="specialDescription"
              v-model="specialDayForm.description"
              type="text"
              class="form-control"
              placeholder="Özel günün açıklaması"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="specialType">Tür *</label>
            <select id="specialType" v-model="specialDayForm.type" class="form-control" required>
              <option value="holiday">Resmi Tatil</option>
              <option value="maintenance">Sistem Bakımı</option>
              <option value="event">Özel Etkinlik</option>
              <option value="closure">Genel Kapalı</option>
            </select>
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
  name: 'SpecialDays',
  data() {
    return {
      showCreateModal: false,
      showEditModal: false,
      editingSpecialDay: null,
      loading: false,
      specialDayForm: {
        date: '',
        description: '',
        type: 'holiday'
      }
    }
  },
  
  computed: {
    ...mapGetters('specialDays', ['allSpecialDays'])
  },
  
  async created() {
    await this.fetchSpecialDays()
  },
  
  methods: {
    ...mapActions('specialDays', ['fetchSpecialDays', 'createSpecialDay', 'updateSpecialDay', 'deleteSpecialDay']),
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },
    
    getDayName(dateString) {
      const date = new Date(dateString)
      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
      return dayNames[date.getDay()]
    },
    
    getTypeText(type) {
      const typeMap = {
        'holiday': 'Resmi Tatil',
        'maintenance': 'Sistem Bakımı',
        'event': 'Özel Etkinlik',
        'closure': 'Genel Kapalı'
      }
      return typeMap[type] || type
    },
    
    getTypeClass(type) {
      return {
        'type-holiday': type === 'holiday',
        'type-maintenance': type === 'maintenance',
        'type-event': type === 'event',
        'type-closure': type === 'closure'
      }
    },
    
    getCardClass(specialDay) {
      const today = new Date().toISOString().split('T')[0]
      return {
        'card-past': specialDay.date < today,
        'card-today': specialDay.date === today,
        'card-future': specialDay.date > today
      }
    },
    
    editSpecialDay(specialDay) {
      this.editingSpecialDay = specialDay
      this.specialDayForm = {
        date: specialDay.date,
        description: specialDay.description,
        type: specialDay.type
      }
      this.showEditModal = true
    },
    
    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.editingSpecialDay = null
      this.resetForm()
    },
    
    resetForm() {
      this.specialDayForm = {
        date: '',
        description: '',
        type: 'holiday'
      }
    },
    
    async saveSpecialDay() {
      this.loading = true
      
      try {
        if (this.showEditModal) {
          await this.updateSpecialDay({
            id: this.editingSpecialDay.id,
            updates: this.specialDayForm
          })
        } else {
          await this.createSpecialDay(this.specialDayForm)
        }
        
        this.closeModal()
      } catch (error) {
        alert('Özel gün kaydedilirken hata oluştu: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    async deleteSpecialDay(id) {
      if (confirm('Bu özel günü silmek istediğinize emin misiniz?')) {
        try {
          await this.deleteSpecialDay(id)
        } catch (error) {
          alert('Özel gün silinirken hata oluştu')
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.special-days {
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

.special-days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.special-day-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  &.card-past {
    opacity: 0.7;
    background: #f8f9fa;
  }
  
  &.card-today {
    border: 2px solid #667eea;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  }
  
  &.card-future {
    border-left: 4px solid #28a745;
  }
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .date-info {
    .date {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .day-name {
      font-size: 12px;
      opacity: 0.9;
    }
  }
  
  .card-actions {
    display: flex;
    gap: 8px;
  }
}

.card-body {
  padding: 20px;
  
  h3 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
  }
}

.type-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.type-holiday {
    background: #dc3545;
    color: white;
  }
  
  &.type-maintenance {
    background: #ffc107;
    color: #212529;
  }
  
  &.type-event {
    background: #17a2b8;
    color: white;
  }
  
  &.type-closure {
    background: #6c757d;
    color: white;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
  grid-column: 1 / -1;
  
  h3 {
    margin-bottom: 10px;
    color: #333;
  }
  
  p {
    margin: 0;
    max-width: 400px;
    margin: 0 auto;
  }
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
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
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
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

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  
  .btn.btn-outline {
    background: transparent;
    border: 1px solid #667eea;
    color: #667eea;
    
    &:hover {
      background: #667eea;
      color: white;
    }
  }
}

@media (max-width: 768px) {
  .special-days-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>