import { reactive } from 'vue'

// 像素风背景音乐：用 Web Audio API 程序化生成一段循环的 chiptune，
// 无需任何外部音频文件，且遵循浏览器自动播放策略（由用户点击“进入岛屿”后启动）。

export const audioState = reactive({ playing: false, muted: false })

// 单声道旋律（频率 Hz），一个轻快的 C 大调 16 步 loop
const MELODY = [
  523.25, 659.25, 783.99, 659.25, // C5 E5 G5 E5
  880.0, 783.99, 659.25, 523.25, // A5 G5 E5 C5
  698.46, 587.33, 659.25, 783.99, // F5 D5 E5 G5
  659.25, 587.33, 523.25, 392.0 // E5 D5 C5 G4
]

const STEP_MS = 220
const VOLUME = 0.05
const NOTE_LEN = 0.2

class Music {
  constructor() {
    this.ctx = null
    this.timer = null
    this.step = 0
  }

  ensureCtx() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (AC) this.ctx = new AC()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  playNote(freq) {
    const ctx = this.ctx
    if (!ctx || audioState.muted) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.value = freq

    gain.gain.setValueAtTime(VOLUME, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + NOTE_LEN)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + NOTE_LEN + 0.02)
  }

  start() {
    if (audioState.playing) return
    if (!this.ensureCtx()) return

    audioState.playing = true
    this.step = 0

    const tick = () => {
      if (!audioState.playing) return
      this.playNote(MELODY[this.step % MELODY.length])
      this.step++
    }

    tick()
    this.timer = setInterval(tick, STEP_MS)
  }

  stop() {
    audioState.playing = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  toggleMute() {
    audioState.muted = !audioState.muted
    return audioState.muted
  }
}

export const music = new Music()