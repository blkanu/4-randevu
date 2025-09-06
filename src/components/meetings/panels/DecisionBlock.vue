<template>
  <div class="mt-3">
    <h6 class="text-subu"><b-icon icon="pin-angle-fill" class="mr-1 text-danger" /> Toplantı Kararı:</h6>

    <div v-if="decisionObj">
      <p>
        {{ decisionObj.description }}
        <small class="text-muted">({{ formatDate(decisionObj.createdAt) }} tarihinde eklendi)</small>
      </p>
    </div>
    <p v-else class="text-muted font-italic">Henüz karar girilmemiş.</p>

    <div v-if="canEdit && !decisionTextExists" class="mt-2">
      <b-form @submit.prevent="$emit('save', localText)">
        <b-form-textarea v-model="localText" placeholder="Toplantı kararı giriniz..." rows="1" max-rows="5"
          class="decision-input modern-textarea" required />
        <b-button variant="subu" class="mt-2" size="sm" type="submit" :disabled="!localText.trim()">
          <b-icon icon="file-earmark-check-fill" class="mr-1" /> Kararı Kaydet
        </b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "DecisionBlock",
  props: {
    decisionObj: { type: Object, default: null },
    decisionTextExists: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    formatDate: { type: Function, required: true },
  },
  data(){ return { localText: "" }; }
};
</script>
<style scoped lang="scss">
.btn-subu {
  background-color: #0093d1 !important;
  border-color: #0093d1 !important;
  color: #fff !important;

  &:hover {
    background-color: darken(#0093d1, 5%) !important;
    border-color: darken(#0093d1, 5%) !important;
  }

  &:disabled {
    background-color: #a0cfe4 !important;
    border-color: #a0cfe4 !important;
    color: #fff !important;
  }
}

</style>
