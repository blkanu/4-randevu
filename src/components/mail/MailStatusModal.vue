<template>
  <b-modal
    :id="modalId"
    title="📧 Mail Durumu & Test"
    size="lg"
    hide-footer
    centered
  >
    <div class="mail-modal">
      <b-row>
        <!-- Özet -->
        <b-col cols="12" md="6" class="mb-3 mb-md-0">
          <b-card class="shadow-sm summary-card border-left-subu">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <div>
                <div class="small text-muted">Sağlık</div>
                <b-badge :variant="statusVariant">{{ statusText }}</b-badge>
              </div>
              <div class="text-right">
                <div class="small text-muted">Sağlayıcı</div>
                <div class="font-weight-600">{{ provider }}</div>
              </div>
            </div>

            <div class="mb-2">
              <div class="small text-muted">Gönderici</div>
              <div class="font-weight-600">{{ from.name }} &lt;{{ from.email }}&gt;</div>
            </div>

            <div class="mb-2">
              <div class="small text-muted">Son Test</div>
              <div v-if="lastTest.at">
                <span :class="lastTest.status === 'success' ? 'text-success' : 'text-danger'">
                  {{ lastTest.status === 'success' ? 'Başarılı' : 'Hata' }}
                </span>
                <small class="text-muted"> — {{ formatDT(lastTest.at) }}</small>
                <div class="small text-muted">{{ lastTest.message }}</div>
              </div>
              <div v-else class="text-muted">Henüz test yapılmadı.</div>
            </div>

            <div class="d-flex">
              <div class="chip mr-2">
                <div class="chip-title">Kuyruk</div>
                <div class="chip-value">{{ queue.pending }}</div>
              </div>
              <div class="chip mr-2">
                <div class="chip-title">Başarısız</div>
                <div class="chip-value">{{ queue.failed }}</div>
              </div>
              <div class="chip">
                <div class="chip-title">24s Gönderim</div>
                <div class="chip-value">{{ queue.sent24h }}</div>
              </div>
            </div>

            <b-button
              size="sm"
              variant="outline-secondary"
              class="mt-3"
              @click="refresh"
              :disabled="loading"
            >
              <b-icon icon="arrow-clockwise" class="mr-1" /> Yenile
            </b-button>

            <b-alert show variant="light" class="mt-3 small">
              Bu yapılandırma <strong>ENV</strong> üzerinden yönetilir. Parola/API anahtarları
              arayüzde görüntülenmez.
            </b-alert>
          </b-card>
        </b-col>

        <!-- Test Formu -->
        <b-col cols="12" md="6">
          <b-card class="shadow-sm form-card">
            <h6 class="text-subu font-weight-bold mb-3">Test Maili Gönder</h6>
            <b-form @submit.prevent="onTest">
              <b-form-group label="Alıcı E-posta" label-for="testMailTo" label-size="sm">
                <b-form-input
                  id="testMailTo"
                  v-model.trim="form.to"
                  type="email"
                  required
                  placeholder="ornek@subu.edu.tr"
                />
              </b-form-group>

              <b-form-group label="Şablon" label-for="testTemplate" label-size="sm">
                <b-form-select
                  id="testTemplate"
                  v-model="form.template"
                  :options="templates"
                  required
                />
              </b-form-group>

              <div class="d-flex justify-content-end">
                <b-button
                  type="submit"
                  variant="subu"
                  :disabled="loading || !form.to || !form.template"
                >
                  <b-icon icon="send" class="mr-1" /> Test Gönder
                </b-button>
              </div>
            </b-form>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "MailStatusModal",
  props: {
    modalId: { type: String, default: "mail-status-modal" },
  },
  data() {
    return {
      loading: false,
      form: { to: "", template: "approved" },
      provider: "ENV/SMTP",
    };
  },
  computed: {
    ...mapGetters("mail", ["mailStatus", "mailFrom", "mailQueue", "lastTestInfo", "templates"]),
    from() { return this.mailFrom; },
    queue() { return this.mailQueue; },
    lastTest() { return this.lastTestInfo; },
    statusVariant() {
      return { OK: "success", DEGRADED: "warning", ERROR: "danger" }[this.mailStatus] || "secondary";
    },
    statusText() {
      return { OK: "Hazır", DEGRADED: "Kısmi", ERROR: "Hata" }[this.mailStatus] || this.mailStatus;
    },
  },
  methods: {
    ...mapActions("mail", ["sendTestMail", "fetchMailStatus"]),
    open() {
      this.refresh();
      this.$bvModal.show(this.modalId);
    },
    async refresh() {
      this.loading = true;
      try { await this.fetchMailStatus(); } finally { this.loading = false; }
    },
    async onTest() {
      try {
        this.loading = true;
        await this.sendTestMail({ to: this.form.to, template: this.form.template });
        this.$bvToast.toast("Test mail gönderildi.", {
          title: "Başarılı", variant: "success", solid: true,
        });
      } catch (e) {
        this.$bvToast.toast(e?.message || "Gönderim başarısız.", {
          title: "Hata", variant: "danger", solid: true,
        });
      } finally {
        this.loading = false;
      }
    },
    formatDT(iso) {
      const d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleString("tr-TR");
    },
  },
};
</script>

<style scoped lang="scss">
.mail-modal { font-family: "Poppins", sans-serif; }
.summary-card { border-radius: 14px; }
.form-card { border-radius: 14px; }
.border-left-subu { border-left: 5px solid #0093d1 !important; }
.text-subu { color: #002855; }

.chip {
  background: #f6f9fc;
  border: 1px solid #e6edf3;
  border-radius: 10px;
  padding: .5rem .75rem;
  text-align: center;
}
.chip-title { font-size: .75rem; color: #6b7280; }
.chip-value { font-weight: 600; font-size: 1rem; }
.btn-subu,
.btn-subu:hover { background-color: #0093d1; border-color: #0093d1; color: #fff; }
</style>
