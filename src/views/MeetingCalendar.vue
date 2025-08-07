<template>
  <div class="meeting-calendar">
    <div class="page-header">
      <h1>Toplantı Takvimi</h1>
      <router-link to="/meetings/new" class="btn btn-primary">
        Yeni Toplantı
      </router-link>
    </div>
    
    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="previousWeek" class="btn btn-outline">
          ‹ Önceki Hafta
        </button>
        <h2>{{ getCurrentWeekText }}</h2>
        <button @click="nextWeek" class="btn btn-outline">
          Sonraki Hafta ›
        </button>
      </div>
      
      <div class="calendar-grid">
        <div class="time-column">
          <div class="time-header">Saat</div>
          <div v-for="hour in hours" :key="hour" class="time-slot">
            {{ hour }}:00
          </div>
        </div>
        
        <div v-for="day in weekDays" :key="day.date" class="day-column">
          <div class="day-header">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ day.dateText }}</div>
          </div>
          
          <div v-for="hour in hours" :key="hour" class="time-slot">
            <div
              v-for="meeting in getMeetingsForSlot(day.date, hour)"
              :key="meeting.id"
              class="meeting-block"
              :class="getMeetingClass(meeting)"
              @click="viewMeeting(meeting.id)"
            >
              <div class="meeting-title">{{ meeting.title }}</div>
              <div class="meeting-room">{{ getRoomName(meeting.roomId) }}</div>
            </div>
            
            <div
              v-if="canCreateMeeting(day.date, hour)"
              class="time-slot-empty"
              @click="createMeeting(day.date, hour)"
            >
              +
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'MeetingCalendar',
  data() {
    return {
      currentWeekStart: new Date(),
      hours: Array.from({ length: 11 }, (_, i) => i + 8) // 8-18 hours
    }
  },
  
  computed: {
    ...mapGetters('auth', ['user', 'isAdmin']),
    ...mapGetters('meetings', ['allMeetings']),
    ...mapGetters('rooms', ['activeRooms']),
    
    getCurrentWeekText() {
      const start = new Date(this.currentWeekStart)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      
      return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`
    },
    
    weekDays() {
      const days = []
      const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(this.currentWeekStart)
        date.setDate(this.currentWeekStart.getDate() + i)
        
        days.push({
          date: date.toISOString().split('T')[0],
          dateText: date.getDate().toString(),
          name: dayNames[i]
        })
      }
      
      return days
    }
  },
  
  async created() {
    // Set to start of week (Monday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    this.currentWeekStart = monday
    
    await Promise.all([
      this.fetchMeetings(),
      this.fetchRooms()
    ])
  },
  
  methods: {
    ...mapActions('meetings', ['fetchMeetings']),
    ...mapActions('rooms', ['fetchRooms']),
    
    previousWeek() {
      const newDate = new Date(this.currentWeekStart)
      newDate.setDate(newDate.getDate() - 7)
      this.currentWeekStart = newDate
    },
    
    nextWeek() {
      const newDate = new Date(this.currentWeekStart)
      newDate.setDate(newDate.getDate() + 7)
      this.currentWeekStart = newDate
    },
    
    getMeetingsForSlot(date, hour) {
      return this.allMeetings.filter(meeting => {
        if (meeting.date !== date) return false
        if (meeting.status === 'Reddedildi' || meeting.status === 'Iptal') return false
        
        const startHour = parseInt(meeting.startTime.split(':')[0])
        const endHour = parseInt(meeting.endTime.split(':')[0])
        
        return startHour <= hour && hour < endHour
      })
    },
    
    getMeetingClass(meeting) {
      return {
        'meeting-pending': meeting.status === 'Beklemede',
        'meeting-approved': meeting.status === 'Onaylandi',
        'meeting-priority': meeting.priorityLevel === 'UstMakam',
        'meeting-own': meeting.ownerId === this.user.id
      }
    },
    
    getRoomName(roomId) {
      const room = this.activeRooms.find(r => r.id === roomId)
      return room ? room.name : `Salon ${roomId}`
    },
    
    canCreateMeeting(date, hour) {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Can't create meetings in the past
      if (selectedDate < today) return false
      
      // Check if slot is empty
      return this.getMeetingsForSlot(date, hour).length === 0
    },
    
    createMeeting(date, hour) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`
      this.$router.push({
        path: '/meetings/new',
        query: { date, startTime: timeString }
      })
    },
    
    viewMeeting(id) {
      this.$router.push(`/meetings/${id}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.meeting-calendar {
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

.calendar-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  
  h2 {
    margin: 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  min-height: 600px;
}

.time-column {
  border-right: 1px solid #e9ecef;
  
  .time-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #333;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
  }
  
  .time-slot {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #e9ecef;
    font-size: 12px;
    color: #666;
  }
}

.day-column {
  border-right: 1px solid #e9ecef;
  
  &:last-child {
    border-right: none;
  }
  
  .day-header {
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    
    .day-name {
      font-weight: 600;
      color: #333;
      font-size: 12px;
    }
    
    .day-date {
      font-size: 16px;
      color: #667eea;
      font-weight: 700;
    }
  }
  
  .time-slot {
    height: 50px;
    border-bottom: 1px solid #e9ecef;
    position: relative;
    padding: 2px;
  }
}

.meeting-block {
  background: #667eea;
  color: white;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  line-height: 1.2;
  margin-bottom: 2px;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  &.meeting-pending {
    background: #ffc107;
    color: #212529;
  }
  
  &.meeting-approved {
    background: #28a745;
  }
  
  &.meeting-priority {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  }
  
  &.meeting-own {
    border: 2px solid #fff;
  }
  
  .meeting-title {
    font-weight: 600;
    margin-bottom: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .meeting-room {
    font-size: 10px;
    opacity: 0.9;
  }
}

.time-slot-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ccc;
  font-size: 18px;
  transition: all 0.15s ease-in-out;
  
  &:hover {
    background: #f8f9fa;
    color: #667eea;
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.15s ease-in-out;
  
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
}

@media (max-width: 768px) {
  .calendar-grid {
    grid-template-columns: 60px repeat(7, 1fr);
    font-size: 10px;
  }
  
  .time-column .time-slot {
    font-size: 10px;
  }
  
  .day-column .day-header {
    .day-name {
      font-size: 10px;
    }
    
    .day-date {
      font-size: 14px;
    }
  }
  
  .meeting-block {
    font-size: 9px;
    padding: 2px 4px;
  }
}
</style>