<template>
  <b-card
    class="text-white card-hover shadow h-100"
    :style="{ backgroundColor: bg, borderRadius: '20px', cursor: route ? 'pointer' : 'default' }"
    @click="$emit('navigate', route)"
  >
    <div class="d-flex align-items-center">
      <div class="icon-circle mr-3">
        <b-icon :icon="icon" variant="white" font-scale="1.6" />
      </div>
      <div>
        <h5 v-if="value !== null && value !== undefined" class="mb-1 font-weight-bold">{{ value }}</h5>
        <h5 v-else class="mb-1 font-weight-bold">{{ title }}</h5>
        <p class="mb-0">{{ value !== null && value !== undefined ? title : description }}</p>
      </div>
    </div>
  </b-card>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    /** Başlık (ör. "Onaylanan Toplantılar") */
    title: { type: String, required: true },
    /** Değer (ör. 12). Verilmezse kart "bilgilendirme kartı" gibi çalışır ve description kullanır */
    value: { type: [String, Number], default: null },
    /** Alt açıklama / description (User dashboard’taki kartlar için) */
    description: { type: String, default: '' },
    icon:  { type: String, required: true },
    bg:    { type: String, required: true },
    route: { type: [String, null], default: null }
  }
};
</script>

<style scoped>
.card-hover { transition: all .25s ease; }
.card-hover:hover { transform: translateY(-6px); box-shadow: 0 8px 20px rgba(0,0,0,.12); }
.icon-circle {
  background-color: rgba(255,255,255,.2);
  border-radius: 50%;
  padding: .6rem;
  display:flex; align-items:center; justify-content:center;
}
</style>
