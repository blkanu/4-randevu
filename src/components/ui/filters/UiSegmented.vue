// components/ui/SegmentedButtons.vue
<template>
<div class="segmented w-100 d-flex" :class="{'flex-wrap': wrap}">
<b-button v-for="opt in options" :key="opt.value" :size="size" class="flex-fill mb-2 mr-2"
variant="subu" :pressed="value===opt.value" @click="$emit('input', opt.value)">{{ opt.text }}</b-button>
<slot />
</div>
</template>
<script>
export default { name:'SegmentedButtons', props:{ value:[String,Number], options:{type:Array, default:()=>[]}, size:{type:String, default:'sm'}, wrap:{type:Boolean, default:false} } };
</script>
<style scoped>
.segmented .btn{border-color:#d9e6ef;background:#f8fbff;color:#003f91}
.segmented .btn.active, .segmented .btn[aria-pressed="true"]{background:#0093d1;border-color:#0093d1;color:#fff;box-shadow:0 0 0 .05rem rgba(0,147,209,.35)}
</style>