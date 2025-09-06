<template>
  <b-row class="mb-3">
    <b-col
      cols="6"
      md="3"
      v-for="c in items"
      :key="c.key"
      class="mb-3"
    >
      <b-card
        class="shadow-sm card-mini h-100"
        :style="{ borderLeft: '5px solid ' + (c.color || '#0093d1') }"
      >
        <div class="d-flex align-items-center">
          <div class="icon-circle mr-2">
            <b-icon :icon="c.icon || 'people'" />
          </div>
          <div>
            <div class="small text-muted">{{ c.title }}</div>
            <div class="h5 mb-0 font-weight-bold">{{ c.value }}</div>
          </div>
        </div>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: "SummaryCards",
  props: {
    items: {
      type: Array,
      required: true
    }
  }
};
</script>

<style scoped lang="scss">
.card-mini {
  border-radius: 14px;
}
.icon-circle {
  background: #f6f9fc;
  border: 1px solid #e6edf3;
  border-radius: 9999px;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
