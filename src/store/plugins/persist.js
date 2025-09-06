// src/store/plugins/persist.js

/**
 * Basit Vuex Persist plugin (localStorage).
 * paths: persist edilecek module namespace listesi (örn: ['auth','meetings',...])
 * key: localStorage anahtarı
 */
export default function createPersistPlugin({
  key = 'subu-app-state',
  paths = [],
} = {}) {
  const safeParse = (str) => {
    try { return JSON.parse(str); } catch { return {}; }
  };

  return (store) => {
    // 1) HYDRATE (init): kaydedilmiş veriyi modül state'lerine merge et
    const saved = safeParse(localStorage.getItem(key) || '{}');
    paths.forEach((ns) => {
      if (saved && saved[ns] && store.state[ns]) {
        // Derin klonlama yerine sığ bir merge yeterli (bizim state'ler düz)
        Object.assign(store.state[ns], saved[ns]);
      }
    });

    // 2) SUBSCRIBE (her mutation sonrası): seçilen modülleri kaydet
    store.subscribe((_mutation, state) => {
      const out = {};
      paths.forEach((ns) => {
        if (state[ns] !== undefined) out[ns] = state[ns];
      });
      try {
        localStorage.setItem(key, JSON.stringify(out));
      } catch (e) {
        // Storage dolu olabilir vs. Sessiz geçiyoruz.
        // console.warn('Persist failed:', e);
      }
    });
  };
}
