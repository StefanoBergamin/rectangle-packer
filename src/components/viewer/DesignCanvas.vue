<template>
  <div
    class="relative viewer-container w-full"
    :class="{
      'is-3d-view': is3DView,
      'is-dragging': isDragging,
    }"
    :style="getResultContainerStyle()"
  >
    <div
      class="relative main-rectangle"
      :class="{ 'is-dragging': isDragging }"
      :style="getMainRectangleStyle()"
    >
      <div
        v-for="rect in packedRectangles"
        :key="rect.id"
        class="absolute rectangle-container"
        :style="getBoxContainerStyle(rect)"
      >
        <CubeObject
          v-if="is3DView"
          :style="getBoxStyle(rect)"
        />
        <SquareObject
          v-else
          :style="{ backgroundColor: getColorForId(rect.id) }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import CubeObject from './CubeObject.vue';
import SquareObject from './SquareObject.vue';
import {
  adjustColor,
  getColorForId,
} from '../../utils/colors';

const props = defineProps({
  baseArea: {
    type: Object,
    required: true,
  },
  packedRectangles: {
    type: Array,
    required: true,
  },
  spaceZoom: {
    type: Number,
    required: true,
  },
  is3DView: {
    type: Boolean,
    required: true,
  },
  rotations: {
    type: Object,
    required: true,
  },
  isDragging: {
    type: Boolean,
    default: false,
  },
});

const getResultContainerStyle = () => {
  if (!props.is3DView) {
    return {
      height: `${props.baseArea.depth * props.spaceZoom + 40}px`,
    };
  }

  return {
    height: `${(props.baseArea.height + 75) * props.spaceZoom}px`,
  };
};

const getMainRectangleStyle = () => {
  const rotationX = props.is3DView
    ? props.rotations.rotationX
    : 0;

  const rotationZ = props.is3DView
    ? props.rotations.rotationZ
    : 0;

  return {
    position: 'absolute',
    left: '50%',
    ...(props.is3DView
        ? { bottom: 0 }
        : { top: '20px' }),
    width: `${props.baseArea.width * props.spaceZoom}px`,
    height: `${props.baseArea.depth * props.spaceZoom}px`,
    transform: `
      translateX(-50%)
      perspective(2000px)
      rotateX(${rotationX}deg)
      rotateZ(${rotationZ}deg)
    `,
    transformStyle: 'preserve-3d',
    transformOrigin: 'center center',
  };
};

const getBoxContainerStyle = (rect) => {
  return {
    left: `${rect.x * props.spaceZoom}px`,
    top: `${rect.y * props.spaceZoom}px`,
    width: `${rect.width * props.spaceZoom}px`,
    height: `${rect.depth * props.spaceZoom}px`,
  };
};

const getBoxStyle = (rect) => {
  const baseColor = getColorForId(rect.id);

  return {
    '--cube-color-front': adjustColor(baseColor, -10),
    '--cube-color-back': adjustColor(baseColor, -30),
    '--cube-color-right': adjustColor(baseColor, -20),
    '--cube-color-left': adjustColor(baseColor, -40),
    '--cube-color-top': baseColor,
    '--cube-color-bottom': adjustColor(baseColor, -50),
    '--cube-width': `${rect.width * props.spaceZoom}px`,
    '--cube-height': `${rect.depth * props.spaceZoom}px`,
    '--cube-depth': `${rect.height * props.spaceZoom}px`,
  };
};
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
  margin: 0;
  transition: transform 0.5s ease;
}

.main-rectangle.is-dragging {
  transition: none;
}

.viewer-container {
  transition: height 0.5s ease;
}

.rectangle-container {
  position: absolute;
  transform-style: preserve-3d;
}

.viewer-container.is-3d-view {
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.viewer-container.is-3d-view.is-dragging {
  cursor: grabbing;
}
</style>