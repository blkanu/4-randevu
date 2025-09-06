<template>
  <b-card class="meeting-card shadow-sm border-left-subu">
    <!-- Başlık + Rozetler -->
    <div class="d-flex align-items-start justify-content-between mb-3">
      <div class="flex-grow-1 mr-3">
        <h5 class="text-subu font-weight-bold mb-1">{{ meeting.title }}</h5>
        <small class="text-muted">
          <b-icon icon="calendar-event" class="mr-1" /> {{ meeting.date }}
          <span class="mx-2">•</span>
          <b-icon icon="clock" class="mr-1" /> {{ meeting.startTime }} - {{ meeting.endTime }}
        </small>
      </div>

      <div class="d-flex flex-column align-items-end">
        <!-- YALNIZ Onaylandi ise devam ediyor rozeti -->
        <b-badge
          v-if="display.showCountdown !== false && meeting.status === 'Onaylandi' && h.isOngoing(meeting)"
          variant="primary"
          class="mb-1"
        >
          <b-icon icon="play-fill" class="mr-1" /> Devam ediyor
        </b-badge>

        <!-- YALNIZ Onaylandi ise geri sayım -->
        <b-badge
          v-else-if="display.showCountdown !== false && meeting.status === 'Onaylandi' && h.countdownText(meeting)"
          variant="info"
          class="mb-1"
        >
          <b-icon icon="hourglass-split" class="mr-1" />
          {{ h.countdownText(meeting) }}
        </b-badge>

        <b-badge v-if="display.showStatusBadge !== false" :variant="h.statusColor(meeting.status)">
          {{ meeting.status }}
        </b-badge>
      </div>
    </div>

    <!-- Ana İçerik -->
    <div class="meeting-content">
      <div class="row no-gutters">
        <div class="col-12 mb-2">
          <p class="text-muted mb-2">
            <b-icon icon="chat-left-text" class="mr-1" />
            <strong>Gündem:</strong> {{ meeting.agenda || '-' }}
          </p>
        </div>
      </div>

      <div class="row no-gutters">
        <div class="col-md-6 mb-1">
          <p class="text-muted mb-1">
            <b-icon icon="geo-alt" class="mr-1" />
            Salon: {{ roomLabel }}
          </p>
        </div>

        <div class="col-md-6 mb-1">
          <p v-if="display.showOwner !== false" class="text-muted mb-1">
            <b-icon icon="person-fill" class="mr-1" /> Sahibi: {{ ownerLabel }}
          </p>
        </div>
      </div>

      <div class="row no-gutters">
        <div class="col-12">
          <p class="text-muted mb-2">
            <b-icon icon="people-fill" class="mr-1" />
            <template v-if="participantsMode==='count'">
              Katılımcı Sayısı: {{ participantsCount }}
            </template>
            <template v-else>
              Katılımcılar: {{ participantsNames || '-' }}
            </template>
          </p>
        </div>
      </div>
    </div>

    <!-- Salt-okuma gündem maddeleri -->
    <div v-if="Array.isArray(meeting.agendaItems) && meeting.agendaItems.length">
      <strong class="text-subu">
        <b-icon icon="list-ul" class="mr-1" /> Gündem Maddeleri:
      </strong>
      <ul class="mt-2 pl-3">
        <li v-for="(item, i) in meeting.agendaItems" :key="i">
          "{{ item.text }}"
          <small class="text-muted" v-if="item.userId">
            (Ekleyen: {{ h.getUserName(item.userId) }})
          </small>
        </li>
      </ul>
    </div>

    <!-- (Opsiyonel) Gündem Ekle -->
    <div v-if="features.addAgenda && can.addAgenda(meeting)" class="mt-3">
      <b-input-group>
        <b-form-input v-model="localAgenda" placeholder="Gündeme madde ekleyin..." />
        <b-input-group-append>
          <b-button variant="subu" @click="emitAddAgenda">Ekle</b-button>
        </b-input-group-append>
      </b-input-group>
    </div>

    <!-- (Opsiyonel) Aksiyonlar -->
    <div class="mt-3 d-flex align-items-center">
      <b-button
        v-if="features.ownerCancel && can.ownerCancel(meeting)"
        size="sm" variant="danger" class="mr-2"
        @click="$emit('owner-cancel', { meeting })"
      >
        <b-icon icon="x-circle" class="mr-1" /> Toplantıyı İptal Et
      </b-button>

      <b-button
        v-if="features.overrideCancel && can.overrideCancel(meeting)"
        size="sm" variant="danger"
        @click="$emit('override-cancel', { meeting })"
      >
        <b-icon icon="shield-exclamation" class="mr-1" /> Override İptal
      </b-button>

      <slot name="actions"></slot>
    </div>

    <slot name="extra"></slot>
  </b-card>
</template>

<script>
export default {
  name: 'MeetingCardBase',
  props: {
    meeting: { type: Object, required: true },
    display: {
      type: Object,
      default: () => ({
        participantsMode: 'names',
        showOwner: true,
        showCountdown: true,
        showStatusBadge: true,
      }),
    },
    features: {
      type: Object,
      default: () => ({
        addAgenda: false,
        ownerCancel: false,
        overrideCancel: false,
      }),
    },
    can: {
      type: Object,
      default: () => ({
        addAgenda: () => false,
        ownerCancel: () => false,
        overrideCancel: () => false,
      }),
    },
    helpers: { type: Object, default: () => ({}) },
  },
  data() {
    return { localAgenda: '' };
  },
  computed: {
    // BİRLEŞTİRİLMİŞ helper'lar (HATA DÜZELTİLDİ: template'te hep 'h' kullanılıyor)
    h() {
      const defaults = {
        getUserName: () => 'Bilinmeyen',
        getRoomName: () => 'Bilinmeyen Salon',
        isOngoing: (m) => {
          const now = new Date();
          const s = new Date(`${m.date}T${m.startTime}`);
          const e = new Date(`${m.date}T${m.endTime}`);
          return now >= s && now < e;
        },
        countdownText: (m) => {
          const now = new Date();
          const start = new Date(`${m.date}T${m.startTime}`);
          if (now >= start) return '';
          const mins = Math.round((start - now) / 60000);
          if (mins <= 0) return '';
          if (mins < 60) return `${mins} dk kaldı`;
          const h = Math.floor(mins / 60), r = mins % 60;
          return r ? `${h} sa ${r} dk kaldı` : `${h} saat kaldı`;
        },
        statusColor: (s) => ({
          Onaylandi: 'success',
          Reddedildi: 'danger',
          Beklemede: 'warning',
          Iptal: 'secondary',
          'İptal Edildi': 'secondary',
        }[s] || 'secondary'),
      };
      return { ...defaults, ...this.helpers };
    },
    participantsMode() {
      return (this.display && this.display.participantsMode) || 'names';
    },
    participantsCount() {
      const p = this.meeting.participants;
      if (Array.isArray(p)) return p.length;
      if (typeof p === 'number') return p;
      return 0;
    },
    participantsNames() {
      const p = this.meeting.participants;
      if (!Array.isArray(p) || p.length === 0) return '';
      return p.map(x => {
        if (typeof x === 'string' || typeof x === 'number') return this.h.getUserName(x);
        if (x && x.name) return x.name;
        if (x && x.id) return this.h.getUserName(x.id);
        return '';
      }).filter(Boolean).join(', ');
    },
    ownerLabel() {
      return (this.meeting.owner && this.meeting.owner.name)
        || this.meeting.ownerName
        || this.h.getUserName(this.meeting.ownerId)
        || 'Bilinmeyen';
    },
    roomLabel() {
      return this.meeting.roomName || this.h.getRoomName(this.meeting.roomId) || '-';
    },
  },
  methods: {
    emitAddAgenda() {
      const t = (this.localAgenda || '').trim();
      if (!t) return;
      this.$emit('add-agenda', { meetingId: this.meeting.id, text: t });
      this.localAgenda = '';
    }
  }
};
</script>

<style scoped lang="scss">
.border-left-subu {
  border-left: 5px solid #0093d1 !important;
}

.meeting-card { 
  border-radius: 14px; 
  transition: all .2s ease-in-out;
  border: 1px solid rgba(0, 147, 209, 0.1);
  overflow: hidden;
  
  &:hover { 
    transform: translateY(-3px); 
    box-shadow: 0 12px 28px rgba(0, 147, 209, 0.15);
    border-color: rgba(0, 147, 209, 0.3);
  }
}

.text-subu { 
  color: #002855; 
}

.btn-subu, .btn-subu:hover { 
  background-color: #0093d1; 
  border-color: #0093d1; 
  color: #fff; 
}

// Improve text readability and spacing
p.text-muted {
  line-height: 1.5;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// Better icon alignment
.b-icon {
  vertical-align: -0.125em;
}

// Enhance agenda items appearance
ul {
  background: rgba(0, 147, 209, 0.05);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin-bottom: 0;
  
  li {
    padding: 0.25rem 0;
    border-bottom: 1px solid rgba(0, 147, 209, 0.1);
    
    &:last-child {
      border-bottom: none;
    }
  }
}

// Badge styling improvements
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.6rem;
  border-radius: 6px;
}
</style>
