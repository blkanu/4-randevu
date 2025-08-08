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

      <b-form @submit.prevent="handleLogin">
        <b-form-group label="E-posta" label-for="emailInput">
          <b-form-input
            id="emailInput"
            v-model="email"
            type="email"
            required
            placeholder="mail@subu.edu.tr"
          ></b-form-input>
        </b-form-group>

        <b-form-group label="Şifre" label-for="passwordInput">
          <b-form-input
            id="passwordInput"
            v-model="password"
            type="password"
            required
            placeholder="Şifrenizi giriniz"
          ></b-form-input>
        </b-form-group>

        <!-- ENTER tuşu bilgisi -->
        <small class="text-muted d-block text-center mb-3">
          
        </small>

        <b-button
          :disabled="isLoading"
          variant="primary"
          block
          type="submit"
          class="mt-1"
          style="background-color: #0093D1; padding: 0.9rem; font-size:1.1rem; "
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
    };
  },
  methods: {
    ...mapActions('auth', ['login']),
    async handleLogin() {
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


</style>
