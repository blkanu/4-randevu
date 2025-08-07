<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Randevu Sistemi</h1>
        <p>Sakarya Uygulamalı Bilimler Üniversitesi</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">E-posta Adresi</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-control"
            placeholder="ornek@subu.edu.tr"
            required
            :class="{ 'is-invalid': errors.email }"
          />
          <div v-if="errors.email" class="invalid-feedback">
            {{ errors.email }}
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Şifre</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control"
            placeholder="Şifrenizi girin"
            required
            :class="{ 'is-invalid': errors.password }"
          />
          <div v-if="errors.password" class="invalid-feedback">
            {{ errors.password }}
          </div>
        </div>
        
        <div v-if="errors.general" class="alert alert-danger">
          {{ errors.general }}
        </div>
        
        <button
          type="submit"
          class="btn btn-primary btn-block"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>
      </form>
      
      <div class="login-footer">
        <p class="text-muted">
          Sadece @subu.edu.tr uzantılı e-posta adresleri ile giriş yapabilirsiniz.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      errors: {}
    }
  },
  methods: {
    ...mapActions('auth', ['login']),
    
    validateForm() {
      this.errors = {}
      
      // Email validation
      if (!this.email) {
        this.errors.email = 'E-posta adresi gereklidir'
      } else if (!this.email.includes('@subu.edu.tr')) {
        this.errors.email = 'Sadece @subu.edu.tr uzantılı e-posta adresleri kabul edilir'
      }
      
      // Password validation
      if (!this.password) {
        this.errors.password = 'Şifre gereklidir'
      } else if (this.password.length < 6) {
        this.errors.password = 'Şifre en az 6 karakter olmalıdır'
      }
      
      return Object.keys(this.errors).length === 0
    },
    
    async handleLogin() {
      if (!this.validateForm()) {
        return
      }
      
      this.loading = true
      this.errors = {}
      
      try {
        await this.login({
          email: this.email,
          password: this.password
        })
        
        this.$router.push('/')
      } catch (error) {
        this.errors.general = error.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-header {
  margin-bottom: 30px;
  
  h1 {
    color: #333;
    margin-bottom: 10px;
    font-size: 28px;
    font-weight: 700;
  }
  
  p {
    color: #666;
    margin: 0;
    font-size: 14px;
  }
}

.login-form {
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 5px;
    color: #333;
    font-weight: 600;
    font-size: 14px;
  }
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
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

.invalid-feedback {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
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

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  
  &.btn-primary {
    background-color: #667eea;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #5a6fd8;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  }
  
  &.btn-block {
    width: 100%;
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
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 30px;
  
  .text-muted {
    color: #6c757d;
    font-size: 12px;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style>