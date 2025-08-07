<template>
  <div class="meeting-form">
    <div class="page-header">
      <h1>{{ isEdit ? 'Toplantı Düzenle' : 'Yeni Toplantı' }}</h1>
      <div class="header-actions">
        <router-link to="/meetings" class="btn btn-outline">
          <i class="icon-back"></i>
          Geri Dön
        </router-link>
      </div>
    </div>
    
    <form @submit.prevent="handleSubmit" class="form-container">
      <div class="form-grid">
        <div class="form-section">
          <h3>Toplantı Bilgileri</h3>
          
          <div class="form-group">
            <label for="title">Toplantı Başlığı *</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.title }"
              placeholder="Toplantı başlığını girin"
              required
            />
            <div v-if="errors.title" class="invalid-feedback">
              {{ errors.title }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="agenda">Gündem *</label>
            <textarea
              id="agenda"
              v-model="form.agenda"
              class="form-control"
              :class="{ 'is-invalid': errors.agenda }"
              placeholder="Toplantı gündemini detaylandırın"
              rows="4"
              required
            ></textarea>
            <div v-if="errors.agenda" class="invalid-feedback">
              {{ errors.agenda }}
            </div>
          </div>
          
          <div class="form-group">
            <label for="participants">Katılımcılar</label>
            <div class="participants-input">
              <input
                v-model="newParticipant"
                type="email"
                class="form-control"
                placeholder="E-posta ekle (@subu.edu.tr)"
                @keyup.enter="addParticipant"
              />
              <button type="button" @click="addParticipant" class="btn btn-outline">
                Ekle
              </button>
            </div>
            <div class="participants-list">
              <span
                v-for="(participant, index) in form.participants"
                :key="index"
                class="participant-tag"
              >
                {{ participant }}
                <button type="button" @click="removeParticipant(index)" class="remove-btn">
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Tarih ve Saat</h3>
          
          <div class="form-group">
            <label for="date">Tarih *</label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              class="form-control"
              :class="{ 'is-invalid': errors.date }"
              :min="minDate"
              required
            />
            <div v-if="errors.date" class="invalid-feedback">
              {{ errors.date }}
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="startTime">Başlangıç Saati *</label>
              <select
                id="startTime"
                v-model="form.startTime"
                class="form-control"
                :class="{ 'is-invalid': errors.startTime }"
                required
              >
                <option value="">Saat seçin</option>
                <option v-for="time in timeSlots" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
              <div v-if="errors.startTime" class="invalid-feedback">
                {{ errors.startTime }}
              </div>
            </div>
            
            <div class="form-group">
              <label for="endTime">Bitiş Saati *</label>
              <select
                id="endTime"
                v-model="form.endTime"
                class="form-control"
                :class="{ 'is-invalid': errors.endTime }"
                required
              >
                <option value="">Saat seçin</option>
                <option v-for="time in endTimeSlots" :key="time" :value="time">
                  {{ time }}
                </option>
              </select>
              <div v-if="errors.endTime" class="invalid-feedback">
                {{ errors.endTime }}
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Salon ve Öncelik</h3>
          
          <div class="form-group">
            <label for="roomId">Toplantı Salonu *</label>
            <select
              id="roomId"
              v-model="form.roomId"
              class="form-control"
              :class="{ 'is-invalid': errors.roomId }"
              required
            >
              <option value="">Salon seçin</option>
              <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                {{ room.name }} (Kapasite: {{ room.capacity }})
              </option>
            </select>
            <div v-if="errors.roomId" class="invalid-feedback">
              {{ errors.roomId }}
            </div>
          </div>
          
          <div v-if="isUstMakam" class="form-group">
            <label class="checkbox-label">
              <input
                v-model="form.priorityLevel"
                type="checkbox"
                true-value="UstMakam"
                false-value="Normal"
              />
              <span class="checkmark"></span>
              Öncelikli Toplantı (Üst Makam)
            </label>
            <p class="help-text">
              Öncelikli toplantılar diğer toplantıların üzerine planlanabilir.
            </p>
          </div>
        </div>
      </div>
      
      <div v-if="errors.general" class="alert alert-danger">
        {{ errors.general }}
      </div>
      
      <div class="form-actions">
        <button type="button" @click="$router.go(-1)" class="btn btn-outline">
          İptal
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Oluştur') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MeetingForm',
  props: {
    id: {
      type: String,
      default: null
    }
  },
  
  data() {
    return {
      form: {
        title: '',
        agenda: '',
        date: '',
        startTime: '',
        endTime: '',
        roomId: '',
        priorityLevel: 'Normal',
        participants: []
      },
      newParticipant: '',
      loading: false,
      errors: {}
    }
  },
  
  computed: {
    ...mapGetters('auth', ['user', 'isUstMakam']),
    ...mapGetters('rooms', ['activeRooms']),
    ...mapGetters('meetings', ['allMeetings']),
    
    isEdit() {
      return !!this.id
    },
    
    minDate() {
      return new Date().toISOString().split('T')[0]
    },
    
    timeSlots() {
      const slots = []
      for (let hour = 8; hour <= 18; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
        if (hour < 18) {
          slots.push(`${hour.toString().padStart(2, '0')}:30`)
        }
      }
      return slots
    },
    
    endTimeSlots() {
      if (!this.form.startTime) return []
      
      const startHour = parseInt(this.form.startTime.split(':')[0])
      const startMinute = parseInt(this.form.startTime.split(':')[1])
      const slots = []
      
      for (let hour = startHour; hour <= 18; hour++) {
        if (hour === startHour) {
          if (startMinute === 0) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`)
          }
          if (hour < 18) {
            slots.push(`${(hour + 1).toString().padStart(2, '0')}:00`)
          }
        } else {
          slots.push(`${hour.toString().padStart(2, '0')}:00`)
          if (hour < 18) {
            slots.push(`${hour.toString().padStart(2, '0')}:30`)
          }
        }
      }
      
      return slots
    },
    
    availableRooms() {
      if (!this.form.date || !this.form.startTime || !this.form.endTime) {
        return this.activeRooms
      }
      
      // Check room availability (simplified logic)
      return this.activeRooms.filter(room => {
        const conflictingMeetings = this.allMeetings.filter(meeting => 
          meeting.roomId === room.id &&
          meeting.date === this.form.date &&
          meeting.status === 'Onaylandi' &&
          meeting.id !== parseInt(this.id) // Exclude current meeting if editing
        )
        
        return !conflictingMeetings.some(meeting => {
          return this.timeOverlaps(
            this.form.startTime, this.form.endTime,
            meeting.startTime, meeting.endTime
          )
        })
      })
    }
  },
  
  async created() {
    await this.fetchRooms()
    
    if (this.isEdit) {
      await this.loadMeeting()
    }
  },
  
  methods: {
    ...mapActions('rooms', ['fetchRooms']),
    ...mapActions('meetings', ['createMeeting', 'updateMeeting', 'fetchMeetings']),
    
    async loadMeeting() {
      try {
        await this.fetchMeetings()
        const meeting = this.allMeetings.find(m => m.id === parseInt(this.id))
        
        if (meeting) {
          this.form = {
            title: meeting.title,
            agenda: meeting.agenda,
            date: meeting.date,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            roomId: meeting.roomId,
            priorityLevel: meeting.priorityLevel || 'Normal',
            participants: meeting.participants || []
          }
        }
      } catch (error) {
        this.errors.general = 'Toplantı bilgileri yüklenirken hata oluştu'
      }
    },
    
    validateForm() {
      this.errors = {}
      
      if (!this.form.title.trim()) {
        this.errors.title = 'Toplantı başlığı gereklidir'
      }
      
      if (!this.form.agenda.trim()) {
        this.errors.agenda = 'Gündem gereklidir'
      }
      
      if (!this.form.date) {
        this.errors.date = 'Tarih gereklidir'
      } else if (new Date(this.form.date) < new Date().setHours(0, 0, 0, 0)) {
        this.errors.date = 'Geçmiş tarih seçilemez'
      }
      
      if (!this.form.startTime) {
        this.errors.startTime = 'Başlangıç saati gereklidir'
      }
      
      if (!this.form.endTime) {
        this.errors.endTime = 'Bitiş saati gereklidir'
      } else if (this.form.startTime && this.form.endTime <= this.form.startTime) {
        this.errors.endTime = 'Bitiş saati başlangıç saatinden sonra olmalıdır'
      }
      
      if (!this.form.roomId) {
        this.errors.roomId = 'Salon seçimi gereklidir'
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }
      
      this.loading = true
      this.errors = {}
      
      try {
        const meetingData = {
          ...this.form,
          ownerId: this.user.id
        }
        
        if (this.isEdit) {
          await this.updateMeeting({ id: parseInt(this.id), updates: meetingData })
          this.$router.push(`/meetings/${this.id}`)
        } else {
          const newMeeting = await this.createMeeting(meetingData)
          this.$router.push(`/meetings/${newMeeting.id}`)
        }
      } catch (error) {
        this.errors.general = error.message || 'Toplantı kaydedilirken hata oluştu'
      } finally {
        this.loading = false
      }
    },
    
    addParticipant() {
      const email = this.newParticipant.trim()
      
      if (!email) return
      
      if (!email.includes('@subu.edu.tr')) {
        alert('Sadece @subu.edu.tr uzantılı e-posta adresleri eklenebilir')
        return
      }
      
      if (this.form.participants.includes(email)) {
        alert('Bu e-posta zaten eklenmiş')
        return
      }
      
      this.form.participants.push(email)
      this.newParticipant = ''
    },
    
    removeParticipant(index) {
      this.form.participants.splice(index, 1)
    },
    
    timeOverlaps(start1, end1, start2, end2) {
      return start1 < end2 && end1 > start2
    }
  }
}
</script>

<style lang="scss" scoped>
.meeting-form {
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
}

.form-container {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  gap: 30px;
}

.form-section {
  h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 2px solid #667eea;
    padding-bottom: 8px;
  }
}

.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: #333;
    font-weight: 600;
    font-size: 14px;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  }
  
  &.is-invalid {
    border-color: #dc3545;
  }
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.participants-input {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.participant-tag {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .remove-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    
    &:hover {
      color: #ffcccc;
    }
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    
    &:checked + .checkmark {
      background: #667eea;
      border-color: #667eea;
      
      &:after {
        display: block;
      }
    }
  }
  
  .checkmark {
    height: 18px;
    width: 18px;
    background: white;
    border: 2px solid #e1e5e9;
    border-radius: 3px;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      display: none;
      left: 4px;
      top: 1px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
}

.help-text {
  margin: 5px 0 0 0;
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

.alert {
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  
  &.alert-danger {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
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
}

.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon-back:before { content: "←"; }

@media (max-width: 768px) {
  .meeting-form {
    padding: 15px;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .participants-input {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>