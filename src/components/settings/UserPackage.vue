<template>
    <div class="flex space-x-2">
        <BaseInput
            :model-value="rect.width"
            label="Width"
            @update:modelValue="updateField('width', $event)"
        />
        <BaseInput
            :model-value="rect.depth"
            label="Depth"
            @update:modelValue="updateField('depth', $event)"
        />
        <BaseInput
            :model-value="rect.height"
            label="Height"
            @update:modelValue="updateField('height', $event)"
        />
        <button
            @click="emit('remove', index)"
            class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
            Remove
        </button>
    </div>
</template>

<script setup>
import BaseInput from '../base/BaseInput.vue';

const props = defineProps({
    rect: {
        type: Object,
        required: true
    },
    index: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(['update:rect', 'remove']);

const updateField = (field, value) => {
    emit('update:rect', {
        ...props.rect,
        [field]: Number(value)
    });
}
</script>