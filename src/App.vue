<template>
  <div id="app">
    <div v-if="isAuthenticated" class="app-layout">
      <!-- Navigation Header -->
      <nav class="navbar">
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">
            Randevu Sistemi
          </router-link>
        </div>
        
        <div class="navbar-nav">
          <router-link to="/" class="nav-link">Dashboard</router-link>
          <router-link to="/meetings" class="nav-link">Toplantılar</router-link>
          <router-link to="/calendar" class="nav-link">Takvim</router-link>
          
          <!-- Admin only links -->
          <router-link v-if="isAdmin" to="/rooms" class="nav-link">Salonlar</router-link>
          <router-link v-if="isAdmin" to="/special-days" class="nav-link">Özel Günler</router-link>
          <router-link v-if="isAdmin" to="/admin" class="nav-link">Yönetim</router-link>
          
          <!-- Super Admin only links -->
          <router-link v-if="isSuperAdmin" to="/users" class="nav-link">Kullanıcılar</router-link>
        </div>
        
        <div class="navbar-user">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-role">{{ getRoleText(user.role) }}</span>
          </div>
          <button @click="handleLogout" class="logout-btn">
            Çıkış
          </button>
        </div>
      </nav>
      
      <!-- Main Content -->
      <main class="main-content">
        <router-view/>
      </main>
    </div>
    
    <!-- Not authenticated - show login -->
    <router-view v-else />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters('auth', ['isAuthenticated', 'user', 'isAdmin', 'isSuperAdmin'])
  },
  
  async created() {
    // Check if user is already authenticated on app load
    await this.checkAuth()
  },
  
  methods: {
    ...mapActions('auth', ['logout', 'checkAuth']),
    
    getRoleText(role) {
      const roleMap = {
        'SuperAdmin': 'Süper Yönetici',
        'Admin': 'Yönetici',
        'UstMakam': 'Üst Makam',
        'User': 'Kullanıcı'
      }
      return roleMap[role] || role
    },
    
    async handleLogout() {
      await this.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  color: #333;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  .navbar-brand {
    .brand-link {
      font-size: 20px;
      font-weight: 700;
      color: #667eea;
      text-decoration: none;
      
      &:hover {
        text-decoration: none;
        color: #5a6fd8;
      }
    }
  }
  
  .navbar-nav {
    display: flex;
    gap: 30px;
    
    .nav-link {
      color: #666;
      text-decoration: none;
      font-weight: 500;
      padding: 10px 0;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease-in-out;
      
      &:hover {
        color: #667eea;
        text-decoration: none;
      }
      
      &.router-link-active {
        color: #667eea;
        border-bottom-color: #667eea;
      }
    }
  }
  
  .navbar-user {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .user-info {
      text-align: right;
      
      .user-name {
        display: block;
        font-weight: 600;
        color: #333;
        font-size: 14px;
      }
      
      .user-role {
        display: block;
        font-size: 12px;
        color: #666;
      }
    }
    
    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.15s ease-in-out;
      
      &:hover {
        background: #c82333;
      }
    }
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

// Responsive design
@media (max-width: 768px) {
  .navbar {
    padding: 0 15px;
    flex-wrap: wrap;
    height: auto;
    min-height: 70px;
    
    .navbar-nav {
      order: 3;
      width: 100%;
      justify-content: center;
      padding: 15px 0;
      border-top: 1px solid #e9ecef;
      gap: 20px;
      flex-wrap: wrap;
    }
    
    .navbar-user {
      .user-info {
        display: none;
      }
    }
  }
}

@media (max-width: 480px) {
  .navbar {
    .navbar-nav {
      gap: 15px;
      
      .nav-link {
        font-size: 14px;
      }
    }
  }
}

// Global utility classes
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mb-0 { margin-bottom: 0; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mb-5 { margin-bottom: 3rem; }

.mt-0 { margin-top: 0; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-5 { margin-top: 3rem; }

.d-flex { display: flex; }
.d-block { display: block; }
.d-none { display: none; }

.justify-content-between { justify-content: space-between; }
.justify-content-center { justify-content: center; }
.align-items-center { align-items: center; }
</style>
