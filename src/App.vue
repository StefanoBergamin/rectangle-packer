<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <h1 class="text-2xl font-semibold mb-6 text-center">Rectangle Packer</h1>

        <SurfaceRectangle 
          class="mb-6" 
          v-model="baseArea"
          @update-base-area="updateBaseArea"
        />

        <UserPackages 
          class="mb-6"
          @update:max-height="maxRectangleHeight = $event" 
          @update:user-packages="userPackages = $event"
        />

        <button
          @click="startPacking"
          class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Pack Rectangles
        </button>

        <DesignViewer
          ref="designViewer"
          :base-area="baseArea"
          :user-packages="userPackages"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import SurfaceRectangle from './components/settings/SurfaceRectangle.vue';
import UserPackages from './components/settings/UserPackages.vue';
import DesignViewer from './components/viewer/DesignViewer.vue';

const userPackages = ref({});
const maxRectangleHeight = ref(0);
const designViewer = ref(null);

const baseArea = computed(() => {
  return {
    width: 120,
    depth: 80,
    height: maxRectangleHeight.value
  }
});

const updateBaseArea = (values) => {
  baseArea.value = values;
}

const startPacking = () => {
  designViewer.value.startPackingProcess();
}
</script>