<template>
  <div class="hud">
    <div class="top-left pixel-panel">
      <div class="lv">{{ gameState.level }}</div>
      <div class="lv-label">{{ gameState.levelLabel }}</div>
      <button
        class="journal-btn"
        type="button"
        :disabled="gameState.dialogue.open || gameState.album.open"
        @click="openJournal"
      >
        发现手记 · {{ gameState.fragments.length }}/{{ gameState.totalFragments }}
      </button>
    </div>

    <div class="top-right pixel-panel">
      <div class="name-boxes">
        <span v-for="(n, i) in gameState.nameHint" :key="i" class="name-box">{{ n }}</span>
      </div>
      <div class="frag">
        姓名碎片 {{ gameState.fragments.length }} / {{ gameState.totalFragments }}
      </div>
      <div class="exploration">
        探索完成 {{ gameState.completedLandmarks.length }} / {{ LANDMARKS.length }}
      </div>
      <div class="pips">
        <span
          v-for="i in gameState.totalFragments"
          :key="i"
          class="pip"
          :class="{ on: i <= gameState.fragments.length }"
        ></span>
      </div>
    </div>

    <div class="ctrl">{{ gameState.controlsHint }}</div>

    <button class="music-btn" @click="toggleMusic">
      {{ audioState.muted ? '♪ 关' : '♪ 开' }}
    </button>
  </div>
</template>

<script setup>
import { gameState } from '../game/state'
import { music, audioState } from '../game/audio'
import { LANDMARKS } from '../game/maps'

function toggleMusic() {
  music.toggleMute()
}

function openJournal() {
  if (gameState.dialogue.open || gameState.album.open) return
  gameState.journal.open = true
  gameState.phase = 'journal'
}
</script>

<style scoped>
.hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}

.top-left {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 150px;
}

.lv {
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  color: var(--accent-warm);
}

.lv-label {
  font-size: 12px;
  color: #cfcfc6;
}

.journal-btn {
  margin-top: 8px;
  padding: 6px 8px;
  border: 1px solid #57483a;
  color: var(--accent-warm);
  background: #0e0a0b;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
  pointer-events: auto;
}

.journal-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--ink);
}

.journal-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.top-right {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 10px 14px;
  text-align: right;
}

.name-boxes {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-bottom: 6px;
}

.name-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 30px;
  padding: 0 4px;
  background: #0e0a0b;
  border: 2px solid #3a2f31;
  color: var(--accent-warm);
  font-size: 14px;
  letter-spacing: 1px;
}

.frag {
  font-size: 12px;
  color: #cfcfc6;
  margin-bottom: 6px;
}

.exploration {
  margin: -2px 0 6px;
  color: #d9bd83;
  font-size: 11px;
}

.pips {
  display: flex;
  justify-content: flex-end;
  gap: 3px;
}

.pip {
  width: 8px;
  height: 8px;
  background: #3a2f31;
  border: 1px solid #0e0a0b;
}

.pip.on {
  background: var(--accent);
}

.ctrl {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #6f6f68;
  letter-spacing: 1px;
  background: rgba(14, 10, 11, 0.6);
  padding: 4px 12px;
}

.music-btn {
  position: absolute;
  right: 14px;
  bottom: 12px;
  pointer-events: auto;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 12px;
  color: var(--ink);
  background: #20181a;
  border: 2px solid #3a2f31;
  padding: 6px 12px;
  cursor: pointer;
}

.music-btn:hover {
  border-color: var(--accent);
}
</style>
