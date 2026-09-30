<template>
  <div v-if="journal.open" class="journal-overlay" @click.self="closeJournal">
    <section class="journal-shell pixel-panel" aria-labelledby="journal-title">
      <header class="journal-head">
        <div>
          <div class="eyebrow">FIELD NOTES · {{ String(gameState.fragments.length).padStart(2, '0') }}/09</div>
          <h2 id="journal-title" class="title">发现手记</h2>
          <p class="subtitle">关于一个人的线索，不止是他的名字。</p>
        </div>
        <button class="close-btn" type="button" @click="closeJournal">关闭</button>
      </header>

      <div class="journal-progress" aria-label="人物线索收集进度">
        <span :style="{ width: `${(gameState.fragments.length / gameState.totalFragments) * 100}%` }"></span>
      </div>

      <nav class="category-tabs" aria-label="手记分类">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-tab"
          :class="{ active: activeCategory === category.id }"
          type="button"
          @click="activeCategory = category.id"
        >
          <span>{{ category.title }}</span>
          <small>{{ countFound(category.id) }}/3</small>
        </button>
      </nav>

      <div class="category-intro">
        <span class="category-mark">0{{ activeCategory + 1 }}</span>
        <p>{{ categories[activeCategory].description }}</p>
      </div>

      <section v-if="activeCategory === 2" class="interest-tracker" aria-label="兴趣体验进度">
        <div class="tracker-heading">
          <span>兴趣体验</span>
          <span>{{ gameState.interests.length }}/{{ interestExperiences.length }}</span>
        </div>
        <p class="tracker-hint">四项都体验过，才会拼出这条兴趣线索。</p>
        <div class="interest-list">
          <div
            v-for="interest in interestExperiences"
            :key="interest.id"
            class="interest-item"
            :class="{ completed: hasTriedInterest(interest.id) }"
          >
            <span>{{ interest.title }}</span>
            <small>{{ hasTriedInterest(interest.id) ? '已体验' : '待探索' }}</small>
          </div>
        </div>
      </section>

      <div class="notes-list">
        <article
          v-for="fragment in fragmentsInCategory"
          :key="fragment.id"
          class="note-card"
          :class="{ locked: !isFound(fragment.id) }"
        >
          <div class="note-index">{{ isFound(fragment.id) ? fragment.glyph : '·' }}</div>
          <div class="note-body">
            <div class="note-topline">
              <span class="note-label">{{ fragment.label }}</span>
              <span class="note-place">{{ isFound(fragment.id) ? fragment.place : '尚未发现' }}</span>
            </div>
            <p v-if="isFound(fragment.id)" class="note-insight">{{ insightFor(fragment) }}</p>
            <p v-else class="note-locked">继续探索小岛，解锁这条线索。</p>
          </div>
          <span class="note-status">{{ isFound(fragment.id) ? '已记录' : '未解锁' }}</span>
        </article>
      </div>

      <footer class="journal-foot">
        <span>每一枚碎片，都是认识他的一个角度。</span>
        <span>按 Esc 返回小岛</span>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { FRAGMENTS } from '../game/content'
import { gameState } from '../game/state'

const categories = [
  { id: 0, title: '初识与生活', description: '从日常和相处方式，认识屏幕背后的这个人。' },
  { id: 1, title: '工作与思考', description: '看看他在做什么，以及遇到问题时如何钻研。' },
  { id: 2, title: '兴趣与远行', description: '那些愿意尝试的事，和留下印象的旅程。' }
]

const interestExperiences = [
  { id: 'skate', title: '滑板' },
  { id: 'guitar', title: '吉他' },
  { id: 'swim', title: '游泳' },
  { id: 'fitness', title: '健身' }
]

const activeCategory = ref(0)
const journal = computed(() => gameState.journal)
const fragmentsInCategory = computed(() => FRAGMENTS.filter((fragment) => fragment.charIndex === activeCategory.value))

function isFound(id) {
  return gameState.fragments.includes(id)
}

function countFound(categoryId) {
  return FRAGMENTS.filter((fragment) => fragment.charIndex === categoryId && isFound(fragment.id)).length
}

function hasTriedInterest(id) {
  return gameState.interests.includes(id)
}

function insightFor(fragment) {
  if (fragment.id === 'zhou_3') {
    if (gameState.profile.personalityRoute === 'social') {
      return '和聊得来的人在一起时，他会更主动；E 和 I 并不是固定标签。'
    }
    if (gameState.profile.personalityRoute === 'reserved') {
      return '在陌生人面前他习惯先观察；话少，不代表冷漠。'
    }
  }
  return fragment.insight
}

function closeJournal() {
  if (!journal.value.open) return
  gameState.journal.open = false
  gameState.phase = 'playing'
}

function onKeydown(event) {
  if (journal.value.open && event.key === 'Escape') {
    event.preventDefault()
    closeJournal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.journal-overlay {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(98, 199, 240, 0.1), transparent 48%),
    rgba(14, 10, 11, 0.88);
  backdrop-filter: blur(6px);
}

.journal-shell {
  width: min(820px, 100%);
  max-height: min(88vh, 900px);
  overflow: auto;
  padding: 26px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), transparent 42%),
    #171214;
}

.journal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.eyebrow {
  margin-bottom: 10px;
  color: var(--accent);
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
  letter-spacing: 1px;
}

.title {
  margin: 0;
  color: var(--ink);
  font-size: 30px;
}

.subtitle {
  margin: 8px 0 0;
  color: #aaa39c;
  font-size: 13px;
}

.close-btn {
  flex: none;
  min-width: 76px;
  padding: 9px 12px;
  border: 2px solid #3a2f31;
  color: var(--ink);
  background: #0e0a0b;
  cursor: pointer;
}

.close-btn:hover {
  border-color: var(--accent);
}

.journal-progress {
  height: 4px;
  margin: 22px 0;
  background: #33292b;
}

.journal-progress span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-warm));
  transition: width 0.35s ease;
}

.category-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.category-tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid #3a2f31;
  color: #aaa39c;
  background: #20181a;
  text-align: left;
  cursor: pointer;
}

.category-tab.active {
  border-color: var(--accent-warm);
  color: var(--ink);
  background: #2a2223;
}

.category-tab small {
  color: var(--accent-warm);
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
}

.category-intro {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 22px 0 12px;
}

.category-intro p {
  margin: 0;
  color: #b7b1a9;
  font-size: 13px;
}

.category-mark {
  color: #705f4b;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
}

.interest-tracker {
  margin: 0 0 14px;
  padding: 13px 15px;
  border: 1px solid rgba(98, 199, 240, 0.2);
  background: rgba(98, 199, 240, 0.035);
}

.tracker-heading {
  display: flex;
  justify-content: space-between;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
}

.tracker-hint {
  margin: 5px 0 10px;
  color: #89827a;
  font-size: 11px;
}

.interest-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}

.interest-item {
  display: flex;
  justify-content: space-between;
  gap: 5px;
  padding: 7px 9px;
  border: 1px solid #3a2f31;
  color: #aaa39c;
  background: #171214;
  font-size: 11px;
}

.interest-item small {
  color: #746d67;
  font-size: 10px;
  white-space: nowrap;
}

.interest-item.completed {
  border-color: rgba(98, 199, 240, 0.45);
  color: var(--ink);
}

.interest-item.completed small {
  color: var(--accent);
}

.notes-list {
  display: grid;
  gap: 9px;
}

.note-card {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  border: 1px solid rgba(255, 215, 106, 0.24);
  background: rgba(255, 215, 106, 0.035);
  animation: note-in 0.28s ease both;
}

.note-card:nth-child(2) {
  animation-delay: 50ms;
}

.note-card:nth-child(3) {
  animation-delay: 100ms;
}

.note-card.locked {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.note-index {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  color: var(--accent-warm);
  background: #0e0a0b;
  border: 1px solid #57483a;
  font-size: 16px;
}

.locked .note-index {
  color: #635b56;
  border-color: #3a2f31;
}

.note-body {
  min-width: 0;
}

.note-topline {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.note-label {
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
}

.note-place {
  color: #8e857c;
  font-size: 11px;
}

.note-insight,
.note-locked {
  margin: 5px 0 0;
  color: #c1bbb3;
  font-size: 13px;
  line-height: 1.65;
}

.note-locked {
  color: #77706a;
}

.note-status {
  color: var(--accent-warm);
  font-size: 10px;
  white-space: nowrap;
}

.locked .note-status {
  color: #6f6862;
}

.journal-foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 19px;
  color: #7d776f;
  font-size: 11px;
}

@keyframes note-in {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .journal-overlay {
    padding: 12px;
  }

  .journal-shell {
    padding: 19px 15px;
  }

  .title {
    font-size: 25px;
  }

  .category-tabs {
    grid-template-columns: 1fr;
  }

  .category-tab {
    min-height: 38px;
  }

  .interest-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .interest-item {
    flex-wrap: wrap;
  }

  .note-card {
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 9px;
    padding: 11px;
  }

  .note-index {
    width: 30px;
    height: 30px;
  }

  .note-status {
    grid-column: 2;
  }

  .journal-foot {
    flex-direction: column;
  }
}
</style>
