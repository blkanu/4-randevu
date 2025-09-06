<template>
  <div class="agenda-input">
    <!-- Gündem Ekleme Alanı -->
    <div class="d-flex mb-2">
      <b-form-input
        v-model="newAgenda"
        placeholder="Gündem maddesi girin..."
        @keyup.enter="addAgenda"
        class="mr-2"
      />
      <b-button :disabled="isAtMax" class="btn-subu" @click="addAgenda">
        Ekle
      </b-button>
    </div>

    <small class="text-muted d-block mb-3">
      {{ internalAgenda.length }} / {{ max }} {{ internalAgenda.length < min ? '(en az ' + min + ' madde)' : '' }}
    </small>

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
    value: { type: Array, default: () => [] },
    min: { type: Number, default: 1 },
    max: { type: Number, default: 10 },
  },
  data() {
    return { newAgenda: "", internalAgenda: [...this.value] };
  },
  computed: {
    isAtMax() { return this.internalAgenda.length >= this.max; },
  },
  watch: {
    value(newVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(this.internalAgenda)) {
        this.internalAgenda = [...newVal];
      }
    },
  },
  methods: {
    addAgenda() {
      const trimmed = (this.newAgenda || "").trim();
      if (!trimmed) return;
      if (this.isAtMax) {
        this.$bvToast && this.$bvToast.toast(`En fazla ${this.max} gündem maddesi ekleyebilirsiniz.`, {
          title: "Sınır", variant: "warning", solid: true,
        });
        return;
      }
      if (!this.internalAgenda.includes(trimmed)) {
        this.internalAgenda.push(trimmed);
        this.$emit("input", this.internalAgenda);
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

.btn-subu {
  background-color: #0093d1; /* SUBÜ kurumsal koyu mavi */
  color: #fff;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-weight: 500;
}



.btn-subu:disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}

</style>
