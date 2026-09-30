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

        <div class="flex space-x-4 mb-2">
            <ControlPanel3D v-if="is3DView" v-model="rotations" />
        </div>

        <!-- Design Component -->
        <div ref="resultContainer" class="relative" :style="getResultContainerStyle()">
            <div
                class="relative main-rectangle"
                :style="getMainRectangleStyle()"
            >
                <div
                    v-for="(rect, index) in packedRectangles"
                    :key="index"
                    class="absolute rectangle-container"
                    :style="getBoxContainerStyle(rect)"
                >
                    <CubeObject v-if="is3DView" :style="getBoxStyle(rect, index)" />
                    <SquareObject v-else :style="{ backgroundColor: getRandomColor(index) }" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import ControlPanel3D from './ControlPanel3D.vue';
import SquareObject from './SquareObject.vue';
import CubeObject from './CubeObject.vue';

const props = defineProps({
    baseArea: {
        type: Object,
        required: true
    },
    userPackages: {
        type: Object,
        required: true
    }
});

const packedRectangles = ref([]);
const is3DView = ref(false);
const spaceZoom = ref(1);
const resultContainer = ref(null);
const rotations = ref({
    rotationX: 80,
    rotationZ: 0
});

const toggleView = () => {
  is3DView.value = !is3DView.value;
}

const startPackingProcess = async () => {
    const mainRect = { ...props.baseArea };

    const rects = props.userPackages
        .filter((r) => r.width && r.depth)
        .map((r, id) => ({
            id,
            width: r.width,
            depth: r.depth,
            height: r.height || 20, // Set default height if not specified
            area: r.width * r.depth
        }));

    const packed = improvedPackingAlgorithm(mainRect, rects);
    packedRectangles.value = packed;

    await nextTick();
    calculateZoom();
}

defineExpose({
    startPackingProcess
});


const improvedPackingAlgorithm = (mainRect, rects) => {
  let bestPacking = null
  let maxPackedCount = 0

  // Generate all possible orientation combinations
  const orientationCombinations = generateOrientationCombinations(rects.length)

  for (const combination of orientationCombinations) {
    const orientedRects = rects.map((rect, index) => ({
      ...rect,
      width: combination[index] ? rect.depth : rect.width,
      depth: combination[index] ? rect.width : rect.depth,
    }));

    const result = tryPackingCombination(mainRect, orientedRects);

    if (result.length > maxPackedCount) {
      maxPackedCount = result.length;
      bestPacking = result;
    }

    if (maxPackedCount === rects.length) break; // All rectangles packed, no need to continue
  }

  return bestPacking || [];
}

const generateOrientationCombinations = (count) => {
  const combinations = [];
  const max = Math.pow(2, count);

  for (let i = 0; i < max; i++) {
    combinations.push(
      i
        .toString(2)
        .padStart(count, '0')
        .split('')
        .map((x) => x === '1'),
    );
  }

  return combinations;
}

const tryPackingCombination = (mainRect, rects) => {
  const packed = []
  const spaces = [{ x: 0, y: 0, width: mainRect.width, depth: mainRect.depth }]

  rects.sort((a, b) => b.area - a.area)

  for (const rect of rects) {
    let bestFit = null;
    let bestSpace = null;

    for (const space of spaces) {
      if (rect.width <= space.width && rect.depth <= space.depth) {
        const remainingArea =
          (space.width - rect.width) * space.depth + (space.depth - rect.depth) * rect.width;

        if (!bestFit || remainingArea < bestFit.remainingArea) {
          bestFit = {
            ...rect,
            x: space.x,
            y: space.y,
            remainingArea,
          };
          bestSpace = space;
        }
      }
    }

    if (bestFit) {
      packed.push(bestFit);

      // Update available spaces
      const newSpaces = [];
      for (const space of spaces) {
        if (space === bestSpace) {
          if (space.width - bestFit.width > 0) {
            newSpaces.push({
              x: space.x + bestFit.width,
              y: space.y,
              width: space.width - bestFit.width,
              depth: bestFit.depth,
            });
          }
          if (space.depth - bestFit.depth > 0) {
            newSpaces.push({
              x: space.x,
              y: space.y + bestFit.depth,
              width: space.width,
              depth: space.depth - bestFit.depth,
            });
          }
        } else {
          newSpaces.push(space);
        }
      }
      spaces.length = 0;
      spaces.push(...newSpaces);
    } else {
      break; // If we can't pack a rectangle, stop trying with this combination
    }
  }

  return packed;
}

const getRandomColor = (index) => {
  const colors = [
    '#FF6B6B', // Bright red
    '#4ECDC4', // Light turquoise
    '#2D91D4', // Vibrant blue
    '#FFA07A', // Soft salmon
    '#A5D6A7', // Pastel green
    '#FFCC00', // Bright yellow
    '#9C27B0', // Deep purple
    '#FF8A80', // Bright pink
    '#3F51B5', // Dark blue
    '#DCE775', // Light lime green
  ];
  return colors[index % colors.length];
}

const calculateZoom = () => {
  if (resultContainer.value) {
    const containerWidth = resultContainer.value.offsetWidth;
    const contentWidth = props.baseArea.width;
    spaceZoom.value = Math.min(5, containerWidth / contentWidth);
  }
}

const getResultContainerStyle = () => {
  const style = {
    height: `${Math.max(props.baseArea.depth, props.baseArea.height) * 2 * spaceZoom.value}px`,
  };

  return style;
}

const getMainRectangleStyle = () => {
  const style = {
    width: `${props.baseArea.width * spaceZoom.value}px`,
    height: `${props.baseArea.depth * spaceZoom.value}px`,
  };

  if (is3DView.value) {
    style.position = 'absolute'
    style.bottom = 0
    style.transform = `perspective(2000px) rotateX(${rotations.value.rotationX}deg) rotateZ(${rotations.value.rotationZ}deg)`
    style.transformStyle = 'preserve-3d'
    style.transformOrigin = 'center center'
  }

  return style;
}

const getBoxContainerStyle = (rect) => {
  return {
    left: `${rect.x * spaceZoom.value}px`,
    top: `${rect.y * spaceZoom.value}px`,
    width: `${rect.width * spaceZoom.value}px`,
    height: `${rect.depth * spaceZoom.value}px`,
  }
}

const getBoxStyle = (rect, index) => {
  const baseColor = getRandomColor(index)

  return {
    '--cube-color-front': adjustColor(baseColor, -10),
    '--cube-color-back': adjustColor(baseColor, -30),
    '--cube-color-right': adjustColor(baseColor, -20),
    '--cube-color-left': adjustColor(baseColor, -40),
    '--cube-color-top': baseColor,
    '--cube-color-bottom': adjustColor(baseColor, -50),
    '--cube-width': `${rect.width * spaceZoom.value}px`,
    '--cube-height': `${rect.depth * spaceZoom.value}px`,
    '--cube-depth': `${rect.height * spaceZoom.value}px`,
  }
}

// Function to adjust color brightness
const adjustColor = (color, amount) => {
  const clamp = (val) => Math.min(255, Math.max(0, val));

  // Convert hex to RGB
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);

  // Adjust brightness
  r = clamp(r + amount);
  g = clamp(g + amount);
  b = clamp(b + amount);

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

onMounted(() => {
  window.addEventListener('resize', calculateZoom);
})
</script>

<style scoped>
.main-rectangle {
  background-image: linear-gradient(
    45deg,
    #eee 25%,
    transparent 25%,
    transparent 50%,
    #eee 50%,
    #eee 75%,
    transparent 75%,
    #fff
  );
  background-size: 30px 30px;
  position: relative;
  border: 1px solid #ccc;
  margin: 20px 0;
  transition: transform 0.5s ease;
}

.rectangle-container {
  position: absolute;
  transform-style: preserve-3d;
}
</style>