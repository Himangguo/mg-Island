<template>
  <div v-if="album.open && currentAlbum" class="album-overlay" @click.self="closeAlbum">
    <div class="album-shell pixel-panel">
      <div class="album-head">
        <div>
          <div class="eyebrow">ALBUM</div>
          <h2 class="title">{{ currentAlbum.title }}</h2>
          <p class="subtitle">{{ currentAlbum.subtitle }}</p>
        </div>
        <button class="close-btn" type="button" @click="closeAlbum">关闭</button>
      </div>

      <article v-if="currentPhoto" class="photo-card">
        <div class="photo-stage">
          <button
            class="nav-btn nav-prev"
            type="button"
            aria-label="上一张照片"
            :disabled="currentIndex === 0"
            @click="showPhoto(currentIndex - 1)"
          >‹</button>
          <div class="photo-frame">
            <img
              class="photo"
              :src="currentPhoto.src"
              :alt="currentPhoto.title"
              @error="failedSrc = currentPhoto.src"
              @load="failedSrc = ''"
            />
            <div v-if="failedSrc === currentPhoto.src" class="image-error">
              图片暂时无法加载，请检查网络后重试。
            </div>
          </div>
          <button
            class="nav-btn nav-next"
            type="button"
            aria-label="下一张照片"
            :disabled="currentIndex === currentAlbum.photos.length - 1"
            @click="showPhoto(currentIndex + 1)"
          >›</button>
        </div>
        <div class="photo-meta">
          <span class="photo-count">{{ String(currentIndex + 1).padStart(2, '0') }} / {{ String(currentAlbum.photos.length).padStart(2, '0') }}</span>
          <h3 class="photo-title">{{ currentPhoto.title }}</h3>
          <p class="photo-note">{{ currentPhoto.note }}</p>
        </div>
      </article>

      <nav class="album-pagination" aria-label="照片页码">
        <button
          v-for="(photo, index) in currentAlbum.photos"
          :key="photo.src"
          class="page-dot"
          :class="{ active: index === currentIndex }"
          type="button"
          :aria-label="`查看第 ${index + 1} 张照片：${photo.title}`"
          :aria-current="index === currentIndex ? 'true' : undefined"
          @click="showPhoto(index)"
        ></button>
      </nav>

      <div class="album-foot">使用左右箭头或点击两侧按钮翻看 · 按 Esc 关闭</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { ALBUMS } from '../game/albums'
import { eventBus, EVT } from '../game/eventBus'
import { gameState } from '../game/state'

const album = computed(() => gameState.album)
const currentAlbum = computed(() => ALBUMS[album.value.key] || null)
const currentIndex = ref(0)
const failedSrc = ref('')
const currentPhoto = computed(() => currentAlbum.value?.photos[currentIndex.value] || null)

watch(
  () => album.value.key,
  () => {
    currentIndex.value = 0
    failedSrc.value = ''
  }
)

function showPhoto(index) {
  if (!currentAlbum.value) return
  currentIndex.value = Math.max(0, Math.min(index, currentAlbum.value.photos.length - 1))
  failedSrc.value = ''
}

function closeAlbum() {
  if (!album.value.open) return
  gameState.album.open = false
  gameState.album.key = ''
  gameState.phase = 'playing'
  eventBus.emit(EVT.ALBUM_CLOSE)
}

function onKeydown(event) {
  if (!album.value.open) return
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPhoto(currentIndex.value - 1)
    return
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    showPhoto(currentIndex.value + 1)
    return
  }
  if (event.key !== 'Escape') return
  event.preventDefault()
  closeAlbum()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.album-overlay {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background:
    radial-gradient(circle at top, rgba(98, 199, 240, 0.12), transparent 35%),
    rgba(14, 10, 11, 0.88);
  backdrop-filter: blur(6px);
}

.album-shell {
  width: min(1080px, 100%);
  max-height: min(86vh, 920px);
  overflow: auto;
  padding: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 28%),
    #171214;
}

.album-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.eyebrow {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: var(--accent);
  letter-spacing: 1.5px;
  margin-bottom: 10px;
}

.title {
  margin: 0;
  font-size: 30px;
  color: var(--ink);
}

.subtitle {
  margin: 8px 0 0;
  color: #b7b1a9;
  font-size: 14px;
}

.close-btn {
  flex: none;
  min-width: 88px;
  padding: 10px 14px;
  background: #0e0a0b;
  border: 2px solid #3a2f31;
  color: var(--ink);
  font-size: 13px;
  cursor: pointer;
}

.close-btn:hover {
  border-color: var(--accent);
}

.photo-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(760px, 100%);
  margin: 0 auto;
}

.photo-stage {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 48px;
  align-items: center;
  gap: 14px;
}

.photo-frame {
  position: relative;
  background: #f2ede3;
  padding: 16px;
  box-shadow:
    inset 0 0 0 1px rgba(32, 24, 26, 0.12),
    0 10px 24px rgba(0, 0, 0, 0.24);
}

.photo {
  display: block;
  width: 100%;
  height: min(48vh, 430px);
  object-fit: contain;
  background: #e9e4d8;
}

.image-error {
  position: absolute;
  inset: 16px;
  display: grid;
  place-items: center;
  padding: 20px;
  color: #5b514b;
  background: #e9e4d8;
  text-align: center;
  font-size: 14px;
}

.nav-btn {
  width: 48px;
  height: 64px;
  border: 2px solid #3a2f31;
  color: var(--accent-warm);
  background: #0e0a0b;
  font-size: 38px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.nav-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: #282124;
}

.nav-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.photo-meta {
  display: grid;
  gap: 7px;
  text-align: center;
}

.photo-count {
  color: var(--accent);
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  letter-spacing: 1px;
}

.photo-title {
  margin: 0;
  font-size: 17px;
  color: var(--ink);
}

.photo-note {
  margin: 0;
  line-height: 1.7;
  color: #b7b1a9;
  font-size: 13px;
}

.album-foot {
  margin-top: 14px;
  color: #7d776f;
  font-size: 12px;
  text-align: right;
}

.album-pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.page-dot {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 1px solid #746a63;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.page-dot.active {
  border-color: var(--accent-warm);
  background: var(--accent-warm);
  box-shadow: 0 0 12px rgba(255, 215, 106, 0.45);
}

@media (max-width: 600px) {
  .album-overlay {
    padding: 12px;
  }

  .album-shell {
    padding: 18px 14px;
  }

  .title {
    font-size: 24px;
  }

  .photo-stage {
    grid-template-columns: 36px minmax(0, 1fr) 36px;
    gap: 8px;
  }

  .nav-btn {
    width: 36px;
    height: 52px;
    font-size: 30px;
  }

  .photo-frame {
    padding: 8px;
  }

  .photo {
    height: min(48vh, 360px);
  }

  .image-error {
    inset: 8px;
  }
}
</style>
