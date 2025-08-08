// utils/constants.js

export const ROLE_MENU_ITEMS = {
  User: [
    { label: "Ana Sayfa", path: "/user/dashboard", icon: "house" },
    { label: "Aktif Toplantılar", path: "/user/meetings", icon: "calendar" },
    { label: "Geçmiş Toplantılar", path: "/user/history", icon: "clock-history" },
    { label: "Yeni Toplantı", path: "/user/meeting-create", icon: "plus-circle" },
  ],
  Admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: "speedometer" },
    { label: "Onay Bekleyenler", path: "/admin/approvals", icon: "check2-circle" },
    { label: "Salon Yönetimi", path: "/admin/rooms", icon: "gear" },
  ],
  SuperAdmin: [
    { label: "Dashboard", path: "/superadmin/dashboard", icon: "speedometer" },
    { label: "Kullanıcı Yönetimi", path: "/superadmin/users", icon: "people" },
    { label: "Salon Oluştur", path: "/superadmin/rooms/create", icon: "plus-square" },
    { label: "Mail Ayarları", path: "/superadmin/email-settings", icon: "envelope" },
  ],
  UstMakam: [
    { label: "Dashboard", path: "/ustmakam/dashboard", icon: "speedometer" },
    { label: "Tüm Toplantılar", path: "/ustmakam/all", icon: "calendar3" },
    { label: "Geçmiş Toplantılar", path: "/ustmakam/history", icon: "clock-history" },
  ],
};
// utils/constants.js

export const USER_DASHBOARD_CARDS = [
  {
    title: "Aktif Toplantılar",
    icon: "calendar",
    color: "#0093D1",
    route: "/user/meetings"
  },
  {
    title: "Geçmiş Toplantılar",
    icon: "clock-history",
    color: "#005d8f",
    route: "/user/history"
  },
  {
    title: "Yeni Toplantı",
    icon: "plus-circle",
    color: "#002855",
    route: "/user/meeting-create"
  }
];

