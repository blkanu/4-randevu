<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <i class="fas fa-calendar-alt"></i>
        </div>
        <h2>Randevu Sistemi</h2>
        <p class="text-muted">Sakarya Üniversitesi Toplantı Salonu Rezervasyon Sistemi</p>
      </div>

      <b-form @submit.prevent="handleLogin" class="login-form">
        <!-- Email Input -->
        <b-form-group label="Email Adresi" label-for="email">
          <b-form-input
            id="email"
            v-model="$v.form.email.$model"
            type="email"
            placeholder="ornek@subu.edu.tr"
            :state="validateState('email')"
            size="lg"
          ></b-form-input>
          <b-form-invalid-feedback>
            <div v-if="!$v.form.email.required">Email adresi gereklidir</div>
            <div v-if="!$v.form.email.email">Geçerli bir email adresi giriniz</div>
            <div v-if="!$v.form.email.domain">Email adresi @subu.edu.tr uzantısı ile bitmelidir</div>
          </b-form-invalid-feedback>
        </b-form-group>

        <!-- Password Input -->
        <b-form-group label="Şifre" label-for="password">
          <b-input-group size="lg">
            <b-form-input
              id="password"
              v-model="$v.form.password.$model"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Şifrenizi giriniz"
              :state="validateState('password')"
            ></b-form-input>
            <b-input-group-append>
              <b-button
                variant="outline-secondary"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </b-button>
            </b-input-group-append>
          </b-input-group>
          <b-form-invalid-feedback>
            <div v-if="!$v.form.password.required">Şifre gereklidir</div>
            <div v-if="!$v.form.password.minLength">Şifre en az 6 karakter olmalıdır</div>
          </b-form-invalid-feedback>
        </b-form-group>

        <!-- Remember Me -->
        <b-form-group>
          <b-form-checkbox v-model="form.rememberMe" size="sm">
            Beni hatırla
          </b-form-checkbox>
        </b-form-group>

        <!-- Error Message -->
        <b-alert v-if="loginError" variant="danger" show dismissible @dismissed="clearLoginError">
          {{ loginError }}
        </b-alert>

        <!-- Submit Button -->
        <b-button
          type="submit"
          variant="primary"
          size="lg"
          block
          :disabled="isLoading || $v.form.$invalid"
          class="login-button"
        >
          <b-spinner v-if="isLoading" small class="me-2"></b-spinner>
          <i v-else class="fas fa-sign-in-alt me-2"></i>
          {{ isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </b-button>
      </b-form>

      <!-- Demo Users Info -->
      <div class="demo-info mt-4">
        <h6>Demo Kullanıcılar:</h6>
        <div class="demo-users">
          <div class="demo-user" @click="fillDemoUser('admin')">
            <strong>Admin:</strong> admin@subu.edu.tr / admin123
          </div>
          <div class="demo-user" @click="fillDemoUser('user')">
            <strong>Kullanıcı:</strong> user@subu.edu.tr / user123
          </div>
          <div class="demo-user" @click="fillDemoUser('ustmakam')">
            <strong>Üst Makam:</strong> ustmakam@subu.edu.tr / ustmakam123
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <small class="text-muted">
          © 2024 Sakarya Üniversitesi. Tüm hakları saklıdır.
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import { required, email, minLength } from 'vuelidate/lib/validators'
import { mapGetters, mapActions } from 'vuex'

// Custom validator for @subu.edu.tr domain
const subuDomain = (value) => {
  if (!value) return true
  return value.endsWith('@subu.edu.tr')
}

export default {
  name: 'Login',
  data() {
    return {
      form: {
        email: '',
        password: '',
        rememberMe: false
      },
      showPassword: false,
      isLoading: false
    }
  },
  validations: {
    form: {
      email: {
        required,
        email,
        domain: subuDomain
      },
      password: {
        required,
        minLength: minLength(6)
      }
    }
  },
  computed: {
    ...mapGetters({
      loginError: 'auth/loginError'
    })
  },
  methods: {
    ...mapActions({
      login: 'auth/login',
      clearLoginError: 'auth/clearLoginError'
    }),
    validateState(name) {
      const { $dirty, $error } = this.$v.form[name]
      return $dirty ? !$error : null
    },
    async handleLogin() {
      this.$v.form.$touch()
      if (this.$v.form.$invalid) {
        return
      }

      this.isLoading = true
      
      try {
        const result = await this.login({
          email: this.form.email,
          password: this.form.password,
          rememberMe: this.form.rememberMe
        })

        if (result.success) {
          // Redirect to dashboard
          this.$router.push(this.$route.query.redirect || '/')
        }
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        this.isLoading = false
      }
    },
    fillDemoUser(type) {
      const demoUsers = {
        admin: {
          email: 'admin@subu.edu.tr',
          password: 'admin123'
        },
        user: {
          email: 'user@subu.edu.tr', 
          password: 'user123'
        },
        ustmakam: {
          email: 'ustmakam@subu.edu.tr',
          password: 'ustmakam123'
        }
      }
      
      if (demoUsers[type]) {
        this.form.email = demoUsers[type].email
        this.form.password = demoUsers[type].password
        this.$v.form.$reset()
      }
    }
  },
  beforeDestroy() {
    this.clearLoginError()
  }
}
</script>

<style scoped lang="scss">
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
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .logo {
    font-size: 3rem;
    color: #007bff;
    margin-bottom: 15px;
  }
  
  h2 {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 0.9rem;
    margin-bottom: 0;
  }
}

.login-form {
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 8px;
  }
  
  .form-control {
    border-radius: 8px;
    border: 1px solid #e1e5e9;
    padding: 12px 16px;
    
    &:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
  }
}

.login-button {
  border-radius: 8px;
  padding: 12px;
  font-weight: 600;
  margin-top: 10px;
  background: linear-gradient(45deg, #007bff, #0056b3);
  border: none;
  
  &:hover:not(:disabled) {
    background: linear-gradient(45deg, #0056b3, #004085);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
  }
}

.demo-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  
  h6 {
    color: #495057;
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .demo-users {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .demo-user {
    background: white;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    border: 1px solid #e9ecef;
    transition: all 0.2s;
    
    &:hover {
      background: #e9ecef;
      border-color: #007bff;
    }
    
    strong {
      color: #007bff;
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 576px) {
  .login-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .login-header {
    .logo {
      font-size: 2.5rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
  }
  
  .demo-info {
    .demo-users {
      .demo-user {
        font-size: 0.8rem;
        padding: 6px 10px;
      }
    }
  }
}
</style>