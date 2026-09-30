<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, required: true },
  description: { type: String, default: '' },
  compact: Boolean,
})
const emit = defineEmits(['update:modelValue'])
const dialog = ref(null)
const closing = ref(false)
const titleId = useId()
const descriptionId = useId()
let returnFocusTarget = null
let previousOverflow = ''
let closeTimer

function requestClose() {
  emit('update:modelValue', false)
}

function containFocus(event) {
  if (event.key !== 'Tab') return
  const controls = [...dialog.value.querySelectorAll(
    'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
  )].filter(element => element.getClientRects().length > 0)
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

function finishClose() {
  clearTimeout(closeTimer)
  dialog.value?.close()
  document.body.style.overflow = previousOverflow
  closing.value = false
  const target = returnFocusTarget?.isConnected && returnFocusTarget !== document.body && returnFocusTarget.getClientRects().length > 0
    ? returnFocusTarget
    : document.querySelector('[data-add-item]')
  target?.focus({ preventScroll: true })
}

watch(() => props.modelValue, async (isOpen) => {
  clearTimeout(closeTimer)
  if (isOpen) {
    await nextTick()
    returnFocusTarget = document.activeElement
    previousOverflow = document.body.style.overflow
    closing.value = false
    dialog.value.showModal()
    document.body.style.overflow = 'hidden'
    dialog.value.querySelector('[data-initial-focus]')?.focus({ preventScroll: true })
    dialog.value.scrollTop = 0
  } else if (dialog.value?.open) {
    closing.value = true
    closeTimer = setTimeout(finishClose, 180)
  }
})

onBeforeUnmount(() => {
  clearTimeout(closeTimer)
  if (dialog.value?.open) {
    dialog.value.close()
    document.body.style.overflow = previousOverflow
  }
})
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="modal-panel"
      :class="{ 'modal-compact': compact, 'is-closing': closing }"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
      @cancel.prevent="requestClose"
      @keydown="containFocus"
    >
      <header class="modal-heading">
        <div>
          <h2 :id="titleId">{{ title }}</h2>
          <p v-if="description" :id="descriptionId">{{ description }}</p>
        </div>
        <button class="modal-close" type="button" aria-label="ปิดหน้าต่าง" @click="requestClose">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </header>
      <slot />
    </dialog>
  </Teleport>
</template>
