<template>
  <b-table
    :items="rows"
    :fields="computedFields"
    responsive
    small
    head-variant="light"
    stacked="md"
    :sticky-header="stickyHeader"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
  >
    <!-- Durum -->
    <template #cell(status)="row">
      <b-badge :variant="statusVariant(row.item.status)">
        {{ humanizeStatus(row.item.status) }}
      </b-badge>
    </template>

    <!-- Kalan Süre (opsiyonel) -->
    <template v-if="showCountdown" #cell(countdown)="row">
      <small class="text-muted">{{ row.item.countdown || '' }}</small>
    </template>

    <!-- Varsayılan işlemler (rol + izinlere göre) | Slot ile override edilebilir -->
    <template #cell(actions)="row">
      <slot name="actions" v-bind="row">
        <div class="d-flex flex-wrap align-items-center">
          <!-- Beklemede: Onayla / Reddet (başlamadıysa) -->
          <template v-if="showApproveReject(row.item)">
            <b-button
              size="sm"
              variant="success"
              class="mr-2 mb-2"
              :disabled="!canApproveReject(row.item)"
              :title="approveRejectTitle(row.item)"
              @click="$emit('approve', row.item.id)"
            >
              <b-icon icon="check" /> Onayla
            </b-button>

            <b-button
              size="sm"
              variant="warning"
              class="mr-2 mb-2"
              :disabled="!canApproveReject(row.item)"
              :title="approveRejectTitle(row.item)"
              @click="$emit('reject', row.item.id)"
            >
              <b-icon icon="slash" /> Reddet
            </b-button>
          </template>

          <!-- Onaylandı: İptal (başlamadıysa + izin varsa) -->
          <template v-else-if="showCancel(row.item)">
            <b-button
              size="sm"
              variant="danger"
              class="mb-2"
              :disabled="hasStarted(row.item)"
              :title="cancelTitle(row.item)"
              @click="emitCancel(row.item.id)"
            >
              <b-icon icon="x-circle" /> İptal
            </b-button>
          </template>

          <!-- Diğer durumlar -->
          <template v-else>
            <small class="text-muted mb-2">İşlem yok</small>
          </template>
        </div>
      </slot>
    </template>
  </b-table>
</template>

<script>
export default {
  name: "MeetingsTable",
  props: {
    /**
     * Satır modeli:
     * { id, title, owner, room, date, time("HH:MM - HH:MM"), status, countdown?, __raw? }
     */
    rows: { type: Array, required: true },

    /** Kolonlar */
    showActions:     { type: Boolean, default: true },
    showCountdown:   { type: Boolean, default: false },

    /** Tablo davranışı */
    stickyHeader: { type: [Boolean, String], default: null },
    sortBy:       { type: String, default: null },
    sortDesc:     { type: Boolean, default: false },

    /**
     * Rol + İzinler (sayfadaki kurallarla uyumlu)
     * role: 'UstMakam' | 'Admin' | 'User' | 'SuperAdmin'
     * permissions örn: ['MEETING_APPROVE', 'MEETING_OVERRIDE_CANCEL']
     */
    role: { type: String, default: 'User' },
    permissions: { type: Array, default: () => [] },

    /**
     * Sayfa bazında görünürlük kontrolü (rol mantığına ek filtre)
     * approveReject: true => Onayla/Reddet UI'ını gösterebilir
     * cancel: true => İptal UI'ını gösterebilir
     */
    actionConfig: {
      type: Object,
      default: () => ({ approveReject: true, cancel: true }),
    },
  },

  computed: {
    computedFields() {
      const f = [
        { key: "title",  label: "Toplantı", sortable: true },
        { key: "owner",  label: "Sahibi",   sortable: true },
        { key: "room",   label: "Salon",    sortable: true },
        { key: "date",   label: "Tarih",    sortable: true },
        { key: "time",   label: "Saat" },
        { key: "status", label: "Durum",    sortable: true },
      ];
      if (this.showCountdown) f.splice(5, 0, { key: "countdown", label: "Kalan Süre" });
      if (this.showActions)   f.push({ key: "actions",   label: "İşlemler" });
      return f;
    },
  },

  methods: {
    // --- Ortak görseller ---
    humanizeStatus(s) {
      const map = { Beklemede: "Beklemede", Onaylandi: "Onaylandı", Reddedildi: "Reddedildi", Iptal: "İptal", "İptal Edildi": "İptal" };
      return map[s] || s;
    },
    statusVariant(s) {
      return { Onaylandi: "success", Reddedildi: "danger", Beklemede: "warning", Iptal: "secondary", "İptal Edildi": "secondary" }[s] || "secondary";
    },

    // --- Zaman helper'ları ---
    parseStart(item) {
      // item.time: "HH:MM - HH:MM" bekleniyor
      const startStr = String(item.time || '').split(' - ')[0] || '00:00';
      return new Date(`${item.date}T${startStr}`);
    },
    hasStarted(item) {
      const now = new Date();
      return now >= this.parseStart(item);
    },

    // --- İzin/rol kontrolü ---
    hasPerm(p) { return Array.isArray(this.permissions) && this.permissions.includes(p); },
    canApproveReject(item) {
      // Beklemede + başlamamış + (UstMakam/Admin veya MEETING_APPROVE)
      const roleAllowed = ['UstMakam', 'Admin'].includes(this.role) || this.hasPerm('MEETING_APPROVE');
      return roleAllowed && item.status === 'Beklemede' && !this.hasStarted(item);
    },
    canCancelOverride(item) {
      // Onaylandı + başlamamış + (UstMakam veya MEETING_OVERRIDE_CANCEL)
      const roleAllowed = (this.role === 'UstMakam') || this.hasPerm('MEETING_OVERRIDE_CANCEL');
      return roleAllowed && item.status === 'Onaylandi' && !this.hasStarted(item);
    },

    // --- UI görünürlük (sayfa config + rol kuralları) ---
    showApproveReject(item) {
      return this.showActions && this.actionConfig.approveReject && this.canApproveReject(item);
    },
    showCancel(item) {
      return this.showActions && this.actionConfig.cancel && this.canCancelOverride(item);
    },

    // --- Tooltip'ler (metinler sayfalardakiyle aynı) ---
    approveRejectTitle(item) {
      return this.hasStarted(item)
        ? "Başlayan toplantılar için onay/red yapılamaz."
        : "Toplantıyı onaylayın veya reddedin";
    },
    cancelTitle(item) {
      if (item.status !== 'Onaylandi') return 'Sadece onaylı toplantılar iptal edilebilir.';
      if (this.hasStarted(item))       return 'Başlayan toplantılar iptal edilemez.';
      return 'Toplantıyı iptal et';
    },

    // --- Event köprüsü ---
    emitCancel(id) {
      this.$emit('cancel', id);          // genel
      this.$emit('override-cancel', id); // uyumluluk (ustmakam dashboard)
    },
  },
};
</script>
