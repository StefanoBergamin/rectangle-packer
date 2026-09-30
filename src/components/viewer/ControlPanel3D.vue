<template>
    <div class="flex items-center gap-2 mt-1">
        <div class="flex items-center">
            <BaseLabel label="X Rotation:" />
            <BaseRange
                :min="0"
                :max="90"
                v-model="modelValue.rotationX"
            />
        </div>
        <div class="flex items-center">
            <BaseLabel label="Z Rotation:" />
            <BaseRange
                :min="-180"
                :max="180"
                v-model="modelValue.rotationZ"
            />
        </div>
    </div>
</template>

<script setup>
import BaseLabel from '../base/BaseLabel.vue';
import BaseRange from '../base/BaseRange.vue';

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
});
</script>