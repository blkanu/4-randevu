// src/router/index.js
import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/Login.vue";
import UserLayout from "@/layouts/UserLayout.vue";
import UserDashboard from "@/views/user/Dashboard.vue";
import UstMakamLayout from "@/layouts/UstMakamLayout.vue";
import UstMakamDashboard from "@/views/ustmakam/UstMakamDashboard.vue";
import SuperAdminLayout from "@/layouts/SuperAdminLayout.vue";
import SuperAdminDashboard from "@/views/superadmin/SuperAdminDashboard.vue";

import { ROLES } from "@/utils/constants";

Vue.use(VueRouter);

const routes = [
  { path: "/", name: "Login", component: Login },

  // USER alanı (Admin/SuperAdmin/UstMakam da erişebilir)
  {
    path: "/user",
    component: UserLayout,
    meta: { requiresAuth: true, roles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
    children: [
      {
        path: "dashboard",
        name: "UserDashboard",
        component: UserDashboard,
        meta: { requiresAuth: true, roles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
      },
      {
        path: "meetings",
        name: "MeetingList",
        component: () => import("@/views/user/MeetingList.vue"),
        meta: { requiresAuth: true, roles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
      },
      {
        path: "history",
        name: "MeetingHistory",
        component: () => import("@/views/user/History.vue"),
        meta: { requiresAuth: true, roles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
      },
      {
        path: "meeting-create",
        name: "MeetingCreate",
        component: () => import("@/views/user/MeetingCreate.vue"),
        meta: { requiresAuth: true, roles: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
      },
    ],
  },

  // ADMIN alanı
  {
    path: "/admin",
    component: () => import("@/layouts/AdminLayout.vue"),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
    children: [
      {
        path: "dashboard",
        name: "AdminDashboard",
        component: () => import("@/views/admin/AdminDashboard.vue"),
        meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
      },
      {
        path: "approvals",
        name: "AdminApprovals",
        component: () => import("@/views/admin/Approvals.vue"),
        meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
      },
      {
        path: "rooms",
        name: "AdminRooms",
        component: () => import("@/views/admin/RoomManagement.vue"),
        meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
      },
      {
        path: "adminmeetings",
        name: "AdminMeetings",
        component: () => import("@/views/admin/AdminMeetings.vue"),
        meta: { requiresAuth: true, roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.UST_MAKAM] },
      }
    ],
  },
  {
      path: "/ustmakam",
      component: UstMakamLayout,
      children: [
        { path: "", redirect: "dashboard" },
        { path: "dashboard", component: UstMakamDashboard },
        // sonraki adımda eklenecek:
        { path: "all", component: () => import("@/views/ustmakam/All.vue") },
        { path: "rooms", component: () => import("@/views/ustmakam/Rooms.vue") },
        // { path: "history", component: UstMakamHistory },
      ],
      meta: { requiresAuth: true, roles: [ROLES.UST_MAKAM, ROLES.ADMIN, ROLES.SUPER_ADMIN] },
    },

  { path: "/forbidden", name: "Forbidden", component: () => import("@/views/errors/Forbidden.vue") },
  { path: "*", name: "NotFound", component: () => import("@/views/errors/NotFound.vue") },

  {
    path: "/superadmin",
    component: SuperAdminLayout,
    children: [
      { path: "", redirect: "dashboard" },
      { path: "dashboard", component: SuperAdminDashboard },
      // { path: "users", component: () => import("@/views/superadmin/UserManagement.vue") },
      { path: "rooms", component: () => import("@/views/superadmin/SuperAdminRooms.vue") },
      { path: "special-days", component: () => import("@/views/superadmin/SuperAdminSpecialDays.vue") },
      { path: "users", component: () => import("@/views/superadmin/SuperAdminUsers.vue") },
      { path: "mail-settings", component: () => import("@/views/superadmin/SuperAdminMail.vue") },
    ],
    meta: { requiresAuth: true, roles: [ROLES.SUPER_ADMIN] },
  }
];

const router = new VueRouter({ mode: "history", routes });

// Global guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);
  const allowedRoles = to.matched
    .map((r) => r.meta?.roles)
    .filter(Boolean)
    .flat();

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (!requiresAuth) return next();

  if (!user) return next({ name: "Login" });

  // Eğer bu rota herhangi bir rol seti belirtiyorsa, kullanıcının rolü dahil mi?
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return next({ name: "Forbidden" });
  }

  next();
});

export default router;
