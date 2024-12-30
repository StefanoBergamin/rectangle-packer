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
          <div ref="resultContainer" class="overflow-auto">
            <div
              class="relative main-rectangle"
              :style="{
                width: `${mainWidth * spaceZoom}px`,
                height: `${mainHeight * spaceZoom}px`,
              }"
            >
              <div
                v-for="(rect, index) in packedRectangles"
                :key="index"
                class="absolute"
                :style="{
                  left: `${rect.x * spaceZoom}px`,
                  top: `${rect.y * spaceZoom}px`,
                  width: `${rect.width * spaceZoom}px`,
                  height: `${rect.height * spaceZoom}px`,
                  backgroundColor: getRandomColor(index),
                }"
              ></div>
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
const secondaryRectangles = ref([{ width: '', height: '' }])
const packedRectangles = ref([])
const resultContainer = ref(null)

const addSecondaryRectangle = () => {
  secondaryRectangles.value.push({ width: '', height: '' })
}

const removeSecondaryRectangle = (index) => {
  secondaryRectangles.value.splice(index, 1)
}

const startPackingProcess = async () => {
  const mainRect = { width: mainWidth.value, height: mainHeight.value }
  const rects = secondaryRectangles.value
    .filter((r) => r.width && r.height)
    .map((r, id) => ({ id, width: r.width, height: r.height, area: r.width * r.height }))

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
    spaceZoom.value = containerWidth / contentWidth
  }
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
}
</style>
