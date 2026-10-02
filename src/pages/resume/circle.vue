<template>
  <canvas
    ref="canvasRef"
    width="600"
    height="400"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @wheel.prevent="onWheel"
    style="border: 1px solid #ccc; cursor: grab;"
  ></canvas>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const canvasRef = ref(null)
const ctx = ref(null)

const circle = ref({
  x: 300,
  y: 200,
  radius: 50,
  scale: 1,
})

const dragging = ref(false)
const offset = ref({ x: 0, y: 0 })

const draw = () => {
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  ctx.value.beginPath()
  ctx.value.arc(
    circle.value.x,
    circle.value.y,
    circle.value.radius * circle.value.scale,
    0,
    2 * Math.PI
  )
  ctx.value.fillStyle = '#42b883'
  ctx.value.fill()
  ctx.value.stroke()
}

const isInsideCircle = (x, y) => {
  const dx = x - circle.value.x
  const dy = y - circle.value.y
  return Math.sqrt(dx * dx + dy * dy) <= circle.value.radius * circle.value.scale
}

const onMouseDown = (e) => {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (isInsideCircle(x, y)) {
    dragging.value = true
    offset.value = { x: x - circle.value.x, y: y - circle.value.y }
    canvasRef.value.style.cursor = 'grabbing'
  }
}

const onMouseMove = (e) => {
  if (!dragging.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  circle.value.x = e.clientX - rect.left - offset.value.x
  circle.value.y = e.clientY - rect.top - offset.value.y

  draw()
}

const onMouseUp = () => {
  dragging.value = false
  canvasRef.value.style.cursor = 'grab'
}

const onWheel = (e) => {
  const delta = e.deltaY > 0 ? -0.05 : 0.05
  const newScale = circle.value.scale + delta
  circle.value.scale = Math.max(0.1, Math.min(3, newScale))
  draw()
}

onMounted(() => {
  ctx.value = canvasRef.value.getContext('2d')
  draw()
})
</script>

<style scoped>
canvas {
  user-select: none;
}
</style>
