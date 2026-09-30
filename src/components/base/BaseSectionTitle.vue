<template>
    <label class="block text-sm font-medium text-gray-700">
        {{ label }}
    </label>
</template>

<script setup>
const props = defineProps({
    label: {
        type: String,
        default: ''
    }
});
</script>