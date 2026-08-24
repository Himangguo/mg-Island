<template>
  <div class="app">
    <!-- Phaser 挂载容器 -->
    <div ref="gameEl" class="game-canvas"></div>

    <!-- Vue UI 覆盖层 -->
    <TitleScreen v-if="gameState.phase === 'title'" @start="startGame" />
    <Hud v-if="gameState.phase === 'playing'" />
    <DialogueBox />
    <Toast />
    <Finale v-if="gameState.phase === 'reveal' || gameState.phase === 'ending'" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { createGame } from './game/index'
import { eventBus, EVT } from './game/eventBus'
import { gameState } from './game/state'
import { music } from './game/audio'
import TitleScreen from './components/TitleScreen.vue'
import Hud from './components/Hud.vue'
import DialogueBox from './components/DialogueBox.vue'
import Toast from './components/Toast.vue'
import Finale from './components/Finale.vue'

const gameEl = ref(null)
const offs = []

function startGame() {
  music.start()
  gameState.phase = 'playing'
  eventBus.emit(EVT.TOAST, { text: '你来到了一座小岛。四处逛逛吧。', kind: 'info' })
}

onMounted(() => {
  createGame(gameEl.value)

  offs.push(
    eventBus.on(EVT.FINAL_QUEST, () => {
      gameState.dialogue.open = false
      gameState.dialogue.choices = null
      gameState.phase = 'reveal'
    })
  )

  offs.push(
    eventBus.on(EVT.FRAGMENT_GET, (frag) => {
      eventBus.emit(EVT.TOAST, {
        text: `获得笔画「${frag.glyph}」（${gameState.fragments.length}/${gameState.totalFragments}）`,
        kind: 'fragment'
      })
    })
  )

  offs.push(
    eventBus.on(EVT.LEVEL_UP, (lv) => {
      eventBus.emit(EVT.TOAST, { text: `成长：${lv.name} · ${lv.label}`, kind: 'level' })
    })
  )
})

onBeforeUnmount(() => {
  offs.forEach((fn) => fn())
})
</script>

<style scoped>
.app {
  position: relative;
  width: 100%;
  height: 100%;
}

.game-canvas {
  position: absolute;
  inset: 0;
}
</style>