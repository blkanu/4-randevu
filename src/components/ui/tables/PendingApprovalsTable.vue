<template>
  <b-table
    :items="rows"
    :fields="fields"
    responsive
    small
    head-variant="light"
    stacked="md"
  >
    <template #cell(status)="row">
      <b-badge :variant="statusColor(row.item.status)">
        {{ humanizeStatus(row.item.status) }}
      </b-badge>
    </template>

    <template #cell(actions)="row">
      <div class="d-flex flex-md-row flex-column">
        <!-- ONAYLA -->
        <b-button
          size="sm"
          variant="success"
          class="mr-md-2 mb-2 mb-md-0"
          :disabled="!canApprove(row.item)"
          v-b-tooltip.hover
          :title="approveDisabledReason(row.item)"
          @click="$emit('approve', row.item.id)"
        >
          <b-icon icon="check"></b-icon> Onayla
        </b-button>

        <!-- REDDET -->
        <b-button
          size="sm"
          :variant="canApprove(row.item) ? 'danger' : 'outline-danger'"
          class="mb-2 mb-md-0"
          @click="$emit('reject', { id: row.item.id, reason: autoRejectReason(row.item) })"
        >
          <b-icon icon="x"></b-icon>
          {{ canApprove(row.item) ? 'Reddet' : 'Oto Reddet' }}
        </b-button>
      </div>

      <div v-if="!canApprove(row.item)" class="text-muted small mt-1">
        {{ approveDisabledReason(row.item) }}
      </div>
    </template>
  </b-table>
</template>

<script>
import { ROOM_STATUS } from "@/utils/constants";

export default {
  name: "PendingApprovalsTable",
  props: {
    rows: { type: Array, required: true }, // [{id,title,owner,room,date,time,status,roomStatus,isPastOrStarted}]
  },
  computed: {
    fields() {
      return [
        { key: "title",  label: "Toplantı" },
        { key: "owner",  label: "Sahibi"   },
        { key: "room",   label: "Salon"    },
        { key: "date",   label: "Tarih"    },
        { key: "time",   label: "Saat"     },
        { key: "status", label: "Durum"    },
        { key: "actions",label: "İşlemler" },
      ];
    },
  },
  methods: {
    humanizeStatus(s) {
      const map = { Beklemede: "Beklemede", Onaylandi: "Onaylandı", Reddedildi: "Reddedildi", Iptal: "İptal", "İptal Edildi": "İptal" };
      return map[s] || s;
    },
    statusColor(s) {
      return { Onaylandi: "success", Reddedildi: "danger", Beklemede: "warning", Iptal: "secondary", "İptal Edildi": "secondary" }[s] || "secondary";
    },

    // --- Onay Kuralları: sayfanın mantığı korunur ---
    canApprove(rowItem) {
      const roomInactive = rowItem.roomStatus !== ROOM_STATUS.AKTIF;
      return !roomInactive && !rowItem.isPastOrStarted;
    },
    approveDisabledReason(rowItem) {
      if (rowItem.roomStatus !== ROOM_STATUS.AKTIF) return `Salon aktif değil (${rowItem.roomStatus}).`;
      if (rowItem.isPastOrStarted) return "Tarih/Saat geçmiş veya toplantı başlamış.";
      return "";
    },
    autoRejectReason(rowItem) {
      if (rowItem.roomStatus !== ROOM_STATUS.AKTIF) return `Salon durumu: ${rowItem.roomStatus}.`;
      if (rowItem.isPastOrStarted) return "Toplantı zamanı geçmiş/başlamış.";
      return "Uygun bulunmadı.";
    },
  },
};
</script>
