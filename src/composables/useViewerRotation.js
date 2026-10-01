import { ref } from 'vue';

export const useViewerRotation = ({
    is3DView,
    initialRotationX = 80,
    initialRotationZ = 0,
} = {}) => {
  const rotations = ref({
    rotationX: initialRotationX,
    rotationZ: initialRotationZ,
  });

  const isDragging = ref(false);

  const dragStart = ref({
    x: 0,
    y: 0,
    rotationX: 0,
    rotationZ: 0,
  });
  
  const clamp = (value, min, max) => {
    return Math.min(max, Math.max(min, value));
  };
  
  const normalizeAngle = (angle) => {
    return ((angle + 180) % 360 + 360) % 360 - 180;
  };
  
  const startDrag = (event) => {
    if (!is3DView.value || !event.isPrimary) {
      return;
    }
  
    // It only accepts the left mouse button
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
  
    isDragging.value = true;
  
    dragStart.value = {
      x: event.clientX,
      y: event.clientY,
      rotationX: rotations.value.rotationX,
      rotationZ: rotations.value.rotationZ,
    };
  
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  
  const drag = (event) => {
    if (!isDragging.value || !event.isPrimary) {
      return;
    }
  
    const deltaX = event.clientX - dragStart.value.x;
    const deltaY = event.clientY - dragStart.value.y;
  
    rotations.value.rotationZ = normalizeAngle(
      dragStart.value.rotationZ + deltaX * 0.4,
    );
  
    rotations.value.rotationX = clamp(
      dragStart.value.rotationX - deltaY * 0.3,
      20,
      85,
    );
  };
  
  const stopDrag = (event) => {
    if (!isDragging.value) {
      return;
    }
  
    isDragging.value = false;
  
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    rotations,
    isDragging,
    startDrag,
    drag,
    stopDrag,
  };
}