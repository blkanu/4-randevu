<template>
  <div class="user-management">
    <div class="page-header">
      <h1>Kullanıcı Yönetimi</h1>
      <button @click="showCreateModal = true" class="btn btn-primary">
        Yeni Kullanıcı Ekle
      </button>
    </div>
    
    <div class="users-table">
      <div class="table-header">
        <div class="table-row">
          <div class="table-cell">Kullanıcı</div>
          <div class="table-cell">E-posta</div>
          <div class="table-cell">Rol</div>
          <div class="table-cell">Durum</div>
          <div class="table-cell">İşlemler</div>
        </div>
      </div>
      
      <div class="table-body">
        <div v-for="user in allUsers" :key="user.id" class="table-row">
          <div class="table-cell">
            <div class="user-info">
              <h4>{{ user.name }}</h4>
              <p>{{ user.department }}</p>
            </div>
          </div>
          
          <div class="table-cell">{{ user.email }}</div>
          
          <div class="table-cell">
            <span class="role-badge" :class="getRoleClass(user.role)">
              {{ getRoleText(user.role) }}
            </span>
          </div>
          
          <div class="table-cell">
            <span class="status-badge" :class="user.isActive ? 'status-active' : 'status-inactive'">
              {{ user.isActive ? 'Aktif' : 'Pasif' }}
            </span>
          </div>
          
          <div class="table-cell">
            <div class="action-buttons">
              <button @click="editUser(user)" class="btn btn-sm btn-outline">
                Düzenle
              </button>
              <button
                @click="toggleUserStatus(user)"
                class="btn btn-sm"
                :class="user.isActive ? 'btn-warning' : 'btn-success'"
              >
                {{ user.isActive ? 'Pasif Yap' : 'Aktif Yap' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı' }}</h2>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <form @submit.prevent="saveUser" class="modal-body">
          <div class="form-group">
            <label for="userName">Ad Soyad *</label>
            <input
              id="userName"
              v-model="userForm.name"
              type="text"
              class="form-control"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="userEmail">E-posta *</label>
            <input
              id="userEmail"
              v-model="userForm.email"
              type="email"
              class="form-control"
              pattern=".*@subu\.edu\.tr$"
              title="E-posta @subu.edu.tr uzantılı olmalıdır"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="userRole">Rol *</label>
            <select id="userRole" v-model="userForm.role" class="form-control" required>
              <option value="User">Kullanıcı</option>
              <option value="Admin">Yönetici</option>
              <option value="UstMakam">Üst Makam</option>
              <option value="SuperAdmin">Süper Yönetici</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="userDepartment">Departman</label>
            <input
              id="userDepartment"
              v-model="userForm.department"
              type="text"
              class="form-control"
            />
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
  name: 'UserManagement',
  data() {
    return {
      showCreateModal: false,
      showEditModal: false,
      editingUser: null,
      loading: false,
      userForm: {
        name: '',
        email: '',
        role: 'User',
        department: ''
      }
    }
  },
  
  computed: {
    ...mapGetters('users', ['allUsers'])
  },
  
  async created() {
    await this.fetchUsers()
  },
  
  methods: {
    ...mapActions('users', ['fetchUsers', 'createUser', 'updateUser', 'toggleUserStatus']),
    
    getRoleText(role) {
      const roleMap = {
        'SuperAdmin': 'Süper Yönetici',
        'Admin': 'Yönetici',
        'UstMakam': 'Üst Makam',
        'User': 'Kullanıcı'
      }
      return roleMap[role] || role
    },
    
    getRoleClass(role) {
      return {
        'role-superadmin': role === 'SuperAdmin',
        'role-admin': role === 'Admin',
        'role-ustmakam': role === 'UstMakam',
        'role-user': role === 'User'
      }
    },
    
    editUser(user) {
      this.editingUser = user
      this.userForm = {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || ''
      }
      this.showEditModal = true
    },
    
    closeModal() {
      this.showCreateModal = false
      this.showEditModal = false
      this.editingUser = null
      this.resetForm()
    },
    
    resetForm() {
      this.userForm = {
        name: '',
        email: '',
        role: 'User',
        department: ''
      }
    },
    
    async saveUser() {
      this.loading = true
      
      try {
        if (this.showEditModal) {
          await this.updateUser({
            id: this.editingUser.id,
            updates: this.userForm
          })
        } else {
          await this.createUser(this.userForm)
        }
        
        this.closeModal()
      } catch (error) {
        alert('Kullanıcı kaydedilirken hata oluştu: ' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    async toggleUserStatus(user) {
      const action = user.isActive ? 'pasif' : 'aktif'
      
      if (confirm(`${user.name} kullanıcısını ${action} yapmak istediğinize emin misiniz?`)) {
        try {
          await this.toggleUserStatus(user)
        } catch (error) {
          alert('Kullanıcı durumu değiştirilirken hata oluştu')
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-management {
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

.users-table {
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
  grid-template-columns: 2fr 2fr 1fr 1fr 1.5fr;
  gap: 20px;
  align-items: center;
  padding: 20px;
}

.table-cell {
  .user-info {
    h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  }
}

.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.role-superadmin {
    background: #dc3545;
    color: white;
  }
  
  &.role-admin {
    background: #ffc107;
    color: #212529;
  }
  
  &.role-ustmakam {
    background: #17a2b8;
    color: white;
  }
  
  &.role-user {
    background: #6c757d;
    color: white;
  }
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.status-active {
    background: #d4edda;
    color: #155724;
  }
  
  &.status-inactive {
    background: #f8d7da;
    color: #721c24;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
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

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .action-buttons {
    margin-top: 10px;
  }
}
</style>