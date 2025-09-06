<template>
  <div>
    <b-table
      :items="rows"
      :fields="computedFields"
      small
      responsive
      head-variant="light"
      stacked="md"
      :sticky-header="stickyHeader"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      @sort-changed="onSortChanged"
    >
      <!-- Salon adı + status dot -->
      <template #cell(name)="row">
        <slot name="cell-name" v-bind="row">
          <div class="d-flex align-items-center">
            <span v-if="showStatusDot" class="room-dot" :class="roomDotClass(row.item.status)" />
            <span class="ml-2">{{ row.item.name }}</span>
          </div>
        </slot>
      </template>

      <!-- Kapasite -->
      <template #cell(capacity)="row">
        <slot name="cell-capacity" v-bind="row">
          <span class="text-monospace">{{ row.item.capacity }}</span>
        </slot>
      </template>

      <!-- Durum -->
      <template #cell(status)="row">
        <slot name="cell-status" v-bind="row">
          <b-badge :variant="statusVariant(row.item.status)">
            {{ statusText(row.item.status) }}
          </b-badge>
        </slot>
      </template>

      <!-- Yönetici -->
      <template v-if="showAdmin" #cell(admin)="row">
        <slot name="cell-admin" v-bind="row">
          {{ adminName(row.item.adminId) || '—' }}
        </slot>
      </template>

      <!-- İşlemler -->
      <template v-if="showActions" #cell(actions)="row">
        <slot name="cell-actions" v-bind="row">
          <div class="d-flex flex-wrap">
            <!-- SuperAdmin tarzı: durum set dropdown -->
            <b-dropdown
              v-if="actions.showManageDropdown"
              size="sm"
              variant="outline-secondary"
              class="mr-2 mb-2"
              text="Yönet"
            >
              <b-dropdown-item @click="$emit('set-status', row.item.id, ROOM_STATUS.AKTIF)">
                Aktif
              </b-dropdown-item>
              <b-dropdown-item @click="$emit('set-status', row.item.id, ROOM_STATUS.PASIF)">
                Pasif
              </b-dropdown-item>
              <b-dropdown-item @click="$emit('set-status', row.item.id, ROOM_STATUS.BAKIMDA)">
                Bakımda
              </b-dropdown-item>
              <b-dropdown-divider />
              <b-dropdown-item @click="$emit('cycle', row.item.id)">
                Durumu Döndür
              </b-dropdown-item>
            </b-dropdown>

            <!-- Sadece döndür (admin/üst makam) -->
            <b-button
              v-if="actions.showCycle && !actions.showManageDropdown"
              size="sm"
              :variant="cycleButtonVariant(row.item.status)"
              class="mr-2 mb-2"
              @click="$emit('cycle', row.item.id)"
            >
              <b-icon :icon="cycleButtonIcon(row.item.status)" class="mr-1" />
              {{ cycleButtonText(row.item.status) }}
            </b-button>

            <b-button
              v-if="actions.showEdit"
              size="sm"
              variant="outline-primary"
              class="mr-2 mb-2"
              @click="onEditClick(row.item)"
            >
              <b-icon icon="pencil" /> Düzenle
            </b-button>

            <b-button
              v-if="actions.showDelete"
              size="sm"
              variant="outline-danger"
              class="mb-2"
              @click="$emit('delete', row.item)"
            >
              <b-icon icon="trash" /> Sil
            </b-button>
          </div>
        </slot>
      </template>
    </b-table>

    <!-- Inline Edit Modal (opsiyonel) -->
    <b-modal
      v-if="enableInlineEditModal"
      id="rooms-table-edit"
      v-model="editModal.show"
      title="Salon Düzenle"
      size="md"
      @hide="resetInlineEdit"
      hide-footer
    >
      <b-form id="roomsTableEditForm" @submit.prevent="submitInlineEdit">
        <b-form-group label="Salon Adı" label-for="rt-roomName">
          <b-form-input id="rt-roomName" v-model.trim="editModal.form.name" required />
        </b-form-group>

        <b-form-group label="Kapasite" label-for="rt-roomCap">
          <b-form-input id="rt-roomCap" type="number" min="0" v-model.number="editModal.form.capacity" required />
        </b-form-group>

        <b-form-group label="Durum" label-for="rt-roomStatus">
          <b-form-select
            id="rt-roomStatus"
            v-model="editModal.form.status"
            :options="editStatusOptions"
            required
          />
        </b-form-group>

        <b-form-group v-if="showAdmin" label="Salon Yöneticisi" label-for="rt-roomAdmin">
          <b-form-select
            id="rt-roomAdmin"
            v-model="editModal.form.adminId"
            :options="editAdminOptions"
          />
        </b-form-group>
      </b-form>

      <div class="text-right">
        <b-button variant="secondary" size="sm" class="mr-2" @click="editModal.show = false">Vazgeç</b-button>
        <b-button
          variant="primary"
          size="sm"
          form="roomsTableEditForm"
          type="submit"
          :disabled="!canSubmitInline"
        >
          Kaydet
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { ROOM_STATUS } from "@/utils/constants";

export default {
  name: "RoomsTable",
  props: {
    // [{ id, name, capacity, status, adminId }]
    rows: { type: Array, required: true },

    // kolon görünürlük
    showAdmin: { type: Boolean, default: true },
    showActions: { type: Boolean, default: true },
    showStatusDot: { type: Boolean, default: true },

    // aksiyonların kontrolü
    actions: {
      type: Object,
      default: () => ({
        showManageDropdown: true, // SuperAdmin
        showCycle: true,
        showEdit: true,
        showDelete: true,
      }),
    },

    // sıralama / sticky
    stickyHeader: { type: [Boolean, String], default: null },
    sortBy: { type: String, default: "name" },
    sortDesc: { type: Boolean, default: false },

    // admin adı çözücü (opsiyonel)
    adminNameFn: { type: Function, default: null },

    /**
     * Inline edit modal'ı etkinleştirir.
     * false (varsayılan): Düzenle butonu sadece "edit" olayı yayar (eski davranış).
     * true: Düzenle butonu RoomsTable içindeki modalı açar ve "edit-submit" olayı yayılır.
     */
    enableInlineEditModal: { type: Boolean, default: false },

    /**
     * Inline edit için seçenekler:
     * { statusOptions: [{value,text}], adminOptions: [{value,text}] }
     * Boş bırakılırsa yalnızca mevcut değerler korunur.
     */
    editFormConfig: {
      type: Object,
      default: () => ({ statusOptions: [], adminOptions: [] }),
    },
  },

  data() {
    return {
      ROOM_STATUS,
      editModal: {
        show: false,
        form: { id: null, name: "", capacity: 0, status: ROOM_STATUS.AKTIF, adminId: null },
      },
    };
  },

  computed: {
    computedFields() {
      const f = [
        { key: "name", label: "Salon", sortable: true },
        { key: "capacity", label: "Kapasite", sortable: true },
        { key: "status", label: "Durum", sortable: true },
      ];
      if (this.showAdmin) f.push({ key: "admin", label: "Yönetici" });
      if (this.showActions) f.push({ key: "actions", label: "İşlemler" });
      return f;
    },

    editStatusOptions() {
      // Dışarıdan gönderildiyse onu kullan; yoksa varsayılan üçlü
      if (Array.isArray(this.editFormConfig.statusOptions) && this.editFormConfig.statusOptions.length) {
        return this.editFormConfig.statusOptions;
      }
      return [
        { value: ROOM_STATUS.AKTIF, text: "Aktif" },
        { value: ROOM_STATUS.PASIF, text: "Pasif" },
        { value: ROOM_STATUS.BAKIMDA, text: "Bakımda" },
      ];
    },

    editAdminOptions() {
      if (Array.isArray(this.editFormConfig.adminOptions) && this.editFormConfig.adminOptions.length) {
        return this.editFormConfig.adminOptions;
      }
      // Varsayılan olarak sadece "Atanmadı" seçeneği
      return [{ value: null, text: "Atanmadı" }];
    },

    canSubmitInline() {
      const f = this.editModal.form || {};
      const okName = !!(f.name && String(f.name).trim());
      const okCap = f.capacity != null && f.capacity >= 0;
      const allowedStatuses = this.editStatusOptions.map(o => o.value);
      const okStatus = allowedStatuses.includes(f.status);
      return okName && okCap && okStatus;
    },
  },

  methods: {
    onSortChanged(ctx) {
      this.$emit("update:sortBy", ctx.sortBy);
      this.$emit("update:sortDesc", ctx.sortDesc);
    },

    // UI helpers
    adminName(id) {
      if (this.adminNameFn) return this.adminNameFn(id);
      return id == null ? null : String(id);
    },
    statusText(s) {
      return (
        {
          [ROOM_STATUS.AKTIF]: "Aktif",
          [ROOM_STATUS.PASIF]: "Pasif",
          [ROOM_STATUS.BAKIMDA]: "Bakımda",
        }[s] || s
      );
    },
    statusVariant(s) {
      return (
        {
          [ROOM_STATUS.AKTIF]: "success",
          [ROOM_STATUS.PASIF]: "secondary",
          [ROOM_STATUS.BAKIMDA]: "warning",
        }[s] || "secondary"
      );
    },
    roomDotClass(s) {
      return (
        {
          [ROOM_STATUS.AKTIF]: "room-dot--active",
          [ROOM_STATUS.PASIF]: "room-dot--passive",
          [ROOM_STATUS.BAKIMDA]: "room-dot--maintenance",
        }[s] || "room-dot--unknown"
      );
    },
    cycleButtonVariant(s) {
      return (
        {
          [ROOM_STATUS.AKTIF]: "secondary",
          [ROOM_STATUS.PASIF]: "warning",
          [ROOM_STATUS.BAKIMDA]: "success",
        }[s] || "secondary"
      );
    },
    cycleButtonIcon(s) {
      return (
        {
          [ROOM_STATUS.AKTIF]: "pause",
          [ROOM_STATUS.PASIF]: "tools",
          [ROOM_STATUS.BAKIMDA]: "play",
        }[s] || "arrow-repeat"
      );
    },
    cycleButtonText(s) {
      return (
        {
          [ROOM_STATUS.AKTIF]: "Pasifleştir",
          [ROOM_STATUS.PASIF]: "Bakımda Yap",
          [ROOM_STATUS.BAKIMDA]: "Aktifleştir",
        }[s] || "Değiştir"
      );
    },

    // --- Düzenle davranışı (geri uyumlu) ---
    onEditClick(item) {
      if (this.enableInlineEditModal) {
        this.openInlineEdit(item);
      } else {
        this.$emit("edit", item); // eski davranış
      }
    },

    openInlineEdit(item) {
      this.editModal.form = {
        id: item.id,
        name: item.name || "",
        capacity: Number.isFinite(item.capacity) ? item.capacity : 0,
        status: item.status || ROOM_STATUS.AKTIF,
        adminId: this.showAdmin ? (typeof item.adminId === "undefined" ? null : item.adminId) : null,
      };
      this.editModal.show = true;
    },
    resetInlineEdit() {
      this.editModal = { show: false, form: { id: null, name: "", capacity: 0, status: ROOM_STATUS.AKTIF, adminId: null } };
    },
    submitInlineEdit() {
      const payload = { ...this.editModal.form };
      // Parent'a callback ile haber ver; parent başarıda done(true) çağırırsa modal kapanır
      this.$emit("edit-submit", payload, (ok) => {
        if (ok) {
          this.editModal.show = false;
          this.resetInlineEdit();
        }
      });
    },
  },
};
</script>

<style scoped>
.room-dot { display:inline-block; width:.6rem; height:.6rem; border-radius:9999px; }
.room-dot--active { background:#28a745; }
.room-dot--passive { background:#6c757d; }
.room-dot--maintenance { background:#f39c12; }
.room-dot--unknown { background:#adb5bd; }
</style>
