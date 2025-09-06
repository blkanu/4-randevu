<template>
  <b-input-group size="sm" class="input-elevated">
    <b-input-group-prepend is-text><b-icon icon="sort-down"/></b-input-group-prepend>
    <b-form-select :value="value" :options="options" class="select-ghost"
                   @input="$emit('input',$event)" />
  </b-input-group>
</template>

<script>
export default {
  name: "UiSortSelect",
  props: {
    value: { type: String, default: "" }, // v-model
    options: { type: Array, required: true },
  },
};
</script>
