import { reactive } from 'vue'

// 像素风背景音乐：用 Web Audio API 程序化生成一段循环的 chiptune，
// 无需任何外部音频文件，且遵循浏览器自动播放策略（由用户点击“进入岛屿”后启动）。

export const audioState = reactive({ playing: false, muted: false })

// 四个和弦的音符组成（C → G → Am → F），供吉他小游戏与通关琶音共用。
// 均为通用和弦，不涉及任何受保护的旋律。
export const CHORDS = {
  C: [261.63, 329.63, 392.0, 523.25], // C4 E4 G4 C5
  G: [246.94, 293.66, 392.0, 493.88], // B3 D4 G4 B4
  Am: [220.0, 261.63, 329.63, 440.0], // A3 C4 E4 A4
  F: [174.61, 220.0, 261.63, 349.23] // F3 A3 C4 F4
}

// 单音琴键：唱名 → 频率（Hz），C 大调两个八度（Do = C4，Do+ = C5）。
// 供单音琴键小游戏弹奏使用。
export const NOTES = {
  // 低八度（Do = C4）
  Do: 261.63, // 1
  Re: 293.66, // 2
  Mi: 329.63, // 3
  Fa: 349.23, // 4
  Sol: 392.0, // 5
  La: 440.0, // 6
  Si: 493.88, // 7
  // 高八度（Do = C5，带 +）
  'Do+': 523.25, // 1'
  'Re+': 587.33, // 2'
  'Mi+': 659.25, // 3'
  'Fa+': 698.46, // 4'
  'Sol+': 783.99, // 5'
  'La+': 880.0, // 6'
  'Si+': 987.77 // 7'
}

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

  // 通关吉他小游戏：弹一段原创的 C → G → Am → F 分解和弦（拨弦音色），
  // 明亮、原声吉他味。只使用通用和弦进行，不复现任何版权旋律。
  playArpeggio() {
    if (!this.ensureCtx()) return
    const order = ['C', 'G', 'Am', 'F']
    let t = this.ctx.currentTime + 0.03
    const STEP = 0.11
    order.forEach((name) => {
      CHORDS[name].forEach((freq) => {
        this.pluck(freq, t)
        t += STEP
      })
    })
    // 结尾按下 C 大和弦收束（谐和长音）
    CHORDS.C.forEach((freq) => this.pluck(freq, t, 0.9))
  }

  // 弹奏单个音（琴键音色）：三角波基频 + 谐波泛音，快起音、自然衰减
  playPiano(name) {
    if (!this.ensureCtx()) return
    if (audioState.muted) return
    const freq = NOTES[name]
    if (!freq) return
    const ctx = this.ctx
    const now = ctx.currentTime + 0.02

    const osc = ctx.createOscillator()
    const harm = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.value = freq
    harm.type = 'sine'
    harm.frequency.value = freq * 2

    const g1 = ctx.createGain()
    g1.gain.value = 0.55
    const g2 = ctx.createGain()
    g2.gain.value = 0.18

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)

    osc.connect(g1).connect(gain)
    harm.connect(g2).connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    harm.start(now)
    osc.stop(now + 0.9)
    harm.stop(now + 0.9)
  }

  // 单次拨弦：三角波 + 快速衰减，模拟木吉他拨弦的清脆感
  pluck(freq, start, len = 0.32) {
    const ctx = this.ctx
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.value = freq

    gain.gain.setValueAtTime(0.1, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + len)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(start)
    osc.stop(start + len + 0.02)
  }
}

export const music = new Music()