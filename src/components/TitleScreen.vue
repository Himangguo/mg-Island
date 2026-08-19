<template>
  <div class="title-screen">
    <div class="card pixel-panel">
      <div class="logo">🏝️</div>
      <h1 class="name">芒果与你 · Island</h1>
      <p class="sub">「一个关于寻找自己的小岛。」</p>
      <p class="desc">
        控制一个像素角色探索这座岛。<br />
        通过小游戏与探索，慢慢认识一个人——<br />
        最后，找到他的名字。
      </p>
      <button class="start-btn" @click="$emit('start')">进入岛屿</button>
      <p class="hint">WASD / 方向键 移动 · 空格 / E 互动</p>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start'])
</script>

<style scoped>
.title-screen {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 20%, rgba(98, 199, 240, 0.12), transparent 55%),
    #0e0a0b;
  z-index: 30;
}

.card {
  width: min(560px, 88vw);
  padding: 40px 32px;
  text-align: center;
}

.logo {
  font-size: 40px;
}

.name {
  margin: 16px 0 8px;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 28px;
  letter-spacing: 2px;
  color: var(--accent-warm);
}

.sub {
  margin: 0 0 18px;
  color: var(--accent);
  font-size: 15px;
}

.desc {
  margin: 0 0 28px;
  color: #b9b9b0;
  font-size: 14px;
  line-height: 1.9;
}

.start-btn {
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 13px;
  color: #0e0a0b;
  background: var(--accent-warm);
  border: none;
  border-radius: 0;
  padding: 16px 34px;
  cursor: pointer;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.4);
  transition: transform 0.06s ease;
}

.start-btn:hover {
  background: #ffe08a;
}

.start-btn:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
}

.hint {
  margin: 22px 0 0;
  color: #6f6f68;
  font-size: 12px;
  letter-spacing: 1px;
}
</style>