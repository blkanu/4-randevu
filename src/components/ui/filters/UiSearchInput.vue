<template>
  <b-input-group size="sm" class="input-elevated">
    <b-input-group-prepend is-text><b-icon icon="search"/></b-input-group-prepend>
    <b-form-input :value="value" @input="$emit('input',$event)" :placeholder="placeholder" />
    <b-input-group-append v-if="value">
      <b-button size="sm" variant="outline-secondary" @click="$emit('input','')">
        <b-icon icon="x"/>
      </b-button>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
export default {
  name: "UiSearchInput",
  props: {
    value: { type: String, default: "" }, // v-model
    placeholder: { type: String, default: "Ara…" },
  },
};
</script>
