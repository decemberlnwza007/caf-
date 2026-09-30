<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  format: { type: Function, default: null },
})

const defaultFormatter = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 })
const displayedValue = ref(props.value)
const formattedValue = computed(() => formatValue(props.value))
const formattedDisplay = computed(() => formatValue(displayedValue.value))
let animationFrame = null
let motionPreference = null
let mounted = false

function formatValue(value) {
  return props.format ? props.format(value) : defaultFormatter.format(value)
}

function stopAnimation() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

function animateValue(value) {
  stopAnimation()
  const startingValue = displayedValue.value

  if (!mounted || motionPreference?.matches || !Number.isFinite(value) || !Number.isFinite(startingValue)) {
    displayedValue.value = value
    return
  }

  if (startingValue === value) return
  const startedAt = performance.now()

  function updateValue(now) {
    const progress = Math.min(1, (now - startedAt) / 360)
    const easedProgress = 1 - (1 - progress) ** 4
    displayedValue.value = startingValue + (value - startingValue) * easedProgress

    if (progress < 1) {
      animationFrame = requestAnimationFrame(updateValue)
    } else {
      displayedValue.value = value
      animationFrame = null
    }
  }

  animationFrame = requestAnimationFrame(updateValue)
}

function handleMotionPreference(event) {
  if (!event.matches) return
  stopAnimation()
  displayedValue.value = props.value
}

watch(() => props.value, animateValue)

onMounted(() => {
  mounted = true
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreference.addEventListener('change', handleMotionPreference)
})

onUnmounted(() => {
  mounted = false
  stopAnimation()
  motionPreference?.removeEventListener('change', handleMotionPreference)
})
</script>

<template>
  <span class="animated-number" :aria-label="formattedValue">
    <span aria-hidden="true">{{ formattedDisplay }}</span>
    <span class="number-announcement">{{ formattedValue }}</span>
  </span>
</template>

<style scoped>
.animated-number {
  font-variant-numeric: tabular-nums;
}

.number-announcement {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
