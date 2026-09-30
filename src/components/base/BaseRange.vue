<template>
    <input
        type="range"
        :min="min"
        :max="max"
        v-model.number="value"
    />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 0
    },
    modelValue: {
        type: Number,
        default: 0
    }
});

const emit = defineEmits(['update:modelValue']);

const value = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
})
</script>