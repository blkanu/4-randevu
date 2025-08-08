<template>
  <div class="navbar-container d-flex justify-content-between align-items-center px-3 py-2 bg-white shadow-sm">
    <!-- Menü Toggler (mobil için) -->
    <div class="d-xl-none">
      <b-button variant="link" class="p-0" @click="toggleVerticalMenuActive">
  <b-icon icon="list" font-scale="1.3" />
</b-button>

    </div>

    <!-- Başlık -->
    <div class="d-none d-md-block navbar-title mb-0" style="color: #005d8f;">
      Toplantı Randevu Sistemi
    </div>

    <!-- Kullanıcı Dropdown -->
    <b-navbar-nav class="align-items-center">
      <b-nav-item-dropdown
        right
        toggle-class="d-flex align-items-center dropdown-user-link"
        class="dropdown-user"
      >
        <!-- Açılır düğme -->
        <template #button-content>
          <div class="d-none d-sm-flex flex-column align-items-end mr-2">
            <span class="font-weight-bold" style="color: #002855;">{{ user.name }}</span>
            <small class="text-muted">{{ userRoleLabel }}</small>

          </div>
          <b-avatar
            size="40"
            variant="light"
            badge
            badge-variant="success"
            class="badge-minimal"
          >
            <b-icon icon="person-fill" />
          </b-avatar>
        </template>

        <!-- Dropdown içerik -->
        <b-dropdown-item @click="logout" class="d-flex align-items-center">
          <b-icon icon="box-arrow-right" class="mr-2" />
          <span>Çıkış Yap</span>
        </b-dropdown-item>
      </b-nav-item-dropdown>
    </b-navbar-nav>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Navbar",
  props: {
    toggleVerticalMenuActive: {
      type: Function,
      default: () => {},
    },
  },
  computed: {
    ...mapGetters("auth", ["user", "userRoleLabel"]),
  },



  methods: {
  ...mapActions('auth', {
    logoutAction: 'logout',
  }),
  logout() {
    this.logoutAction();           // Vuex'teki logout çağrılır
    this.$router.push('/');        // Ardından login sayfasına yönlendirilir
  },
}
};
</script>

<style scoped lang="scss">
.navbar-container {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  min-height: 60px;
}

.dropdown-user-link {
  cursor: pointer;
}

.badge-minimal {
  position: relative;
  top: 1px;
}
.navbar-title {
  color: #002855; // Ana SUBÜ lacivert tonu
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.3px;
}
</style>
