<template>
  <div class="appointments">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1><i class="fas fa-handshake me-2"></i>Randevular</h1>
          <p class="text-muted mb-0">Tüm randevuları görüntüle ve yönet</p>
        </div>
        <router-link to="/appointments/create" class="btn btn-primary">
          <i class="fas fa-plus me-2"></i>Yeni Randevu
        </router-link>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3 mb-3">
            <label class="form-label">Durum</label>
            <b-form-select v-model="filters.status" @change="applyFilters">
              <option value="">Tüm Durumlar</option>
              <option value="pending">Bekliyor</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
              <option value="cancelled">İptal Edildi</option>
            </b-form-select>
          </div>
          <div class="col-md-3 mb-3">
            <label class="form-label">Salon</label>
            <b-form-select v-model="filters.roomId" @change="applyFilters">
              <option value="">Tüm Salonlar</option>
              <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                {{ room.name }}
              </option>
            </b-form-select>
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">Tarih Aralığı</label>
            <div class="d-flex gap-2">
              <b-form-input
                v-model="dateRange.start"
                type="date"
                placeholder="Başlangıç"
                @change="applyFilters"
              />
              <b-form-input
                v-model="dateRange.end"
                type="date"
                placeholder="Bitiş"
                @change="applyFilters"
              />
            </div>
          </div>
          <div class="col-md-2 mb-3">
            <label class="form-label">&nbsp;</label>
            <div>
              <b-button variant="outline-secondary" @click="clearFilters" block>
                <i class="fas fa-times me-1"></i>Temizle
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointments Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="isLoading" class="text-center py-4">
          <b-spinner variant="primary"></b-spinner>
          <p class="mt-2 text-muted">Randevular yükleniyor...</p>
        </div>

        <div v-else-if="filteredAppointments.length === 0" class="text-center py-5">
          <i class="fas fa-calendar-times fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Randevu bulunamadı</h5>
          <p class="text-muted">Arama kriterlerinize uygun randevu bulunmuyor.</p>
        </div>

        <div v-else>
          <!-- Desktop Table -->
          <div class="table-responsive d-none d-md-block">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Tarih & Saat</th>
                  <th>Salon</th>
                  <th>Düzenleyen</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in paginatedAppointments" :key="appointment.id">
                  <td>
                    <strong>{{ appointment.title }}</strong>
                    <br>
                    <small class="text-muted">{{ appointment.description }}</small>
                  </td>
                  <td>
                    <div class="fw-bold">{{ formatDate(appointment.date) }}</div>
                    <small class="text-muted">
                      {{ appointment.startTime }} - {{ appointment.endTime }}
                    </small>
                  </td>
                  <td>
                    <i class="fas fa-door-open me-1"></i>
                    {{ appointment.roomName }}
                  </td>
                  <td>
                    <i class="fas fa-user me-1"></i>
                    {{ appointment.organizerName }}
                  </td>
                  <td>
                    <b-badge :variant="getStatusVariant(appointment.status)">
                      {{ getStatusDisplayName(appointment.status) }}
                    </b-badge>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <router-link
                        :to="`/appointments/${appointment.id}`"
                        class="btn btn-outline-primary"
                        title="Detayları Görüntüle"
                      >
                        <i class="fas fa-eye"></i>
                      </router-link>
                      <button
                        v-if="canApproveAppointments && appointment.status === 'pending'"
                        @click="approveAppointment(appointment.id)"
                        class="btn btn-outline-success"
                        title="Onayla"
                      >
                        <i class="fas fa-check"></i>
                      </button>
                      <button
                        v-if="canApproveAppointments && appointment.status === 'pending'"
                        @click="showRejectModal(appointment)"
                        class="btn btn-outline-danger"
                        title="Reddet"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="d-md-none">
            <div
              v-for="appointment in paginatedAppointments"
              :key="appointment.id"
              class="appointment-card mb-3"
            >
              <div class="card">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h6 class="mb-0">{{ appointment.title }}</h6>
                    <b-badge :variant="getStatusVariant(appointment.status)">
                      {{ getStatusDisplayName(appointment.status) }}
                    </b-badge>
                  </div>
                  <p class="text-muted small mb-2">{{ appointment.description }}</p>
                  
                  <div class="row text-sm mb-3">
                    <div class="col-6">
                      <i class="fas fa-calendar me-1"></i>
                      {{ formatDate(appointment.date) }}
                    </div>
                    <div class="col-6">
                      <i class="fas fa-clock me-1"></i>
                      {{ appointment.startTime }} - {{ appointment.endTime }}
                    </div>
                    <div class="col-6">
                      <i class="fas fa-door-open me-1"></i>
                      {{ appointment.roomName }}
                    </div>
                    <div class="col-6">
                      <i class="fas fa-user me-1"></i>
                      {{ appointment.organizerName }}
                    </div>
                  </div>

                  <div class="d-flex gap-2">
                    <router-link
                      :to="`/appointments/${appointment.id}`"
                      class="btn btn-sm btn-outline-primary flex-fill"
                    >
                      <i class="fas fa-eye me-1"></i>Detay
                    </router-link>
                    <button
                      v-if="canApproveAppointments && appointment.status === 'pending'"
                      @click="approveAppointment(appointment.id)"
                      class="btn btn-sm btn-outline-success"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      v-if="canApproveAppointments && appointment.status === 'pending'"
                      @click="showRejectModal(appointment)"
                      class="btn btn-sm btn-outline-danger"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
            <b-pagination
              v-model="currentPage"
              :total-rows="filteredAppointments.length"
              :per-page="perPage"
              size="sm"
            ></b-pagination>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <b-modal
      id="reject-modal"
      v-model="showRejectModalFlag"
      title="Randevu Reddetme"
      @ok="rejectAppointment"
      ok-title="Reddet"
      ok-variant="danger"
      cancel-title="İptal"
    >
      <p><strong>{{ selectedAppointment?.title }}</strong> randevusunu reddetmek istediğinizden emin misiniz?</p>
      
      <b-form-group label="Red Nedeni" label-for="reject-reason">
        <b-form-textarea
          id="reject-reason"
          v-model="rejectReason"
          rows="3"
          placeholder="Red nedeninizi belirtiniz..."
          required
        ></b-form-textarea>
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import moment from 'moment'

export default {
  name: 'AppointmentList',
  data() {
    return {
      filters: {
        status: '',
        roomId: '',
      },
      dateRange: {
        start: '',
        end: ''
      },
      currentPage: 1,
      perPage: 10,
      showRejectModalFlag: false,
      selectedAppointment: null,
      rejectReason: ''
    }
  },
  computed: {
    ...mapGetters({
      allAppointments: 'appointments/filteredAppointments',
      isLoading: 'appointments/isLoading',
      availableRooms: 'rooms/activeRooms',
      canApproveAppointments: 'auth/canApproveAppointments'
    }),
    filteredAppointments() {
      return this.allAppointments
    },
    paginatedAppointments() {
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      return this.filteredAppointments.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredAppointments.length / this.perPage)
    }
  },
  async mounted() {
    // Apply URL filters if any
    this.applyUrlFilters()
    
    // Load data
    await this.loadData()
  },
  methods: {
    ...mapActions({
      fetchAppointments: 'appointments/fetchAppointments',
      fetchRooms: 'rooms/fetchRooms',
      setAppointmentFilters: 'appointments/setFilters',
      clearAppointmentFilters: 'appointments/clearFilters',
      approveAppointmentAction: 'appointments/approveAppointment',
      rejectAppointmentAction: 'appointments/rejectAppointment',
      showSuccess: 'notifications/showSuccess',
      showError: 'notifications/showError'
    }),
    async loadData() {
      try {
        await Promise.all([
          this.fetchAppointments(),
          this.fetchRooms()
        ])
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    },
    applyUrlFilters() {
      const { status, room, date } = this.$route.query
      if (status) this.filters.status = status
      if (room) this.filters.roomId = parseInt(room)
      if (date) {
        this.dateRange.start = date
        this.dateRange.end = date
      }
    },
    applyFilters() {
      const filters = { ...this.filters }
      
      if (this.dateRange.start || this.dateRange.end) {
        filters.dateRange = {
          start: this.dateRange.start,
          end: this.dateRange.end
        }
      }
      
      this.setAppointmentFilters(filters)
      this.currentPage = 1
    },
    clearFilters() {
      this.filters = {
        status: '',
        roomId: ''
      }
      this.dateRange = {
        start: '',
        end: ''
      }
      this.clearAppointmentFilters()
      this.currentPage = 1
    },
    async approveAppointment(appointmentId) {
      try {
        const result = await this.approveAppointmentAction(appointmentId)
        if (result.success) {
          this.showSuccess('Randevu başarıyla onaylandı')
        } else {
          this.showError(result.error || 'Randevu onaylanırken hata oluştu')
        }
      } catch (error) {
        this.showError('Randevu onaylanırken hata oluştu')
      }
    },
    showRejectModal(appointment) {
      this.selectedAppointment = appointment
      this.rejectReason = ''
      this.showRejectModalFlag = true
    },
    async rejectAppointment() {
      if (!this.rejectReason.trim()) {
        this.showError('Red nedeni gereklidir')
        return
      }

      try {
        const result = await this.rejectAppointmentAction({
          appointmentId: this.selectedAppointment.id,
          reason: this.rejectReason
        })
        
        if (result.success) {
          this.showSuccess('Randevu başarıyla reddedildi')
          this.showRejectModalFlag = false
        } else {
          this.showError(result.error || 'Randevu reddedilirken hata oluştu')
        }
      } catch (error) {
        this.showError('Randevu reddedilirken hata oluştu')
      }
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
    formatDate(date) {
      return moment(date).format('DD.MM.YYYY')
    }
  }
}
</script>

<style scoped lang="scss">
.page-header {
  margin-bottom: 2rem;
  
  h1 {
    color: #495057;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
}

.appointment-card {
  .card {
    border: 1px solid #e9ecef;
    transition: box-shadow 0.2s;
    
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  .text-sm {
    font-size: 0.875rem;
    color: #6c757d;
  }
}

.table {
  th {
    font-weight: 600;
    color: #495057;
    border-top: none;
    background-color: #f8f9fa;
  }
  
  td {
    vertical-align: middle;
  }
  
  tbody tr:hover {
    background-color: #f8f9fa;
  }
}

.btn-group {
  .btn {
    padding: 0.25rem 0.5rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    .d-flex {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 1rem;
    }
  }
}
</style>