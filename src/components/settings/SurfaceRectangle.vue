<template>
    <div>
        <BaseSectionTitle label="Main Rectangle" />
        <div class="mt-1 flex space-x-2">
            <BaseInput
                v-model="modelValue.width"
                label="Width"
            />
            <BaseInput
                v-model="modelValue.depth"
                label="Depth"
            />
            <BaseInput
                v-model="modelValue.height"
                label="Height"
                disabled
            />
        </div>
    </div>
</template>

<script setup>
import BaseSectionTitle from '../base/BaseSectionTitle.vue';
import BaseInput from '../base/BaseInput.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});
</script>