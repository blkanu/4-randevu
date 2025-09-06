// src/utils/constants.js
export const ROLES = Object.freeze({
  USER: 'User',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'SuperAdmin',
  UST_MAKAM: 'UstMakam',
});

export const MEETING_STATUS = Object.freeze({
  BEKLEMEDE: 'Beklemede',
  ONAYLANDI: 'Onaylandi',
  REDDEDILDI: 'Reddedildi',
  IPTAL: 'Iptal',
});
//  Görünen etiketler
export const MEETING_STATUS_LABELS = Object.freeze({
  [MEETING_STATUS.BEKLEMEDE]: 'Beklemede',
  [MEETING_STATUS.ONAYLANDI]: 'Onaylandı',
  [MEETING_STATUS.REDDEDILDI]: 'Reddedildi',
  [MEETING_STATUS.IPTAL]: 'İptal',
});

export const PRIORITY_LEVEL = Object.freeze({
  NORMAL: 'Normal',
  UST_MAKAM: 'UstMakam',
});

export const ROOM_STATUS = Object.freeze({
  AKTIF: 'Aktif',
  PASIF: 'Pasif',
  BAKIMDA: 'Bakımda',
});

export const ROLE_MENU_ITEMS = {
  User: [
    { label: "Ana Sayfa", path: "/user/dashboard", icon: "house" },
    { label: "Aktif Toplantılar", path: "/user/meetings", icon: "calendar3" },
    { label: "Geçmiş Toplantılar", path: "/user/history", icon: "clock-history" },
    { label: "Yeni Toplantı", path: "/user/meeting-create", icon: "plus-circle" },
  ],
  Admin: [
    { label: "Ana Sayfa", path: "/admin/dashboard", icon: "house" },

    { label: "Onay Bekleyenler", path: "/admin/approvals", icon: "hourglass-split" },
    { label: "Salon Yönetimi", path: "/admin/rooms", icon: "gear" },
    { label: "Toplantı Listesi", path: "/admin/adminmeetings", icon: "journal-text" },
    { label: "Yeni Toplantı", path: "/user/meeting-create", icon: "plus-circle" },
    { label: "Aktif Toplantılar", path: "/user/meetings", icon: "calendar3" },
    { label: "Geçmiş Toplantılar", path: "/user/history", icon: "clock-history" },

  ],
  SuperAdmin: [
    { label: "Ana Sayfa", path: "/superadmin/dashboard", icon: "house" },
    { label: "Kullanıcı Yönetimi", path: "/superadmin/users", icon: "people" },
    { label: "Salon Yönetimi", path: "/superadmin/rooms", icon: "building" },
    { label: "Mail Ayarları", path: "/superadmin/mail-settings", icon: "envelope" },
    { label: "Özel Günler", path: "/superadmin/special-days", icon: "calendar2-event" },
  ],
  UstMakam: [
    { label: "Ana Sayfa", path: "/ustmakam/dashboard", icon: "house" },
    { label: "Tüm Toplantılar", path: "/ustmakam/all", icon: "list-ul" },
    { label: "Geçmiş Toplantılar", path: "/user/history", icon: "clock-history" },
    { label: "Yeni Toplantı", path: "/user/meeting-create", icon: "plus-circle" },
    { label: "Salon Yönetimi", path: "/ustmakam/rooms", icon: "building" },
    { label: "Aktif Toplantılar", path: "/user/meetings", icon: "calendar3" }
  ],
};

export const USER_DASHBOARD_CARDS = [
  { title: "Aktif Toplantılar", icon: "calendar",       color: "#0093D1", route: "/user/meetings" },
  { title: "Geçmiş Toplantılar", icon: "clock-history", color: "#005d8f", route: "/user/history" },
  { title: "Yeni Toplantı",      icon: "plus-circle",   color: "#002855", route: "/user/meeting-create" }
];
