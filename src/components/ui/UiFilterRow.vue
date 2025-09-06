<template>
  <b-row class="align-items-end no-gutters">
    <b-col v-if="$slots.left"   cols="12" lg="6" class="pr-md-2 mb-2 mb-md-0"><slot name="left"/></b-col>
    <b-col v-if="$slots.middle" cols="6"  lg="3" class="px-md-2 mb-2 mb-md-0"><slot name="middle"/></b-col>
    <b-col v-if="$slots.right"  cols="6"  lg="3" class="pl-md-2 mb-2 mb-md-0"><slot name="right"/></b-col>
  </b-row>
</template>

<script>
export default { name: "UiFilterRow" };
</script>

<style scoped lang="scss">
.no-gutters {
  margin-left: 0; margin-right: 0;
  > [class^="col-"], > [class*=" col-"] { padding-left: .25rem; padding-right: .25rem; }
}
.input-elevated {
  border-radius: 12px; overflow: hidden;
  .input-group-text { background: #f6f9fc; border: 1px solid #e6edf3; }
  .form-control, .custom-select { border: 1px solid #e6edf3; background: #fff; }
}
.filter-label { font-size: .8rem; color: #6b7280; margin-bottom: .25rem; }
</style>
