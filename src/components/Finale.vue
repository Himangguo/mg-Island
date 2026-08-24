<template>
  <div class="finale">
    <!-- 最终关卡：Who am I? -->
    <div v-if="mode === 'reveal'" class="reveal">
      <div class="card pixel-panel">
        <template v-if="!revealed">
          <div class="big">WHO AM I ?</div>
          <div class="boxes">
            <span v-for="(n, i) in gameState.nameHint" :key="i" class="box">{{ n }}</span>
          </div>
          <p v-if="error" class="error">再想想？他就在这座岛的某个角落。</p>
          <form class="form" @submit.prevent="check">
            <input
              v-model="answer"
              class="input"
              placeholder="拼出他的名字…"
              :disabled="busy"
              autocomplete="off"
            />
            <button class="btn" type="submit" :disabled="busy">确认</button>
          </form>
          <p class="tip">提示：上面三组就是九个颗粒拼出的部件，把它们组成三个字。</p>
        </template>
        <template v-else>
          <p v-for="(line, i) in revealLines" :key="i" class="line" :class="{ show: i < revealStep }">
            {{ line }}
          </p>
        </template>
      </div>
    </div>

    <!-- 结局 -->
    <div v-else class="ending">
      <div class="card pixel-panel">
        <p v-for="(line, i) in lines" :key="i" class="line" :class="{ show: i < shown }">
          {{ line }}
        </p>
        <div v-if="done" class="cat">🐱 豆泡走了过来。</div>
        <button v-if="done" class="btn again" @click="restart">再逛一次</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { gameState } from '../game/state'

const mode = computed(() => (gameState.phase === 'ending' ? 'ending' : 'reveal'))

const answer = ref('')
const error = ref(false)
const busy = ref(false)
const revealed = ref(false)
const revealStep = ref(0)

const shown = ref(0)
const done = ref(false)

const revealLines = ['终于找到我的名字了。', '你好，我叫周学辰。']

const lines = [
  '你探索了这座岛。',
  '也许你已经知道了我的名字。',
  '但这座岛真正想让你发现的，并不是我的名字。',
  '而是一个一直在尝试寻找自己喜欢什么的人。',
  '谢谢你，愿意花时间认识我。'
]

let timers = []

function later(fn, ms) {
  const id = setTimeout(fn, ms)
  timers.push(id)
  return id
}

function check() {
  const val = answer.value.trim().replace(/[\s·—]+/g, '')
  if (val !== '周学辰') {
    error.value = true
    return
  }
  error.value = false
  busy.value = true
  revealed.value = true
  revealStep.value = 0

  const t = setInterval(() => {
    revealStep.value++
    if (revealStep.value >= revealLines.length) {
      clearInterval(t)
      later(() => {
        gameState.phase = 'ending'
        beginEnding()
      }, 1400)
    }
  }, 1100)
  timers.push(t)
}

function beginEnding() {
  shown.value = 0
  done.value = false
  let i = 0
  const t = setInterval(() => {
    i++
    shown.value = i
    if (i >= lines.length) {
      clearInterval(t)
      done.value = true
    }
  }, 1500)
  timers.push(t)
}

function restart() {
  location.reload()
}

onBeforeUnmount(() => {
  // 浏览器中 clearTimeout 与 clearInterval 可互用
  timers.forEach((t) => clearTimeout(t))
})
</script>

<style scoped>
.finale {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(14, 10, 11, 0.9);
  z-index: 45;
}

.card {
  width: min(600px, 90vw);
  padding: 40px 34px;
  text-align: center;
}

.big {
  font-family: 'Press Start 2P', monospace;
  font-size: 22px;
  color: var(--accent-warm);
  letter-spacing: 2px;
  margin-bottom: 22px;
}

.boxes {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 22px;
}

.box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  min-height: 62px;
  padding: 0 8px;
  background: #0e0a0b;
  border: 3px solid #3a2f31;
  color: var(--accent-warm);
  font-size: 24px;
  letter-spacing: 2px;
}

.error {
  color: var(--accent-pink);
  font-size: 13px;
  margin: 0 0 12px;
}

.form {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.input {
  width: 220px;
  padding: 12px 14px;
  font-size: 16px;
  text-align: center;
  background: #0e0a0b;
  border: 2px solid #3a2f31;
  color: var(--ink);
  outline: none;
}

.input:focus {
  border-color: var(--accent);
}

.btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: #0e0a0b;
  background: var(--accent-warm);
  border: none;
  border-radius: 0;
  padding: 0 20px;
  cursor: pointer;
}

.btn:hover {
  background: #ffe08a;
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.tip {
  margin: 16px 0 0;
  color: #6f6f68;
  font-size: 12px;
}

.line {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.7s ease, transform 0.7s ease;
  font-size: 17px;
  line-height: 1.9;
  color: var(--ink);
  margin: 10px 0;
}

.line.show {
  opacity: 1;
  transform: translateY(0);
}

.cat {
  margin-top: 24px;
  font-size: 18px;
  color: var(--accent-warm);
}

.again {
  margin-top: 26px;
  padding: 14px 28px;
}
</style>