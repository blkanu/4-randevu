<template>
  <div class="users-page">
    <!-- Welcome -->
    <b-card class="welcome-card mb-3 shadow-sm d-flex flex-column align-items-center text-center">
      <div class="mb-1">
        <h4 class="mb-0 text-subu font-weight-bold"><b-icon icon="people"></b-icon> Kullanıcılar</h4>
        <small class="text-muted">Ad, e-posta ve role göre arayın; sıralayın ve düzenleyin.</small>
      </div>
    </b-card>

    <!-- Rol Özet Kartları (SummaryCards ile) -->
    <SummaryCards :items="roleCounts" />

    <!-- Tablo + Filtreler -->
    <b-card class="p-3 shadow-sm border-left-right-subu">
      <!-- Filtre Çubuğu -->
      <b-row class="align-items-end no-gutters mb-3">
        <!-- Arama -->
        <b-col cols="12" xl="6" lg="6" md="6" class="pr-md-2 mb-2 mb-md-0">
          <label class="filter-label">Arama</label>
          <UiSearchInput v-model="q" placeholder="Ad veya e-posta ile ara…" />
        </b-col>

        <!-- Roller (çoklu) -->
        <b-col cols="6" xl="3" lg="3" md="3" class="px-md-2 mb-2 mb-md-0">
          <label class="filter-label d-block">Roller</label>
          <UiStatusMulti
            v-model="roleSet"
            :options="roleOptions"
            :placeholder="roleDropdownText"
            :selectClass="'select-ghost w-100'"
          />
        </b-col>

        <!-- Sıralama -->
        <b-col cols="6" xl="3" lg="3" md="3" class="pl-md-2">
          <label class="filter-label">Sıralama</label>
          <UiSortSelect
            v-model="sortKey"
            :options="sortOptions"
            :selectClass="'select-ghost w-100'"
          />
        </b-col>
      </b-row>

      <!-- Tablo -->
      <div v-if="paged.length === 0" class="text-muted text-center py-4">
        Kriterlere uyan kullanıcı bulunamadı.
      </div>

      <!-- UsersTable embedded: tablo + dahili rol modalı -->
      <UsersTable
        v-else
        mode="embedded"
        :rows="paged"
        :allow-edit="canEditRole"
      />

      <!-- Alt Bar -->
      <UiTableFooter
        :total-rows="filtered.length"
        :page.sync="page"
        :perPage.sync="perPage"
        :perPageOptions="perPageOptions"
        label="Kayıt"
        aria-label="Sayfa başına kayıt"
        size="sm"
        align="right"
        :showTotal="true"
      />
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import UiTableFooter from "@/components/ui/footer/UiTableFooter.vue";
import UiSearchInput from "@/components/ui/filters/UiSearchInput.vue";
import UiStatusMulti from "@/components/ui/filters/UiStatusMulti.vue";
import UiSortSelect from "@/components/ui/filters/UiSortSelect.vue";
import UsersTable from "@/components/ui/tables/superadmin/UsersTable.vue";
import SummaryCards from "@/components/ui/cards/SummaryCards.vue";

export default {
  name: "SuperAdminUsers",
  components: { UiTableFooter, UiSearchInput, UiStatusMulti, UiSortSelect, UsersTable, SummaryCards },
  data() {
    return {
      q: "",
      roleSet: [],                 // Çoklu rol filtresi
      sortKey: "nameAz",           // nameAz | nameZa | roleAz
      page: 1,
      perPage: 10,

      perPageOptions: [
        { value: 10, text: "10" },
        { value: 20, text: "20" },
        { value: 50, text: "50" },
      ],
    };
  },

  computed: {
    ...mapGetters("auth", ["user"]),
    ...mapGetters("users", ["allUsers"]),

    canEditRole() {
      return this.user?.role === "SuperAdmin";
    },

    roleOptions() {
      return [
        { value: "SuperAdmin", text: "Süper Admin" },
        { value: "UstMakam",   text: "Üst Makam" },
        { value: "Admin",      text: "Salon Yöneticisi" },
        { value: "User",       text: "Kullanıcı" },
      ];
    },

    roleDropdownText() {
      if (!this.roleSet.length) return "Tüm Roller";
      const map = Object.fromEntries(this.roleOptions.map(r => [r.value, r.text]));
      return this.roleSet.map(r => map[r] || r).join(", ");
    },

    // Özet sayacı (SummaryCards için)
    roleCounts() {
      const c = { SuperAdmin: 0, UstMakam: 0, Admin: 0, User: 0 };
      (this.allUsers || []).forEach(u => { if (c[u.role] !== undefined) c[u.role]++; });
      return [
        { key: "SuperAdmin", title: "Süper Admin",        value: c.SuperAdmin, icon: "shield-lock",  color: "#7f8c8d" },
        { key: "UstMakam",   title: "Üst Makam",          value: c.UstMakam,   icon: "briefcase",     color: "#2c3e50" },
        { key: "Admin",      title: "Salon Yöneticisi",   value: c.Admin,      icon: "person-badge",  color: "#0093d1" },
        { key: "User",       title: "Kullanıcı",          value: c.User,       icon: "people",        color: "#8e44ad" },
      ];
    },

    // Filtrelenmiş
    filtered() {
      const term = this.q.toLowerCase();
      return (this.allUsers || []).filter(u => {
        if (term) {
          const hay = `${u.name} ${u.email}`.toLowerCase();
          if (!hay.includes(term)) return false;
        }
        if (this.roleSet.length && !this.roleSet.includes(u.role)) return false;
        return true;
      });
    },

    // Sıralama
    sorted() {
      const list = [...this.filtered];
      if (this.sortKey === "nameAz") list.sort((a,b) => a.name.localeCompare(b.name, "tr"));
      if (this.sortKey === "nameZa") list.sort((a,b) => b.name.localeCompare(a.name, "tr"));
      if (this.sortKey === "roleAz") list.sort((a,b) => a.role.localeCompare(b.role, "tr"));
      return list;
    },

    // Sayfalama
    paged() {
      const start = (this.page - 1) * this.perPage;
      return this.sorted.slice(start, start + this.perPage).map(u => ({
        id: u.id, name: u.name, email: u.email, role: u.role,
      }));
    },
  },

  watch: {
    q() { this.page = 1; this._syncQuery(); },
    roleSet() { this.page = 1; this._syncQuery(); },
    sortKey() { this.page = 1; this._syncQuery(); },
    perPage() { this.page = 1; this._syncQuery(); },
    page() { this._syncQuery(false); }
  },

  created() {
    this._applyFromRoute();
  },

  methods: {
    resetFilters() {
      this.q = "";
      this.roleSet = [];
      this.sortKey = "nameAz";
      this.perPage = 10;
      this.page = 1;
    },

    // URL senkronizasyonu
    _applyFromRoute() {
      const q = this.$route.query;
      if (typeof q.q === "string") this.q = q.q;
      if (typeof q.sort === "string" && ["nameAz","nameZa","roleAz"].includes(q.sort)) this.sortKey = q.sort;
      if (typeof q.page === "string") this.page = Math.max(1, parseInt(q.page, 10) || 1);
      if (typeof q.per === "string") this.perPage = Math.max(1, parseInt(q.per, 10) || 10);
      if (q.role) {
        const arr = Array.isArray(q.role) ? q.role : String(q.role).split(",");
        const allowed = this.roleOptions.map(r => r.value);
        this.roleSet = arr.map(x => String(x).trim()).filter(x => allowed.includes(x));
      }
    },
    _syncQuery(includePage = true) {
      const q = {};
      if (this.q) q.q = this.q;
      if (this.roleSet.length) q.role = this.roleSet.join(",");
      if (this.sortKey !== "nameAz") q.sort = this.sortKey;
      if (includePage && this.page > 1) q.page = String(this.page);
      if (this.perPage !== 10) q.per = String(this.perPage);
      this.$router.replace({ query: q });
    },
  },
};
</script>

<style scoped lang="scss">
.users-page { font-family: "Poppins", sans-serif; }
.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }

/* welcome */
.welcome-card {
  background-color: #f0f6fb;
  border-left: 5px solid #002855;
  border-radius: 15px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

/* filtre girdileri */
.filter-label { font-size: .8rem; color: #6b7280; margin-bottom: .25rem; }
.select-ghost { width: 100%; }
.no-gutters {
  margin-left: 0; margin-right: 0;
  > [class^="col-"], > [class*=" col-"] { padding-left: .25rem; padding-right: .25rem; }
}
</style>
