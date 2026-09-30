<template>
    <div>
        <BaseSectionTitle label="Secondary Rectangles" />
        <div class="mt-1 grid gap-1">
            <div
                v-for="(rect, index) in secondaryRectangles" 
                :key="index"
            >
                <UserPackage
                    v-model:rect="secondaryRectangles[index]"
                    :index="index"
                    @remove="removeSecondaryRectangle"
                />
            </div>
        </div>
        <button
            @click="addSecondaryRectangle"
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Add Rectangle
        </button>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseSectionTitle from '../base/BaseSectionTitle.vue';
import UserPackage from './UserPackage.vue';

const emit = defineEmits(['update:maxHeight', 'update:userPackages']);

const secondaryRectangles = ref([{ width: '', depth: '', height: '' }]);

const addSecondaryRectangle = () => {
  secondaryRectangles.value.push({ width: '', depth: '', height: '' });
}

const removeSecondaryRectangle = (index) => {
  secondaryRectangles.value.splice(index, 1);
}

const maxHeight = computed(() => {
  // Find the highest height value among secondary rectangles
  const heights = secondaryRectangles.value
    .map(rect => rect.height)
    .filter(height => typeof height === 'number' && !isNaN(height));

  return heights.length > 0 ? Math.max(...heights) : 0; 
});

watch(maxHeight, (newValue) => {
    emit('update:maxHeight', newValue)
}, { immediate: true });

watch(secondaryRectangles, (newRects) => {
    emit('update:userPackages', newRects)
}, { immediate: true });
</script>