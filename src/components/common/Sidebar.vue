<template>
  <div class="sidebar shadow-sm">
    <div class="sidebar-header text-center py-3 border-bottom">
      <img src="@/assets/TR-iki_renkli_yatay_logo.png" alt="SUBÜ" width="160" />
    </div>

    <b-nav v-if="menuItems.length" vertical class="sidebar-menu py-3">
      <b-nav-item
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        exact
        class="sidebar-link"
        exact-active-class="active-link"
      >
        <b-icon :icon="item.icon" class="mr-2" />
        {{ item.label }}
      </b-nav-item>
    </b-nav>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { ROLE_MENU_ITEMS } from "@/utils/constants";

export default {
  name: "Sidebar",
  computed: {
    ...mapGetters("auth", ["user"]),
    menuItems() {
      const role = this.user && this.user.role ? this.user.role : null;
      return role && ROLE_MENU_ITEMS[role] ? ROLE_MENU_ITEMS[role] : [];
    },
  },
};
</script>


<style scoped lang="scss">
.sidebar {
  width: 240px;
  min-height: 100vh;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: transform 0.3s ease;
}

.sidebar-header {
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem;
}

.sidebar-menu .nav-link {
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  color: #333333;
  display: flex;
  align-items: center;
  border-radius: 8px;
  margin: 0 0.75rem 0.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.sidebar-link:hover {
  background-color: #f2f6fa;
  color: #002855;
  text-decoration: none;
  transform: translateX(2px);
}

.active-link {
  background-color: #e1f3fb !important;
  color: #002855 !important;
  font-weight: 600;
  border-left: 4px solid #0093d1;
  padding-left: calc(1.5rem - 4px);
  box-shadow: 0 2px 4px rgba(0, 147, 209, 0.1);
}

/* Mobile specific improvements */
@media (max-width: 991px) {
  .sidebar { 
    width: 100%; 
    min-height: auto;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
  
  .sidebar-header {
    padding: 1.5rem 1rem;
  }
  
  .sidebar-menu .nav-link {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

</style>
