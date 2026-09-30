<template>
    <input
        v-model.number="value"
        type="number"
        :placeholder="label"
        class="input-field"
    />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    modelValue: {
        type: [String, Number],
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})
</script>

<style scoped>
.input-field {
  @apply block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
  focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500;
}
.input-field:disabled {
  @apply bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed
}
</style>