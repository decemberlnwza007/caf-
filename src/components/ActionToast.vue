<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
const toast = ref(null)
const displayedMessage = ref(props.modelValue)
let returnFocusTarget = null
let returnFocusRegion = null

function rememberFocus(event) {
  const target = event.target
  if (!(target instanceof HTMLElement) || target === document.body || toast.value?.contains(target)) return
  returnFocusTarget = target
  returnFocusRegion = target.closest('main') || document.querySelector('main')
}

function canReceiveFocus(element) {
  return element instanceof HTMLElement
    && element.isConnected
    && element.getClientRects().length > 0
    && !element.matches(':disabled')
    && !element.closest('[inert], [aria-hidden="true"], dialog:not([open])')
}

function restoreFocus() {
  const region = returnFocusRegion?.isConnected ? returnFocusRegion : document
  const target = [
    returnFocusTarget,
    ...region.querySelectorAll('[data-add-item]'),
    ...document.querySelectorAll('main h1, main h2'),
  ].find(canReceiveFocus)

  if (!target) return
  if (target.matches('h1, h2') && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1')
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }
  target.focus({ preventScroll: true })
}

function dismiss() {
  emit('update:modelValue', '')
}

watch(() => props.modelValue, async (message) => {
  if (message) {
    displayedMessage.value = message
    rememberFocus({ target: document.activeElement })
    return
  }

  if (toast.value?.contains(document.activeElement)) {
    await nextTick()
    restoreFocus()
  }
})

onMounted(() => {
  rememberFocus({ target: document.activeElement })
  document.addEventListener('focusin', rememberFocus)
})

onBeforeUnmount(() => {
  document.removeEventListener('focusin', rememberFocus)
})
</script>

<template>
  <Teleport to="body">
    <span class="toast-announcement" role="status" aria-live="polite" aria-atomic="true">
      {{ modelValue }}
    </span>
    <div class="toast-position">
      <Transition name="action-toast">
        <div v-if="modelValue" ref="toast" class="action-toast" @keydown.esc.stop.prevent="dismiss">
          <span class="toast-mark" aria-hidden="true">
            <svg :key="displayedMessage" viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path class="toast-check" d="m5 12 4.5 4.5L19 7" pathLength="1" />
            </svg>
          </span>
          <p>{{ displayedMessage }}</p>
          <button class="toast-dismiss" type="button" aria-label="ปิดข้อความแจ้งเตือน" @click="dismiss">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-announcement {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.toast-position {
  position: fixed;
  z-index: 60;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  left: max(1rem, env(safe-area-inset-left));
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.action-toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: min(100%, 29rem);
  padding: 0.625rem 0.625rem 0.625rem 1rem;
  border-radius: 1rem;
  color: #fffaf4;
  background: #2c2923;
  box-shadow: 0 10px 30px #2c29232e;
  pointer-events: auto;
}

.action-toast p {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.toast-mark {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: #ffb47e;
  background: #44362a;
}

.toast-check {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  animation: toast-confirm 360ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.toast-dismiss {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 0.75rem;
  color: #e6dcd0;
  background: transparent;
  transition: background-color 140ms ease, color 140ms ease;
}

.toast-dismiss:focus-visible {
  outline-color: #ffb47e;
  outline-offset: 0;
}

.toast-dismiss:active {
  background: #544536;
}

.action-toast-enter-active {
  transition: opacity 240ms ease, transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.action-toast-leave-active {
  transition: opacity 140ms ease, transform 140ms ease;
  pointer-events: none;
}

.action-toast-enter-from,
.action-toast-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}

@keyframes toast-confirm {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}

@media (hover: hover) {
  .toast-dismiss:hover {
    color: white;
    background: #443d33;
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-check {
    animation: none;
  }

  .action-toast-enter-active,
  .action-toast-leave-active {
    transition: opacity 100ms ease;
  }

  .action-toast-enter-from,
  .action-toast-leave-to {
    transform: none;
  }
}
</style>
