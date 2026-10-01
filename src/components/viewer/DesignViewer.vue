<template>
    <div v-if="packedRectangles.length > 0" class="mt-6">
        <!-- Header Component -->
        <div class="flex justify-between gap-1">
            <h2 class="text-xl font-semibold mb-2">Design</h2>
            <div>
                <button
                    @click="toggleView"
                    class="px-4 py-1 bg-gray-200 rounded"
                >
                    {{ is3DView ? 'Switch to 2D View' : 'Switch to 3D View' }}
                </button>
            </div>
        </div>

        <div class="hidden sm:flex space-x-4 mb-2">
            <ControlPanel3D v-if="is3DView" v-model="rotations" />
        </div>

        <div ref="resultContainer" class="w-full">
            <DesignCanvas
              :base-area="baseArea"
              :packed-rectangles="packedRectangles"
              :space-zoom="spaceZoom"
              :is3DView="is3DView"
              :rotations="rotations"
              :is-dragging="isDragging"
              @pointerdown="startDrag"
              @pointermove="drag"
              @pointerup="stopDrag"
              @pointercancel="stopDrag"
              @lostpointercapture="stopDrag"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import DesignCanvas from './DesignCanvas.vue';
import ControlPanel3D from './ControlPanel3D.vue';
import { packRectangles } from '../../utils/rectanglePacking';
import { useViewerRotation } from '../../composables/useViewerRotation';

const props = defineProps({
    baseArea: {
        type: Object,
        required: true
    },
    userPackages: {
        type: Array,
        default: [],
        required: true
    }
});

const packedRectangles = ref([]);
const unpackedRectangles = ref([]);
const is3DView = ref(false);
const spaceZoom = ref(1);
const resultContainer = ref(null);
const threeDZoomFactor = 0.65;

const {
  rotations,
  isDragging,
  startDrag,
  drag,
  stopDrag,
} = useViewerRotation({ is3DView });

const toggleView = async () => {
  is3DView.value = !is3DView.value;

  await nextTick();
  calculateZoom();
}

const startPackingProcess = async () => {
    const { packed, unpacked } = packRectangles(
      props.baseArea,
      props.userPackages,
    );

    packedRectangles.value = packed;
    unpackedRectangles.value = unpacked;

    await nextTick();
    calculateZoom();
}

defineExpose({
    startPackingProcess
});

const calculateZoom = () => {
  if (!resultContainer.value) {
    return;
  }

  const containerWidth = resultContainer.value.offsetWidth;
  const contentWidth = props.baseArea.width;
  const baseZoom = Math.min(5, containerWidth / contentWidth);

  spaceZoom.value = is3DView.value
    ? baseZoom * threeDZoomFactor
    : baseZoom;
}

onMounted(() => {
  window.addEventListener('resize', calculateZoom);
});

onUnmounted(() => {
  window.removeEventListener('resize', calculateZoom);
});
</script>