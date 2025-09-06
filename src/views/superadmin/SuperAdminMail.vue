<template>
  <div class="mail-settings">
    <!-- Welcome -->
    <b-card class="welcome-card mb-3 shadow-sm d-flex align-items-center justify-content-between flex-wraps">
      <div class="mb-2">
        <h4 class="mb-0 text-subu font-weight-bold text-center"><b-icon icon="envelope"></b-icon> Mail Ayarları</h4>
        <small class="text-muted">SMTP (StartTLS) ile kurumsal e-posta gönderimi.</small>
      </div>
      <div class="d-flex align-items-center flex-wrap justify-content-center">
        <b-badge variant="info" class="mr-2">Güvenlik: StartTLS</b-badge>
        <small class="text-muted">Port önerisi: 587</small>
      </div>
    </b-card>

    <!-- Form Kartı -->
    <b-card class="p-3 shadow-sm border-left-right-subu">
      <b-form @submit.prevent="onSave" autocomplete="off">
        <b-row class="no-gutters">
          <!-- SMTP Sunucu -->
          <b-col cols="12" md="6" class="pr-md-2 mb-3">
            <label class="form-label">SMTP Sunucu</label>
            <b-input-group size="sm" class="input-elevated">
              <b-input-group-prepend is-text><b-icon icon="server" /></b-input-group-prepend>
              <b-form-input v-model.trim="form.SmtpServer" required placeholder="mail.subu.edu.tr" />
            </b-input-group>
          </b-col>

          <!-- Port -->
          <b-col cols="12" md="6" class="pl-md-2 mb-3">
            <label class="form-label">Port</label>
            <b-form-input size="sm" type="number" v-model.number="form.Port" min="1" max="65535" required />
          </b-col>

          <!-- Gönderici Adı -->
          <b-col cols="12" md="6" class="pr-md-2 mb-3">
            <label class="form-label">Gönderici Adı</label>
            <b-form-input size="sm" v-model.trim="form.SenderName" placeholder="SUBÜ Toplantı Sistemi" />
          </b-col>

          <!-- Gönderici E-Posta -->
          <b-col cols="12" md="6" class="pl-md-2 mb-3">
            <label class="form-label">Gönderici E-Posta</label>
            <b-form-input size="sm" v-model.trim="form.SenderEmail" :state="emailState(form.SenderEmail)" required placeholder="noreply@subu.edu.tr" />
            <b-form-invalid-feedback>Lütfen geçerli bir e-posta girin.</b-form-invalid-feedback>
          </b-col>

          <!-- Kullanıcı Adı -->
          <b-col cols="12" md="6" class="pr-md-2 mb-3">
            <label class="form-label">SMTP Kullanıcı Adı</label>
            <b-input-group size="sm" class="input-elevated">
              <b-input-group-prepend is-text><b-icon icon="person" /></b-input-group-prepend>
              <b-form-input v-model.trim="form.Username" required placeholder="noreply@subu.edu.tr" />
            </b-input-group>
          </b-col>

          <!-- Şifre -->
          <b-col cols="12" md="6" class="pl-md-2 mb-3">
            <label class="form-label">SMTP Şifre</label>
            <b-input-group size="sm" class="input-elevated">
              <b-form-input :type="showPass ? 'text' : 'password'" v-model.trim="form.Password" required />
              <b-input-group-append>
                <b-button size="sm" variant="outline-secondary" @click="showPass = !showPass">
                  <b-icon :icon="showPass ? 'eye-slash' : 'eye'" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-col>
        </b-row>

        <hr class="my-3"/>

        <!-- Test bar -->
        <div class="d-flex flex-wrap align-items-end">
          <div class="mr-2 mb-2">
            <label class="form-label mb-1">Test Alıcısı</label>
            <b-form-input size="sm" v-model.trim="testTo" :state="emailState(testTo)" placeholder="ornek@subu.edu.tr" style="min-width:260px;" />
          </div>

          <b-button
            size="sm"
            class="mb-2 mr-2"
            variant="outline-primary"
            :disabled="!canTest || loading.test"
            @click="onTest"
          >
            <b-icon icon="chevron-double-right" class="mr-1" /> Test Mail Gönder
          </b-button>

          <b-button
            size="sm"
            class="mb-2"
            variant="subu"
            type="submit"
            :disabled="!canSave || loading.save"
          >
            <b-icon icon="save" class="mr-1" /> Kaydet
          </b-button>
        </div>

        <!-- Test sonucu -->
        <b-alert
          v-if="lastTest.at"
          :variant="lastTest.ok ? 'success' : 'danger'"
          show
          class="mt-3 mb-0"
        >
          <div class="d-flex justify-content-between align-items-center">
            <span>{{ lastTest.message }}</span>
            <small class="text-muted">{{ formatDT(lastTest.at) }}</small>
          </div>
        </b-alert>
      </b-form>
    </b-card>
  </div>
</template>

<script>
const ENDPOINTS = {
  get:  "/api/mail/settings",
  put:  "/api/mail/settings",
  test: "/api/mail/test",
};

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());

export default {
  name: "SuperAdminMailSettings",
  data() {
    return {
      form: {
        SmtpServer: "",
        Port: 587,
        SenderName: "SUBÜ Toplantı Sistemi",
        SenderEmail: "noreply@subu.edu.tr",
        Username: "",
        Password: "",
      },
      showPass: false,
      testTo: "",
      loading: { fetch: false, save: false, test: false },
      lastTest: { ok: null, message: "", at: "" },
    };
  },

  computed: {
    canSave() {
      const f = this.form;
      return !!(f.SmtpServer && f.Port && f.Username && f.Password && emailOk(f.SenderEmail));
    },
    canTest() {
      return this.canSave && emailOk(this.testTo);
    },
  },

  created() {
    this.fetchSettings();
  },

  methods: {
    emailState(v) { return !v || emailOk(v); },
    formatDT(iso) { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleString("tr-TR"); },

    async fetchSettings() {
      try {
        this.loading.fetch = true;
        const res = await fetch(ENDPOINTS.get, { method: "GET" });
        if (!res.ok) throw new Error("Ayarlar alınamadı.");
        const data = await res.json();
        // Model: EmailSettings => { SmtpServer, Port, SenderName, SenderEmail, Username, Password }
        this.form = {
          SmtpServer: data.SmtpServer || "",
          Port: Number(data.Port) || 587,
          SenderName: data.SenderName || "SUBÜ Toplantı Sistemi",
          SenderEmail: data.SenderEmail || "noreply@subu.edu.tr",
          Username: data.Username || "",
          Password: "", // güvenlik gerekçesiyle boş bırak
        };
      } catch (e) {
        this.$bvToast.toast(e?.message || "Ayarlar yüklenemedi.", {
          title: "Hata", variant: "danger", solid: true,
        });
      } finally {
        this.loading.fetch = false;
      }
    },

    async onSave() {
      if (!this.canSave) return;
      try {
        this.loading.save = true;
        // Not: Şifre güncelleme politikan varsa boşsa gönderme vb. kontrolleri ekleyebilirsin.
        const res = await fetch(ENDPOINTS.put, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.form),
        });
        if (!res.ok) throw new Error("Ayarlar kaydedilemedi.");
        this.$bvToast.toast("Ayarlar kaydedildi.", { title: "Başarılı", variant: "success", solid: true });
      } catch (e) {
        this.$bvToast.toast(e?.message || "Ayarlar kaydedilemedi.", { title: "Hata", variant: "danger", solid: true });
      } finally {
        this.loading.save = false;
      }
    },

    async onTest() {
      if (!this.canTest) return;
      try {
        this.loading.test = true;
        const res = await fetch(ENDPOINTS.test, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toEmail: this.testTo }),
        });
        const ok = res.ok;
        const at = new Date().toISOString();
        this.lastTest = {
          ok,
          message: ok ? "Test maili gönderildi (tetiklendi)." : "Test mail gönderimi başarısız.",
          at,
        };
        this.$bvToast.toast(this.lastTest.message, {
          title: ok ? "Gönderildi" : "Hata",
          variant: ok ? "success" : "danger",
          solid: true,
        });
      } catch (e) {
        const at = new Date().toISOString();
        this.lastTest = { ok: false, message: e?.message || "Test başarısız.", at };
        this.$bvToast.toast(this.lastTest.message, { title: "Hata", variant: "danger", solid: true });
      } finally {
        this.loading.test = false;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.mail-settings { font-family: "Poppins", sans-serif; }
.text-subu { color: #002855; }
.border-left-right-subu { border-left: 5px solid #0093d1 !important; border-right: 5px solid #0093d1 !important; }

/* Welcome */
.welcome-card {
  background-color: #f0f6fb;
  border-left: 5px solid #002855;
  border-radius: 15px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 6px rgba(0,0,0,.05);
}

/* Inputs */
.form-label { font-size: .85rem; color: #6b7280; margin-bottom: .25rem; }
.input-elevated {
  border-radius: 12px; overflow: hidden;
  .input-group-text { background: #f6f9fc; border: 1px solid #e6edf3; }
  .form-control, .custom-select { border: 1px solid #e6edf3; background: #fff; }
}

/* No-gutters helper */
.no-gutters {
  margin-left: 0; margin-right: 0;
  > [class^="col-"], > [class*=" col-"] { padding-left: .25rem; padding-right: .25rem; }
}

/* Brand button */
.btn-subu,
.btn-subu:hover { background-color: #0093d1; border-color: #0093d1; color: #fff; }
</style>
