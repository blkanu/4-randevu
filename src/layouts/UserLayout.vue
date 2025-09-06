<template>
  <div class="user-layout d-flex">
    <Sidebar :class="['sidebar', { 'show': sidebarVisible }]" />
    <div class="main-content flex-grow-1">
      <Navbar :toggleVerticalMenuActive="toggleSidebar" />
      <div class="p-3">
        <router-view />
      </div>
    </div>
    
    <!-- Mobile overlay -->
    <div 
      v-if="sidebarVisible && isMobile" 
      class="sidebar-overlay" 
      @click="closeSidebar"
    ></div>
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
      isMobile: window.innerWidth <= 991,
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
    closeSidebar() {
      if (this.isMobile) {
        this.sidebarVisible = false;
      }
    },
    handleResize() {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 991;
      
      if (this.isMobile && !wasMobile) {
        // Just became mobile - hide sidebar
        this.sidebarVisible = false;
      } else if (!this.isMobile && wasMobile) {
        // Just became desktop - show sidebar
        this.sidebarVisible = true;
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

.sidebar {
  width: 230px;
  flex-shrink: 0;
  background-color: #fff;
  border-right: 1px solid #ddd;
  transition: transform 0.3s ease;
}

.main-content {
  min-width: 0; /* Prevents flex item from growing beyond container */
  overflow-x: auto;
}

/* Mobile responsive improvements */
@media (max-width: 991px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1050;
    transform: translateX(-100%);
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
    width: 100%;
  }
}

@media (min-width: 992px) {
  .sidebar {
    position: relative;
    transform: none;
  }
}

/* Content padding adjustments for different screen sizes */
.main-content .p-3 {
  padding: 1rem !important;
}

@media (min-width: 768px) {
  .main-content .p-3 {
    padding: 1.5rem !important;
  }
}

@media (min-width: 1200px) {
  .main-content .p-3 {
    padding: 2rem !important;
  }
}

/* Mobile sidebar overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  backdrop-filter: blur(2px);
}
</style>
