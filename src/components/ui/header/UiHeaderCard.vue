<template>
  <b-card class="header-card mb-4 shadow-sm">
    <h4 class="mb-1 text-center text-subu font-weight-bold">
      <b-icon :icon="icon" class="mr-1" /> {{ title }}
    </h4>
    <span v-if="subtitle" class="text-header small d-block">{{ subtitle }}</span>
    <slot name="below-title"></slot>
    <slot /> <!-- filtre satırları vb. -->
  </b-card>
</template>

<script>
export default {
  name: "UiHeaderCard",
  props: {
    icon: { type: String, default: "" },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
  },
};
</script>
