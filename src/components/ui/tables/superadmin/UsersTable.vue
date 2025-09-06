<template>
  <!-- STANDALONE: başlık + tablo + tümünü gör + dahili modal -->
  <b-card v-if="isStandalone" class="p-3 shadow-sm border-left-right-subu mb-4">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5 class="mb-0 text-subu font-weight-bold">
        {{ title }}
      </h5>
    </div>

    <b-table
      :items="rowsStandalone"
      :fields="fields"
      small
      responsive
      head-variant="light"
      stacked="md"
    >
      <template #cell(role)="row">
        <b-badge :variant="roleVariant(row.item.role)">
          {{ humanizeRole(row.item.role) }}
        </b-badge>
      </template>

      <template #cell(actions)="row">
        <b-button
          size="sm"
          variant="outline-primary"
          @click="openRoleModal(row.item.id)"
        >
          <b-icon icon="person-check" /> Rol Düzenle
        </b-button>
      </template>
    </b-table>

    <!-- SOL ALT: Tümünü Gör -->
    <div class="mt-2">
      <b-button size="sm" variant="link" class="p-0" @click="go(viewAllRoute)">
        Tümünü Gör →
      </b-button>
    </div>

    <!-- Rol Düzenle Modal (dahili) -->
    <b-modal :id="roleModalId" title="Rol Düzenle" @hide="resetForm" hide-footer>
      <b-form @submit.prevent="submitRole">
        <b-form-group label="Kullanıcı" label-for="role-user">
          <b-form-select id="role-user" v-model="form.userId" :options="userOptions" required />
        </b-form-group>

        <b-form-group label="Rol" label-for="role-role">
          <b-form-select id="role-role" v-model="form.role" :options="roleOptions" required />
        </b-form-group>

        <div class="text-right">
          <b-button variant="secondary" class="mr-2" @click="$bvModal.hide(roleModalId)">Vazgeç</b-button>
          <b-button variant="primary" type="submit">Kaydet</b-button>
        </div>
      </b-form>
    </b-modal>
  </b-card>

  <!-- EMBEDDED: yalın tablo + dahili modal, veri parent'tan gelir -->
  <div v-else>
    <b-table
      :items="rows"
      :fields="fields"
      small
      responsive
      head-variant="light"
      stacked="md"
    >
      <template #cell(role)="row">
        <b-badge :variant="roleVariant(row.item.role)">
          {{ humanizeRole(row.item.role) }}
        </b-badge>
      </template>

      <template #cell(actions)="row">
        <template v-if="allowEdit">
          <b-button
            size="sm"
            variant="outline-primary"
            @click="openRoleModal(row.item.id)"
          >
            <b-icon icon="person-check" /> Rol Düzenle
          </b-button>
        </template>
        <small v-else class="text-muted">—</small>
      </template>
    </b-table>

    <!-- Rol Düzenle Modal (dahili) -->
    <b-modal :id="roleModalId" title="Rol Düzenle" @hide="resetForm" hide-footer>
      <b-form @submit.prevent="submitRole">
        <b-form-group label="Kullanıcı" label-for="role-user">
          <b-form-select id="role-user" v-model="form.userId" :options="userOptions" required />
        </b-form-group>

        <b-form-group label="Rol" label-for="role-role">
          <b-form-select id="role-role" v-model="form.role" :options="roleOptions" required />
        </b-form-group>

        <div class="text-right">
          <b-button variant="secondary" class="mr-2" @click="$bvModal.hide(roleModalId)">Vazgeç</b-button>
          <b-button variant="primary" type="submit">Kaydet</b-button>
        </div>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "UsersTable",
  props: {
    /** 'standalone' | 'embedded' */
    mode: { type: String, default: "standalone" },
    /** embedded modda satırlar parent'tan gelir */
    rows: { type: Array, default: () => [] },
    /** standalone modda gösterilecek rollerin whitelisti */
    roles: { type: Array, default: () => ["SuperAdmin", "UstMakam", "Admin"] },
    /** standalone modda maksimum satır */
    limit: { type: Number, default: 5 },
    /** standalone modda sol alttaki link */
    viewAllRoute: { type: String, default: "/superadmin/users" },
    /** embedded modda düzenleme izni */
    allowEdit: { type: Boolean, default: true },
    /** standalone başlık metni */
    title: { type: String, default: "Yetkili Kullanıcılar" },
  },
  data() {
    return {
      fields: [
        { key: "name",  label: "Ad Soyad", sortable: true },
        { key: "email", label: "E-posta",  sortable: true },
        { key: "role",  label: "Rol",      sortable: true },
        { key: "actions", label: "İşlemler" },
      ],
      form: { userId: null, role: "User" },
      roleOptions: [
        { value: "SuperAdmin", text: "Süper Admin" },
        { value: "UstMakam",   text: "Üst Makam" },
        { value: "Admin",      text: "Salon Yöneticisi" },
        { value: "User",       text: "Kullanıcı" },
      ],
      roleModalId: "sa-role-modal",
    };
  },
  computed: {
    isStandalone() { return this.mode !== "embedded"; },
    ...mapGetters("users", ["allUsers"]),
    rowsStandalone() {
      if (!this.isStandalone) return [];
      const allow = new Set(this.roles);
      return (this.allUsers || [])
        .filter(u => allow.has(u.role))
        .slice(0, this.limit)
        .map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
    },
    userOptions() {
      return (this.allUsers || []).map(u => ({ value: u.id, text: `${u.name} (${u.email})` }));
    },
  },
  methods: {
    ...mapActions("users", ["updateUserRole"]),
    go(path) { if (this.isStandalone && path) this.$router.push(path); },
    humanizeRole(r) {
      return ({ SuperAdmin: "Süper Admin", UstMakam: "Üst Makam", Admin: "Salon Yöneticisi", User: "Kullanıcı" }[r] || r);
    },
    roleVariant(r) {
      return ({ SuperAdmin: "secondary", UstMakam: "dark", Admin: "primary", User: "info" }[r] || "secondary");
    },
    openRoleModal(userId) {
      const u = (this.allUsers || []).find(x => x.id === userId) || (this.allUsers || [])[0];
      this.form.userId = u?.id || null;
      this.form.role   = u?.role || "User";
      this.$bvModal.show(this.roleModalId);
    },
    resetForm() { this.form = { userId: null, role: "User" }; },
    async submitRole() {
      try {
        await this.updateUserRole({ userId: this.form.userId, role: this.form.role });
        this.$bvToast.toast("Rol güncellendi.", { title: "Başarılı", variant: "success", solid: true });
        this.$bvModal.hide(this.roleModalId);
      } catch (e) {
        this.$bvToast.toast(e?.message || "Rol güncellenemedi.", { title: "Hata", variant: "danger", solid: true });
      }
    },
  },
};
</script>

<style scoped>
/* standalone kart kenarlıkları için sayfa stillerine uyum */
.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }
</style>
