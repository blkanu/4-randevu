<template>
  <div class="agenda-input">
    <!-- Gündem Ekleme Alanı -->
    <div class="d-flex mb-3">
      <b-form-input
        v-model="newAgenda"
        placeholder="Gündem maddesi girin..."
        @keyup.enter="addAgenda"
        class="mr-2"
      />
      <b-button variant="subu" @click="addAgenda">Ekle</b-button>
    </div>

    <!-- Gündem Listesi -->
    <ul class="list-group">
      <li
        v-for="(item, index) in internalAgenda"
        :key="index"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        {{ index + 1 }}. {{ item }}
        <b-button variant="danger" size="sm" @click="removeAgenda(index)">
          Sil
        </b-button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "AgendaInput",
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      newAgenda: "",
      internalAgenda: [...this.value], // Lokal kopya
    };
  },
  watch: {
    value(newVal) {
      // Üst bileşenden veri güncellenirse senkronize et
      if (JSON.stringify(newVal) !== JSON.stringify(this.internalAgenda)) {
        this.internalAgenda = [...newVal];
      }
    },
  },
  methods: {
    addAgenda() {
      const trimmed = this.newAgenda.trim();
      if (!trimmed) return;

      if (!this.internalAgenda.includes(trimmed)) {
        this.internalAgenda.push(trimmed);
        this.$emit("input", this.internalAgenda); // Güncel listeyi üst bileşene aktar
        this.newAgenda = "";
      }
    },
    removeAgenda(index) {
      this.internalAgenda.splice(index, 1);
      this.$emit("input", this.internalAgenda);
    },
  },
};
</script>

<style scoped>
.agenda-input {
  font-family: "Poppins", sans-serif;
}
</style>
