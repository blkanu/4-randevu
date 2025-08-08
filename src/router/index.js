// src/router/index.js

import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/views/Login.vue";
import UserLayout from "@/layouts/UserLayout.vue";
import UserDashboard from "@/views/user/Dashboard.vue";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/user",
    component: UserLayout,
    children: [
      {
        path: "dashboard",
        name: "UserDashboard",
        component: UserDashboard,
      },
      {
        path: "/user/meetings",
        name: "MeetingList",
        component: () => import("@/views/user/MeetingList.vue"),
        meta: { requiresAuth: true, role: "user" },
      },
      {
        path: "history",
        name: "History",
        component: () => import("@/views/user/History.vue"),
        meta: { requiresAuth: true, role: "user" },
      },
      {
        path: "meeting-create",
        name: "MeetingCreate",
        component: () => import("@/views/user/MeetingCreate.vue"),
        meta: { requiresAuth: true, role: "user" },
      },
    ],
  },
  

];




const router = new VueRouter({
  mode: "history",
  
  routes,
});


export default router;

