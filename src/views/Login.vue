<template>
<div class="login-page">
    <b-card
      class="shadow p-4"
      style="max-width: 500px; width: 100%; border-top: 5px solid #002855"
    >
      <div class="text-center mb-4">
        <img
          src="@/assets/TR-iki_renkli_yatay_logo.png"
          alt="SUBÜ Logo"
          width="240"
          class="mb-3"
        />
        <h4 class="font-weight-bold" style="color: #002855">
          Toplantı Randevu Sistemi
        </h4>
      </div>

      <b-form @submit.prevent="handleLogin" novalidate>
        <b-form-group label="E-posta" label-for="emailInput">
          <b-form-input
            id="emailInput"
            v-model="email"
            type="email"
            required
            placeholder="mail@subu.edu.tr"
            autocomplete="email"
            :state="emailState"
            @blur="validateEmail"
          ></b-form-input>
          <b-form-invalid-feedback v-if="emailState === false">
            Lütfen geçerli bir e-posta adresi giriniz.
          </b-form-invalid-feedback>
        </b-form-group>

        <b-form-group label="Şifre" label-for="passwordInput">
          <b-form-input
            id="passwordInput"
            v-model="password"
            type="password"
            required
            placeholder="Şifrenizi giriniz"
            autocomplete="current-password"
            :state="passwordState"
            @blur="validatePassword"
          ></b-form-input>
          <b-form-invalid-feedback v-if="passwordState === false">
            Şifre en az 6 karakter olmalıdır.
          </b-form-invalid-feedback>
        </b-form-group>

        <!-- Enter key info -->
        <small class="text-muted d-block text-center mb-3">
          Giriş yapmak için Enter tuşuna basabilirsiniz
        </small>

        <b-button
          :disabled="isLoading || !isFormValid"
          variant="primary"
          block
          type="submit"
          class="mt-1 login-btn"
        >
          <b-spinner
            v-if="isLoading"
            small
            type="border"
            class="mr-2"
            label="Giriş yapılıyor"
          ></b-spinner>
          <span v-else>Giriş Yap</span>
        </b-button>
      </b-form>

      <b-alert
        :show="!!loginError"
        variant="danger"
        class="mt-3"
        dismissible
        @dismissed="loginError = ''"
      >
        {{ loginError }}
      </b-alert>
    </b-card>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      loginError: '',
      isLoading: false,
      emailState: null,
      passwordState: null,
    };
  },
  
  computed: {
    isFormValid() {
      return this.email && this.password && this.emailState !== false && this.passwordState !== false;
    }
  },
  methods: {
    ...mapActions('auth', ['login']),
    
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email) {
        this.emailState = null;
      } else if (emailRegex.test(this.email)) {
        this.emailState = true;
      } else {
        this.emailState = false;
      }
    },
    
    validatePassword() {
      if (!this.password) {
        this.passwordState = null;
      } else if (this.password.length >= 6) {
        this.passwordState = true;
      } else {
        this.passwordState = false;
      }
    },
    
    async handleLogin() {
      this.validateEmail();
      this.validatePassword();
      
      if (!this.isFormValid) {
        this.loginError = 'Lütfen tüm alanları doğru şekilde doldurunuz.';
        return;
      }
      
      this.isLoading = true;
      this.loginError = '';
      
      try {
        const user = await this.login({
          email: this.email,
          password: this.password,
        });

        switch (user.role) {
          case 'Admin':
            this.$router.push('/admin/dashboard');
            break;
          case 'SuperAdmin':
            this.$router.push('/superadmin/dashboard');
            break;
          case 'UstMakam':
            this.$router.push('/ustmakam/dashboard');
            break;
          default:
            this.$router.push('/user/dashboard');
        }
      } catch (err) {
        this.loginError = err.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #0093D1, #002855);
  /* background-image: url("@/assets/background-pattern.svg");
  background-size: cover;
  background-position: center; */
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  height: 100dvh;
  padding: 1rem;
}

@media (max-width: 576px) {
  .login-page {
    padding-top: 7rem;
    align-items: flex-start;
  }
}

b-card {
  background-color: #ffffff;
  border-radius: 12px;
}

.login-card {
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.login-btn {
  background-color: #0093D1 !important;
  border-color: #0093D1 !important;
  padding: 0.9rem !important;
  font-size: 1.1rem !important;
  font-weight: 600;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.login-btn:hover:not(:disabled) {
  background-color: #007bb5 !important;
  border-color: #007bb5 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 147, 209, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form improvements */
.form-group label {
  font-weight: 600;
  color: #002855;
  margin-bottom: 0.5rem;
}

.form-control {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #0093D1;
  box-shadow: 0 0 0 0.2rem rgba(0, 147, 209, 0.25);
}

.form-control.is-valid {
  border-color: #28a745;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

/* Mobile optimizations */
@media (max-width: 576px) {
  .login-btn {
    padding: 0.8rem !important;
    font-size: 1rem !important;
  }
}
</style>
