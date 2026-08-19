<template>
  <div v-if="gameState.dialogue.open" class="dialog-wrap">
    <div class="dialog pixel-panel">
      <template v-if="choices">
        <div class="speaker">你会怎么做？</div>
        <div class="choices">
          <button v-for="(c, i) in choices" :key="i" class="choice" @click="choose(i)">
            {{ c }}
          </button>
        </div>
      </template>
      <template v-else>
        <div v-if="gameState.dialogue.speaker" class="speaker">
          {{ gameState.dialogue.speaker }}
        </div>
        <p class="text">{{ display }}<span class="caret blink">▌</span></p>
        <div class="next" @click="advance">▶ 继续</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { gameState } from '../game/state'
import { eventBus, EVT } from '../game/eventBus'

const display = ref('')
const full = ref('')
const typing = ref(false)
let timer = null

const choices = computed(() => gameState.dialogue.choices)

function clearTimer() {
  if (timer) clearInterval(timer)
  timer = null
}

watch(
  () => gameState.dialogue.text,
  (t) => {
    clearTimer()
    if (t == null) {
      display.value = ''
      full.value = ''
      typing.value = false
      return
    }
    full.value = t
    typing.value = true
    let i = 1
    display.value = t.slice(0, i)
    timer = setInterval(() => {
      i++
      display.value = t.slice(0, i)
      if (i >= t.length) {
        clearTimer()
        typing.value = false
      }
    }, 22)
  }
)

watch(
  () => gameState.dialogue.open,
  (o) => {
    if (!o) {
      clearTimer()
      typing.value = false
      display.value = ''
    }
  }
)

function advance() {
  if (typing.value) {
    display.value = full.value
    clearTimer()
    typing.value = false
    return
  }
  eventBus.emit(EVT.DIALOGUE_NEXT)
}

function choose(i) {
  eventBus.emit(EVT.DIALOGUE_CHOICE, { index: i })
}

onBeforeUnmount(clearTimer)
</script>

<style scoped>
.dialog-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding: 0 16px 20px;
  z-index: 25;
  pointer-events: none;
}

.dialog {
  width: min(680px, 92vw);
  min-height: 120px;
  padding: 16px 22px;
  pointer-events: auto;
}

.speaker {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  color: var(--accent);
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.text {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--ink);
  min-height: 28px;
}

.caret {
  color: var(--accent-warm);
  margin-left: 2px;
}

.next {
  text-align: right;
  font-size: 12px;
  color: var(--accent-warm);
  cursor: pointer;
  user-select: none;
  margin-top: 8px;
}

.next:hover {
  color: #ffe08a;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.choice {
  display: block;
  width: 100%;
  padding: 11px 16px;
  text-align: left;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 15px;
  color: var(--ink);
  background: #2a2023;
  border: 2px solid #3a2f31;
  cursor: pointer;
  transition: border-color 0.08s ease, background 0.08s ease;
}

.choice:hover {
  border-color: var(--accent);
  background: #32272a;
}
</style>