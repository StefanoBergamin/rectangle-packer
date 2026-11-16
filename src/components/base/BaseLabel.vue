<template>
    <label class="mr-2 text-sm text-nowrap">
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