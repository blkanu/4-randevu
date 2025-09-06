<template>
  <div class="user-layout d-flex">
    <!-- Mobile overlay -->
    <div 
      v-if="sidebarVisible && isMobile" 
      class="sidebar-overlay" 
      @click="closeSidebar"
    ></div>
    
    <Sidebar 
      :class="{ 'show': sidebarVisible, 'sidebar': true }" 
    />
    
    <div class="main-content flex-grow-1">
      <Navbar :toggleVerticalMenuActive="toggleSidebar" />
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "@/components/common/Sidebar.vue";
import Navbar from "@/components/common/Navbar.vue";

export default {
  name: "UserLayout",
  components: {
    Sidebar,
    Navbar,
  },
  data() {
    return {
      sidebarVisible: window.innerWidth > 991,
    };
  },
  
  computed: {
    isMobile() {
      return window.innerWidth <= 991;
    }
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
    
    closeSidebar() {
      if (this.isMobile) {
        this.sidebarVisible = false;
      }
    },
    
    handleResize() {
      const isMobile = window.innerWidth <= 991;
      if (!isMobile && !this.sidebarVisible) {
        this.sidebarVisible = true;
      }
      if (isMobile && this.sidebarVisible) {
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
  position: relative;
}

.main-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  padding: 1.5rem;
  overflow-x: auto;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
  transition: opacity 0.3s ease;
}

/* Desktop styles */
@media (min-width: 992px) {
  .sidebar {
    position: relative;
    transform: none !important;
  }
}

/* Mobile styles */
@media (max-width: 991px) {
  .content-wrapper {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .content-wrapper {
    padding: 0.75rem;
  }
}
</style>
