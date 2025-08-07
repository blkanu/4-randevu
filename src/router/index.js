import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/meetings',
    name: 'MeetingList',
    component: () => import('@/views/MeetingList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/meetings/new',
    name: 'CreateMeeting',
    component: () => import('@/views/MeetingForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/meetings/:id/edit',
    name: 'EditMeeting',
    component: () => import('@/views/MeetingForm.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/meetings/:id',
    name: 'MeetingDetails',
    component: () => import('@/views/MeetingDetails.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/calendar',
    name: 'MeetingCalendar',
    component: () => import('@/views/MeetingCalendar.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms',
    name: 'RoomManagement',
    component: () => import('@/views/RoomManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('@/views/UserManagement.vue'),
    meta: { requiresAuth: true, requiresSuperAdmin: true }
  },
  {
    path: '/special-days',
    name: 'SpecialDays',
    component: () => import('@/views/SpecialDays.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('@/views/AdminPanel.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
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
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const userRole = store.getters['auth/userRole']
  const isSuperAdmin = store.getters['auth/isSuperAdmin']
  const isAdmin = store.getters['auth/isAdmin']

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login')
      return
    }
  }

  // Check if route requires guest (not authenticated)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (isAuthenticated) {
      next('/')
      return
    }
  }

  // Check if route requires super admin
  if (to.matched.some(record => record.meta.requiresSuperAdmin)) {
    if (!isSuperAdmin) {
      next('/')
      return
    }
  }

  // Check if route requires admin (admin or super admin)
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAdmin) {
      next('/')
      return
    }
  }

  next()
})

export default router
