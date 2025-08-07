import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

// Auth components
import Login from '@/views/auth/Login.vue'

// Dashboard components
import Dashboard from '@/views/Dashboard.vue'

// Appointment components
import AppointmentList from '@/views/appointments/AppointmentList.vue'
import AppointmentCreate from '@/views/appointments/AppointmentCreate.vue'
import AppointmentDetail from '@/views/appointments/AppointmentDetail.vue'

// Room components
import RoomList from '@/views/rooms/RoomList.vue'
import RoomCreate from '@/views/rooms/RoomCreate.vue'
import RoomEdit from '@/views/rooms/RoomEdit.vue'

// User components
import UserList from '@/views/users/UserList.vue'
import UserCreate from '@/views/users/UserCreate.vue'
import UserEdit from '@/views/users/UserEdit.vue'
import Profile from '@/views/Profile.vue'

// Calendar component
import Calendar from '@/views/Calendar.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { 
      requiresGuest: true,
      title: 'Giriş Yap'
    }
  },
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { 
      requiresAuth: true,
      title: 'Ana Sayfa'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { 
      requiresAuth: true,
      title: 'Profil'
    }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: Calendar,
    meta: { 
      requiresAuth: true,
      title: 'Takvim'
    }
  },
  // Appointment routes
  {
    path: '/appointments',
    name: 'appointments',
    component: AppointmentList,
    meta: { 
      requiresAuth: true,
      title: 'Randevular'
    }
  },
  {
    path: '/appointments/create',
    name: 'appointment-create',
    component: AppointmentCreate,
    meta: { 
      requiresAuth: true,
      title: 'Randevu Oluştur'
    }
  },
  {
    path: '/appointments/:id',
    name: 'appointment-detail',
    component: AppointmentDetail,
    meta: { 
      requiresAuth: true,
      title: 'Randevu Detayı'
    }
  },
  // Room routes
  {
    path: '/rooms',
    name: 'rooms',
    component: RoomList,
    meta: { 
      requiresAuth: true,
      title: 'Toplantı Salonları'
    }
  },
  {
    path: '/rooms/create',
    name: 'room-create',
    component: RoomCreate,
    meta: { 
      requiresAuth: true,
      requiresRole: ['SuperAdmin'],
      title: 'Salon Oluştur'
    }
  },
  {
    path: '/rooms/:id/edit',
    name: 'room-edit',
    component: RoomEdit,
    meta: { 
      requiresAuth: true,
      requiresRole: ['SuperAdmin'],
      title: 'Salon Düzenle'
    }
  },
  // User management routes
  {
    path: '/users',
    name: 'users',
    component: UserList,
    meta: { 
      requiresAuth: true,
      requiresRole: ['SuperAdmin', 'Admin'],
      title: 'Kullanıcı Yönetimi'
    }
  },
  {
    path: '/users/create',
    name: 'user-create',
    component: UserCreate,
    meta: { 
      requiresAuth: true,
      requiresRole: ['SuperAdmin', 'Admin'],
      title: 'Kullanıcı Oluştur'
    }
  },
  {
    path: '/users/:id/edit',
    name: 'user-edit',
    component: UserEdit,
    meta: { 
      requiresAuth: true,
      requiresRole: ['SuperAdmin', 'Admin'],
      title: 'Kullanıcı Düzenle'
    }
  },
  // 404 route
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - Randevu Sistemi` : 'Randevu Sistemi'
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresRole = to.matched.find(record => record.meta.requiresRole)?.meta.requiresRole
  
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const userRole = store.getters['auth/userRole']
  
  // Check authentication if token exists but user is not loaded
  if (!isAuthenticated && localStorage.getItem('token')) {
    try {
      await store.dispatch('auth/checkAuth')
    } catch (error) {
      console.warn('Auth check failed:', error)
    }
  }
  
  // Handle guest-only routes (like login)
  if (requiresGuest && store.getters['auth/isAuthenticated']) {
    return next('/')
  }
  
  // Handle auth-required routes
  if (requiresAuth && !store.getters['auth/isAuthenticated']) {
    return next('/login')
  }
  
  // Handle role-based access
  if (requiresRole && userRole && !requiresRole.includes(userRole)) {
    store.dispatch('notifications/showError', 'Bu sayfaya erişim yetkiniz yok')
    return next('/')
  }
  
  next()
})

export default router
