<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">
      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <h1 class="text-2xl font-semibold mb-6 text-center">Rectangle Packer</h1>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700">Main Rectangle</label>
          <div class="mt-1 flex space-x-2">
            <input
              v-model.number="mainWidth"
              type="number"
              placeholder="Width"
              class="input-field"
            />
            <input
              v-model.number="mainHeight"
              type="number"
              placeholder="Height"
              class="input-field"
            />
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700">Secondary Rectangles</label>
          <div class="mt-1 grid gap-1">
            <div v-for="(rect, index) in secondaryRectangles" :key="index" class="flex space-x-2">
              <input
                v-model.number="rect.width"
                type="number"
                placeholder="Width"
                class="input-field"
              />
              <input
                v-model.number="rect.height"
                type="number"
                placeholder="Height"
                class="input-field"
              />
              <input
                v-model.number="rect.depth"
                type="number"
                placeholder="Depth"
                class="input-field"
              />
              <button
                @click="removeSecondaryRectangle(index)"
                class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
          <button
            @click="addSecondaryRectangle"
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Rectangle
          </button>
        </div>

        <button
          @click="startPackingProcess"
          class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Pack Rectangles
        </button>

        <div v-if="packedRectangles.length > 0" class="mt-6">
          <h2 class="text-xl font-semibold mb-2">Result</h2>
          <div class="flex space-x-4 mb-2">
            <button @click="toggleView" class="px-4 py-1 bg-gray-200 rounded">
              {{ is3DView ? 'Switch to 2D View' : 'Switch to 3D View' }}
            </button>
            <div v-if="is3DView" class="flex items-center space-x-4">
              <div class="flex items-center">
                <label class="mr-2 text-sm">X Rotation:</label>
                <input
                  type="range"
                  min="0"
                  max="90"
                  v-model.number="rotationX"
                  class="w-24"
                />
              </div>
              <div class="flex items-center">
                <label class="mr-2 text-sm">Y Rotation:</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  v-model.number="rotationY"
                  class="w-24"
                />
              </div>
            </div>
          </div>
          <div ref="resultContainer" class="overflow-auto">
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
                <div v-if="!is3DView" class="rectangle-2d" :style="{ backgroundColor: getRandomColor(index) }"></div>
                <div v-else class="cube" :style="getBoxStyle(rect, index)">
                  <div class="cube-face cube-face-front"></div>
                  <div class="cube-face cube-face-back"></div>
                  <div class="cube-face cube-face-right"></div>
                  <div class="cube-face cube-face-left"></div>
                  <div class="cube-face cube-face-top"></div>
                  <div class="cube-face cube-face-bottom"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const mainWidth = ref(120)
const mainHeight = ref(80)
const spaceZoom = ref(1)
const secondaryRectangles = ref([{ width: '', height: '', depth: '' }])
const packedRectangles = ref([])
const resultContainer = ref(null)
const is3DView = ref(false)
const rotationX = ref(80)
const rotationY = ref(0)

const addSecondaryRectangle = () => {
  secondaryRectangles.value.push({ width: '', height: '', depth: '' })
}

const removeSecondaryRectangle = (index) => {
  secondaryRectangles.value.splice(index, 1)
}

const toggleView = () => {
  is3DView.value = !is3DView.value
}

const startPackingProcess = async () => {
  const mainRect = { width: mainWidth.value, height: mainHeight.value }
  const rects = secondaryRectangles.value
    .filter((r) => r.width && r.height)
    .map((r, id) => ({
      id,
      width: r.width,
      height: r.height,
      depth: Math.min(r.depth || 20, 40), // Default depth if not specified, cap at 40 to avoid extending too far
      area: r.width * r.height
    }))

  const packed = improvedPackingAlgorithm(mainRect, rects)
  packedRectangles.value = packed

  await nextTick()
  calculateZoom()
}

const improvedPackingAlgorithm = (mainRect, rects) => {
  let bestPacking = null
  let maxPackedCount = 0

  // Generate all possible orientation combinations
  const orientationCombinations = generateOrientationCombinations(rects.length)

  for (const combination of orientationCombinations) {
    const orientedRects = rects.map((rect, index) => ({
      ...rect,
      width: combination[index] ? rect.height : rect.width,
      height: combination[index] ? rect.width : rect.height,
    }))

    const result = tryPackingCombination(mainRect, orientedRects)

    if (result.length > maxPackedCount) {
      maxPackedCount = result.length
      bestPacking = result
    }

    if (maxPackedCount === rects.length) break // All rectangles packed, no need to continue
  }

  return bestPacking || []
}

const generateOrientationCombinations = (count) => {
  const combinations = []
  const max = Math.pow(2, count)

  for (let i = 0; i < max; i++) {
    combinations.push(
      i
        .toString(2)
        .padStart(count, '0')
        .split('')
        .map((x) => x === '1'),
    )
  }

  return combinations
}

const tryPackingCombination = (mainRect, rects) => {
  const packed = []
  const spaces = [{ x: 0, y: 0, width: mainRect.width, height: mainRect.height }]

  rects.sort((a, b) => b.area - a.area)

  for (const rect of rects) {
    let bestFit = null
    let bestSpace = null

    for (const space of spaces) {
      if (rect.width <= space.width && rect.height <= space.height) {
        const remainingArea =
          (space.width - rect.width) * space.height + (space.height - rect.height) * rect.width

        if (!bestFit || remainingArea < bestFit.remainingArea) {
          bestFit = {
            ...rect,
            x: space.x,
            y: space.y,
            remainingArea,
          }
          bestSpace = space
        }
      }
    }

    if (bestFit) {
      packed.push(bestFit)

      // Update available spaces
      const newSpaces = []
      for (const space of spaces) {
        if (space === bestSpace) {
          if (space.width - bestFit.width > 0) {
            newSpaces.push({
              x: space.x + bestFit.width,
              y: space.y,
              width: space.width - bestFit.width,
              height: bestFit.height,
            })
          }
          if (space.height - bestFit.height > 0) {
            newSpaces.push({
              x: space.x,
              y: space.y + bestFit.height,
              width: space.width,
              height: space.height - bestFit.height,
            })
          }
        } else {
          newSpaces.push(space)
        }
      }
      spaces.length = 0
      spaces.push(...newSpaces)
    } else {
      break // If we can't pack a rectangle, stop trying with this combination
    }
  }

  return packed
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
  ]
  return colors[index % colors.length]
}

const calculateZoom = () => {
  if (resultContainer.value) {
    const containerWidth = resultContainer.value.offsetWidth
    const contentWidth = mainWidth.value
    spaceZoom.value = Math.min(5, containerWidth / contentWidth)
  }
}

const getMainRectangleStyle = () => {
  const style = {
    width: `${mainWidth.value * spaceZoom.value}px`,
    height: `${mainHeight.value * spaceZoom.value}px`,
  }

  if (is3DView.value) {
    style.transform = `perspective(2000px) rotateX(${rotationX.value}deg) rotateY(${rotationY.value}deg)`
    style.transformStyle = 'preserve-3d'
    style.transformOrigin = 'center center'
  }

  return style
}

const getBoxContainerStyle = (rect) => {
  return {
    left: `${rect.x * spaceZoom.value}px`,
    top: `${rect.y * spaceZoom.value}px`,
    width: `${rect.width * spaceZoom.value}px`,
    height: `${rect.height * spaceZoom.value}px`,
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
    '--cube-height': `${rect.height * spaceZoom.value}px`,
    '--cube-depth': `${rect.depth * spaceZoom.value}px`,
  }
}

// Function to adjust color brightness
const adjustColor = (color, amount) => {
  const clamp = (val) => Math.min(255, Math.max(0, val))

  // Convert hex to RGB
  let r = parseInt(color.slice(1, 3), 16)
  let g = parseInt(color.slice(3, 5), 16)
  let b = parseInt(color.slice(5, 7), 16)

  // Adjust brightness
  r = clamp(r + amount)
  g = clamp(g + amount)
  b = clamp(b + amount)

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

onMounted(() => {
  window.addEventListener('resize', calculateZoom)
})
</script>

<style scoped>
.input-field {
  @apply block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
  focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500;
}

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

.rectangle-2d {
  width: 100%;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.cube {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.cube-face {
  position: absolute;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

/* Top face */
.cube-face-top {
  width: var(--cube-width);
  height: var(--cube-height);
  background-color: var(--cube-color-top);
  transform: translateZ(var(--cube-depth));
}

/* Bottom face */
.cube-face-bottom {
  width: var(--cube-width);
  height: var(--cube-height);
  background-color: var(--cube-color-bottom);
  transform: translateZ(0);
}

/* Front face */
.cube-face-front {
  width: var(--cube-width);
  height: var(--cube-depth);
  background-color: var(--cube-color-front);
  transform: rotateX(-90deg);
  transform-origin: bottom;
  bottom: 0;
}

/* Back face */
.cube-face-back {
  width: var(--cube-width);
  height: var(--cube-depth);
  background-color: var(--cube-color-back);
  transform: rotateX(90deg);
  transform-origin: top;
  top: 0;
}

/* Right face */
.cube-face-right {
  width: var(--cube-depth);
  height: var(--cube-height);
  background-color: var(--cube-color-right);
  transform: rotateY(-90deg);
  transform-origin: left;
  left: 100%;
}

/* Left face */
.cube-face-left {
  width: var(--cube-depth);
  height: var(--cube-height);
  background-color: var(--cube-color-left);
  transform: rotateY(90deg);
  transform-origin: right;
  right: 100%;
}
</style>

