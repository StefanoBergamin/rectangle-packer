<template>
    <div class="relative w-full h-full cube">
        <div class="cube-face cube-face-front"></div>
        <div class="cube-face cube-face-back"></div>
        <div class="cube-face cube-face-right"></div>
        <div class="cube-face cube-face-left"></div>
        <div class="cube-face cube-face-top"></div>
        <div class="cube-face cube-face-bottom"></div>
    </div>
</template>

<script setup>

</script>

<style scoped>
.cube {
  transform-style: preserve-3d;
  transform: translateZ(0);
}

.cube-face {
  @apply absolute
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