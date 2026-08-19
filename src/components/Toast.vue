<template>
  <transition name="toast">
    <div v-if="visible" class="toast pixel-panel" :class="kind">{{ text }}</div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { eventBus, EVT } from '../game/eventBus'

const visible = ref(false)
const text = ref('')
const kind = ref('info')
let timer = null

function show(payload) {
  text.value = (payload && payload.text) || ''
  kind.value = (payload && payload.kind) || 'info'
  visible.value = true
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    visible.value = false
  }, 2300)
}

let off
onMounted(() => {
  off = eventBus.on(EVT.TOAST, show)
})

onBeforeUnmount(() => {
  if (off) off()
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.toast {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 22px;
  font-size: 14px;
  color: var(--ink);
  z-index: 40;
  white-space: nowrap;
}

.toast.fragment {
  color: var(--accent-warm);
}

.toast.level {
  color: var(--accent-pink);
}

.toast-enter-active,
.toast-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(-50%) translateY(-160%);
  opacity: 0;
}
</style>