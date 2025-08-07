<template>
  <div id="app">
    <!-- Navigation Bar -->
    <NavBar v-if="isAuthenticated" />
    
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <b-spinner variant="primary" style="width: 3rem; height: 3rem;"></b-spinner>
      <p class="mt-2">Yükleniyor...</p>
    </div>
    
    <!-- Main Content -->
    <main :class="{ 'main-content': isAuthenticated, 'auth-content': !isAuthenticated }">
      <router-view/>
    </main>
    
    <!-- Notifications -->
    <NotificationList />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import NavBar from '@/components/common/NavBar.vue'
import NotificationList from '@/components/common/NotificationList.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    NotificationList
  },
  computed: {
    ...mapGetters({
      isAuthenticated: 'auth/isAuthenticated',
      isLoading: 'isLoading'
    })
  },
  async created() {
    // Check if user is authenticated on app start
    if (localStorage.getItem('token')) {
      await this.$store.dispatch('auth/checkAuth')
    }
    
    // Load initial data if authenticated
    if (this.isAuthenticated) {
      this.loadInitialData()
    }
  },
  methods: {
    async loadInitialData() {
      try {
        // Load rooms and user's appointments
        await Promise.all([
          this.$store.dispatch('rooms/fetchRooms'),
          this.$store.dispatch('appointments/fetchAppointments')
        ])
      } catch (error) {
        console.warn('Failed to load initial data:', error)
      }
    }
  }
}
</script>

<style lang="scss">
// Global styles
* {
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  margin-left: 0;
  padding: 20px;
  
  @media (min-width: 992px) {
    margin-left: 250px; // Space for sidebar
    padding: 30px;
  }
}

.auth-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  p {
    color: #6c757d;
    margin: 0;
  }
}

// Custom Bootstrap overrides
.btn {
  border-radius: 6px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  
  &.btn-sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  .card-header {
    background: #fff;
    border-bottom: 1px solid #e9ecef;
    border-radius: 10px 10px 0 0 !important;
    padding: 1rem 1.25rem;
    
    h5, h6 {
      margin: 0;
      color: #495057;
      font-weight: 600;
    }
  }
}

.form-control {
  border-radius: 6px;
  border: 1px solid #ced4da;
  
  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
}

.table {
  th {
    border-top: none;
    font-weight: 600;
    color: #495057;
    background-color: #f8f9fa;
  }
}

.badge {
  font-weight: 500;
  
  &.badge-pending {
    background-color: #ffc107;
    color: #212529;
  }
  
  &.badge-approved {
    background-color: #28a745;
  }
  
  &.badge-rejected {
    background-color: #dc3545;
  }
  
  &.badge-cancelled {
    background-color: #6c757d;
  }
}

// Responsive utilities
.d-mobile-block {
  @media (max-width: 767px) {
    display: block !important;
  }
}

.d-mobile-none {
  @media (max-width: 767px) {
    display: none !important;
  }
}

// Animation classes
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>
