<template>
  <div class="user-layout d-flex">
    <Sidebar class="sidebar" v-show="sidebarVisible" />
    <div class="main-content flex-grow-1">
      <Navbar :toggleVerticalMenuActive="toggleSidebar" />
      <div class="p-3">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/common/Sidebar.vue";
import Navbar from "@/components/common/Navbar.vue";

export default {
  name: "SuperAdminLayout",
  components: {
    Sidebar,
    Navbar,
  },
  data() {
  return {
    sidebarVisible: window.innerWidth > 991, // mobilde false, masaüstü true
  };
},
mounted() {
  window.addEventListener("resize", this.handleResize);
},
beforeDestroy() {
  window.removeEventListener("resize", this.handleResize);
},
methods: {
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  },
  handleResize() {
    if (window.innerWidth > 991 && !this.sidebarVisible) {
      this.sidebarVisible = true;
    }
    if (window.innerWidth <= 991 && this.sidebarVisible) {
      this.sidebarVisible = false;
    }
  },
},

};
</script>

<style scoped>
.user-layout {
  min-height: 100vh;
  background-color: #f9f9f9;
}
/* Sidebar.vue içinde ya da global CSS'te */
.sidebar {
  width: 230px;         /* tüm layoutlarda aynı genişlik */
  flex-shrink: 0;       /* ekran daraldığında büzülmesin */
  background-color: #fff; /* arka plan sabit olsun */
  border-right: 1px solid #ddd; /* isteğe bağlı ayırıcı çizgi */
}

</style>
