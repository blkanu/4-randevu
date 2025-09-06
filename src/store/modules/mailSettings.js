// store/modules/mailSettings.js
// SMTP tabanlı kurumsal e-posta entegrasyonu için ayar store'u
// Not: Burada kalıcı saklama yok. Backend entegrasyonu eklendiğinde
// saveSettings / testSend aksiyonları API'ye bağlanacak şekilde güncellenebilir.

const DEFAULTS = () => ({
  enabled: true,
  settings: {
    host: "",
    port: 587,                       // STARTTLS için yaygın varsayılan
    secure: "STARTTLS",              // "STARTTLS" | "SSL_TLS" | "NONE"
    username: "",
    password: "",
    fromName: "SUBÜ Toplantı Sistemi",
    fromEmail: "noreply@subu.edu.tr",
  },
  lastTest: { ok: null, message: "", at: null },
  saving: false,
  testing: false,
});

const state = DEFAULTS();

const getters = {
  mailEnabled: (s) => s.enabled,
  smtpSettings: (s) => s.settings,
  isConfigured: (s) => {
    const { host, port, username, password, fromEmail } = s.settings || {};
    return Boolean(host && port && username && password && fromEmail);
  },
  lastTest: (s) => s.lastTest,
  saving: (s) => s.saving,
  testing: (s) => s.testing,
};

const mutations = {
  SET_ENABLED(s, v) { s.enabled = !!v; },
  SET_SETTINGS(s, payload) { s.settings = { ...s.settings, ...payload }; },
  SET_SAVING(s, v) { s.saving = !!v; },
  SET_TESTING(s, v) { s.testing = !!v; },
  SET_LAST_TEST(s, payload) { s.lastTest = payload || { ok: null, message: "", at: null }; },
  RESET_STATE(s) {
    const d = DEFAULTS();
    Object.keys(d).forEach(k => { s[k] = d[k]; });
  },
};

const actions = {
  setEnabled({ commit }, v) {
    commit("SET_ENABLED", v);
  },

  // Backend eklendiğinde bu aksiyon POST /api/mail/settings gibi bir endpoint’e bağlanabilir
  async saveSettings({ commit }, payload) {
    commit("SET_SAVING", true);
    try {
      // örnek fetch (yorumda bırakıldı)
      // await fetch("/api/mail/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      commit("SET_SETTINGS", payload);
      return true;
    } catch (e) {
      throw e;
    } finally {
      commit("SET_SAVING", false);
    }
  },

  // Backend eklendiğinde bu aksiyon POST /api/mail/test ile test maili atar
  async testSend({ state, commit }, { to }) {
    commit("SET_TESTING", true);
    try {
      // örnek fetch (yorumda)
      // const res = await fetch("/api/mail/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to, config: state.settings }) });
      // const data = await res.json();
      // const ok = res.ok && data?.ok;

      const ok = true; // mock
      const message = ok ? "Test maili başarıyla tetiklendi." : "Test başarısız.";
      const at = new Date().toISOString();
      commit("SET_LAST_TEST", { ok, message, at });
      if (!ok) throw new Error(message);
      return true;
    } catch (e) {
      const at = new Date().toISOString();
      commit("SET_LAST_TEST", { ok: false, message: e?.message || "Test başarısız.", at });
      throw e;
    } finally {
      commit("SET_TESTING", false);
    }
  },
};

export default { namespaced: true, state, getters, mutations, actions };
