import Phaser from 'phaser'
import { eventBus, EVT } from '../eventBus'
import { music, audioState } from '../audio'

// 所有小游戏都叠加在暂停的世界之上，结束后通过事件通知 WorldScene 恢复。
class BaseMini extends Phaser.Scene {
  finish(success, result) {
    this.scene.stop()
    eventBus.emit(EVT.MINIGAME_DONE, { id: this.scene.key, success, result })
  }

  quit() {
    this.finish(false)
  }

  backdrop() {
    this.add.rectangle(0, 0, 960, 540, 0x0e0a0b, 0.92).setOrigin(0)
    this.add.rectangle(480, 270, 720, 400, 0x20181a).setOrigin(0.5)
    this.add.rectangle(480, 270, 720, 400).setOrigin(0.5).setStrokeStyle(4, 0x3a2f31)
  }

  title(str, y = 82) {
    return this.add
      .text(480, y, str, { fontFamily: 'monospace', fontSize: '22px', color: '#ffd76a' })
      .setOrigin(0.5)
  }

  subtitle(str, y = 120) {
    return this.add
      .text(480, y, str, { fontFamily: '"Noto Sans SC", sans-serif', fontSize: '13px', color: '#b9b9b0' })
      .setOrigin(0.5)
  }

  txt(x, y, s, size = 16, color = '#f5eede', font = 'monospace') {
    return this.add.text(x, y, s, { fontFamily: font, fontSize: size + 'px', color }).setOrigin(0.5)
  }

  button(x, y, w, h, label, cb, color = 0x3a2f31) {
    const rect = this.add
      .rectangle(x, y, w, h, color)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x62c7f0)
      .setInteractive({ useHandCursor: true })
    const t = this.txt(x, y, label, 15, '#f5eede')
    rect.on('pointerdown', cb)
    rect.on('pointerover', () => rect.setFillStyle(0x4a3f42))
    rect.on('pointerout', () => rect.setFillStyle(color))
    return { rect, t }
  }

  quitButton() {
    this.button(815, 58, 120, 36, '退出', () => this.quit(), 0x3a2f31)
  }
}

// ============ 招牌：Bug Hunter ============
export class BugHunterScene extends BaseMini {
  constructor() {
    super('BugHunter')
  }

  create() {
    this.backdrop()
    this.quitButton()
    this.title('BUG HUNTER')
    this.subtitle('电脑出错了。找出并修掉 3 个 Bug（别点咖啡）。')
    this.txt(480, 152, '> SYSTEM ERROR', 12, '#ff6b57')

    this.fixed = 0
    this.bugs = [{ x: 240, y: 280, label: 'CSS' }, { x: 480, y: 280, label: 'JS' }, { x: 720, y: 280, label: 'UI' }]
    this.status = this.txt(480, 440, '已修复 0 / 3', 16, '#9fd8ef')

    this.spawnBug(this.bugs[0])
    this.spawnBug(this.bugs[1])
    this.spawnBug(this.bugs[2])
    this.spawnDecoy()
  }

  spawnBug(b) {
    const bug = this.add.circle(b.x, b.y, 16, 0xff6b57).setInteractive({ useHandCursor: true })
    this.tweens.add({ targets: bug, y: b.y - 6, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
    this.txt(b.x, b.y + 30, b.label, 13, '#ffd76a')
    bug.on('pointerdown', () => {
      if (bug._dead) return
      bug._dead = true
      this.tweens.add({ targets: bug, scale: 0, alpha: 0, duration: 180, onComplete: () => bug.destroy() })
      this.fixed++
      this.status.setText(`已修复 ${this.fixed} / 3`)
      if (this.fixed >= 3) {
        this.txt(480, 400, '🐛 Bug Fixed!', 18, '#7fd6a0')
        this.time.delayedCall(900, () => this.finish(true))
      }
    })
  }

  spawnDecoy() {
    const decoy = this.add.circle(480, 380, 14, 0x8a6a4f).setInteractive({ useHandCursor: true })
    this.txt(480, 410, '☕ 咖啡', 11, '#b9b9b0')
    this.tweens.add({ targets: decoy, x: decoy.x - 6, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
    decoy.on('pointerdown', () => {
      this.cameras.main.shake(100, 0.004)
      this.txt(480, 460, '那不是 Bug！', 13, '#ff8fb1')
    })
  }
}

// ============ Aim Challenge（无畏契约）============
export class AimChallengeScene extends BaseMini {
  constructor() {
    super('AimChallenge')
  }

  create() {
    this.backdrop()
    this.quitButton()
    this.title('AIM CHALLENGE')
    this.subtitle('点击目标，命中 8 个即可通关。')

    this.hits = 0
    this.clicks = 0
    this.timeLeft = 15
    this.running = true
    this.hud = this.txt(480, 420, '命中 0 / 8    剩余 15s', 15, '#9fd8ef')

    this.time.addEvent({ delay: 600, loop: true, callback: () => this.spawnTarget() })
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.running) return
        this.timeLeft--
        this.updateHud()
        if (this.timeLeft <= 0) this.timeUp()
      }
    })
    this.spawnTarget()
  }

  updateHud() {
    this.hud.setText(`命中 ${this.hits} / 8    剩余 ${this.timeLeft}s`)
  }

  spawnTarget() {
    if (!this.running) return
    const x = Phaser.Math.Between(160, 800)
    const y = Phaser.Math.Between(180, 360)
    const t = this.add.circle(x, y, 16, 0xff6b57).setInteractive({ useHandCursor: true })
    this.tweens.add({ targets: t, scale: { from: 1.3, to: 0.9 }, duration: 500, yoyo: true, ease: 'Sine.inOut' })
    t.on('pointerdown', () => {
      this.clicks++
      this.hits++
      this.updateHud()
      t.destroy()
      if (this.hits >= 8) this.win()
    })
    this.time.delayedCall(1500, () => {
      if (t.active) t.destroy()
    })
  }

  win() {
    this.running = false
    const acc = Math.round((this.hits / Math.max(this.clicks, 1)) * 100)
    this.txt(480, 265, `Accuracy: ${acc}%`, 18, '#7fd6a0')
    this.time.delayedCall(900, () => this.finish(true, { accuracy: acc }))
  }

  timeUp() {
    this.running = false
    this.txt(480, 265, '时间到，重新来一局？', 16, '#ff8fb1')
    this.button(380, 330, 200, 44, '再来一次', () => this.scene.restart())
  }
}

// ============ 50m 自由泳 ============
export class SwimScene extends BaseMini {
  constructor() {
    super('Swim')
  }

  create() {
    this.backdrop()
    this.quitButton()
    this.title('50m FREESTYLE')
    this.subtitle('连按空格或点画面向前游。')

    this.progress = 0
    this.done = false
    this.add.rectangle(480, 260, 560, 26, 0x0e0a0b).setStrokeStyle(2, 0x3a2f31)
    this.bar = this.add.rectangle(200, 260, 0, 18, 0x3fa7d6).setOrigin(0, 0.5)
    this.meter = this.txt(480, 300, '0m / 50m', 18, '#9fd8ef')
    this.swimmer = this.add.text(200, 320, '🏊', { fontSize: '30px' }).setOrigin(0.5)

    const stroke = () => {
      if (this.done) return
      this.progress = Math.min(50, this.progress + 2)
      this.bar.width = (this.progress / 50) * 560
      this.swimmer.x = 200 + (this.progress / 50) * 560
      this.meter.setText(`${this.progress}m / 50m`)
      if (this.progress >= 50) this.sink()
    }
    this.input.keyboard.on('keydown-SPACE', stroke)
    this.input.on('pointerdown', stroke)
  }

  sink() {
    this.done = true
    this.txt(480, 400, '“不行了。”', 16, '#ff8fb1')
    this.tweens.add({ targets: this.swimmer, y: this.swimmer.y + 30, alpha: 0, duration: 500 })
    this.time.delayedCall(900, () => this.finish(true))
  }
}

// ============ 吉他 · 单音琴键 ============
export class ChordScene extends BaseMini {
  constructor() {
    super('Chord')
  }

  create() {
    this.backdrop()
    this.freeMode = false
    // 进入游戏时暂停背景音乐，退出后再恢复
    this.wasPlaying = audioState.playing
    music.stop()
    // 左上角按钮：通关前「退出」放弃；通关后变「离开」并结算完成
    this.exitBtn = this.button(815, 58, 120, 36, '退出', () => this.finish(this.freeMode))
    this.title('旋律琴键')
    this.subtitle('照谱弹出：La Do+ Sol+ Do+ Do+ Sol La Sol+ Do+')

    // 前奏旋律（唱名，+ 表示高八度）
    this.seq = ['La', 'Do+', 'Sol+', 'Do+', 'Do+', 'Sol', 'La', 'Sol+', 'Do+']
    this.idx = 0
    this.target = this.txt(480, 170, `下一个音：${this.seq[0]}`, 18, '#ffd76a')

    // 两排白键：上排低八度 Do~Si，下排高八度 Do+~Si+
    const keys = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si']
    const keyW = 62
    const gap = 8
    const totalW = keys.length * keyW + (keys.length - 1) * gap
    const startX = 480 - totalW / 2 + keyW / 2
    keys.forEach((name, i) => {
      this.pianoKey(startX + i * (keyW + gap), 260, keyW, 58, name)
    })
    keys.forEach((name, i) => {
      this.pianoKey(startX + i * (keyW + gap), 330, keyW, 58, name + '+')
    })

    this.feedback = null
  }

  finish(success, result) {
    // 退出游戏时恢复背景音乐（进入前本来就在播放才恢复）
    if (this.wasPlaying && !audioState.playing) music.start()
    super.finish(success, result)
  }

  pianoKey(x, y, w, h, name) {
    const rect = this.add
      .rectangle(x, y, w, h, 0xf5eede)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0x3a2f31)
      .setInteractive({ useHandCursor: true })
    this.txt(x, y, name, 16, '#20181a')
    rect.on('pointerdown', () => this.hit(name, rect))
    rect.on('pointerover', () => rect.setFillStyle(0xffe9b0))
    rect.on('pointerout', () => rect.setFillStyle(0xf5eede))
  }

  hit(note, rect) {
    music.playPiano(note)
    if (rect) {
      rect.setFillStyle(0xffd76a)
      this.time.delayedCall(120, () => rect.setFillStyle(0xf5eede))
    }
    if (this.freeMode) return
    if (note === this.seq[this.idx]) {
      this.idx++
      if (this.idx >= this.seq.length) {
        this.enterFreeMode()
        return
      }
      this.target.setText(`下一个音：${this.seq[this.idx]}`)
    } else {
      this.cameras.main.shake(80, 0.004)
      this.flashFeedback('弹错了，再试一次。', '#ff8fb1')
    }
  }

  flashFeedback(str, color) {
    if (this.feedback) this.feedback.destroy()
    this.feedback = this.txt(480, 390, str, 13, color)
  }

  enterFreeMode() {
    this.freeMode = true
    this.target.setText('♪ 弹对啦！')
    this.exitBtn.t.setText('离开')
    this.txt(480, 385, '几个单音连成了一段旋律。', 13, '#7fd6a0')
    this.txt(480, 412, '再随意按几格玩玩。', 13, '#b9b9b0')
  }
}

// ============ 滑板 Ollie ============
export class OllieScene extends BaseMini {
  constructor() {
    super('Ollie')
  }

  create() {
    this.backdrop()
    this.quitButton()
    this.title('OLLIE CHALLENGE')
    this.subtitle('按空格跳过石头，连续跳过 3 个。')

    this.groundY = 360
    this.add.rectangle(480, this.groundY + 6, 720, 4, 0x3a2f31).setOrigin(0.5)

    this.board = this.add.rectangle(200, this.groundY, 26, 18, 0x62c7f0).setOrigin(0.5)
    this.jumping = false
    this.cleared = 0
    this.crashed = false
    this.stone = null

    this.status = this.txt(480, 430, '已跳过 0 / 3', 15, '#9fd8ef')
    this.input.keyboard.on('keydown-SPACE', () => this.jump())
    this.time.delayedCall(500, () => this.spawnStone())
  }

  jump() {
    if (this.jumping || this.crashed) return
    this.jumping = true
    this.tweens.add({
      targets: this.board,
      y: this.groundY - 70,
      duration: 300,
      yoyo: true,
      ease: 'Quad.out',
      onComplete: () => (this.jumping = false)
    })
  }

  spawnStone() {
    if (this.crashed) return
    this.stone = this.add.circle(920, this.groundY, 14, 0x8a6a4f).setOrigin(0.5)
  }

  update() {
    if (!this.stone || this.crashed) return
    this.stone.x -= 5

    const near = Math.abs(this.stone.x - this.board.x) < 26 && Math.abs(this.board.y - this.groundY) < 12
    if (near && !this.jumping) {
      this.crash()
      return
    }
    if (this.stone.x < 120) {
      this.stone.destroy()
      this.stone = null
      this.cleared++
      this.status.setText(`已跳过 ${this.cleared} / 3`)
      if (this.cleared >= 3) {
        this.crashed = true
        this.txt(480, 400, '“我会 Ollie，不过也就会这点。”', 13, '#7fd6a0')
        this.time.delayedCall(900, () => this.finish(true))
        return
      }
      this.time.delayedCall(500, () => this.spawnStone())
    }
  }

  crash() {
    this.crashed = true
    this.cameras.main.shake(120, 0.006)
    this.txt(480, 400, '绊倒了，重来。', 15, '#ff8fb1')
    this.button(380, 320, 200, 44, '再来一次', () => this.scene.restart())
  }
}

// ============ 接雨水（LeetCode 42）============
// 每次随机生成柱子，用「前缀最值」求出每一列能接的水量并可视化。
function trapWater(heights) {
  const n = heights.length
  const leftMax = new Array(n).fill(0)
  const rightMax = new Array(n).fill(0)
  leftMax[0] = heights[0]
  for (let i = 1; i < n; i++) leftMax[i] = Math.max(leftMax[i - 1], heights[i])
  rightMax[n - 1] = heights[n - 1]
  for (let i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], heights[i])

  const water = new Array(n).fill(0)
  let total = 0
  for (let i = 0; i < n; i++) {
    water[i] = Math.max(0, Math.min(leftMax[i], rightMax[i]) - heights[i])
    total += water[i]
  }
  return { water, total }
}

function randomHeights() {
  const n = Phaser.Math.Between(7, 11)
  const maxH = Phaser.Math.Between(4, 5)
  const h = Array.from({ length: n }, () => Phaser.Math.Between(0, maxH))
  h[0] = Phaser.Math.Between(2, maxH) // 左右两端保证有「墙」
  h[n - 1] = Phaser.Math.Between(2, maxH)
  return h
}

// 柱子布局参数（柱宽 / 无空隙）
const RAIN_BASE_Y = 320
const RAIN_UNIT = 22
const RAIN_BW = 36
const RAIN_GAP = 0

// 返回每根柱子的水平中心坐标
function barCenters(heights) {
  const totalW = heights.length * RAIN_BW + (heights.length - 1) * RAIN_GAP
  const start = 480 - totalW / 2 + RAIN_BW / 2
  return heights.map((_, i) => start + i * (RAIN_BW + RAIN_GAP))
}

export class RainTrapScene extends BaseMini {
  constructor() {
    super('RainTrap')
  }

  create() {
    this.backdrop()
    this.quitButton()
    this.title('TRAP RAIN WATER')
    this.subtitle('Hard Mode · 这些柱子之间能接住多少格雨水？')

    this.bars = null
    this.waterLayer = null
    this.answerButtons = []
    this.feedback = null
    this.solved = false

    this.loadPuzzle()
    this.button(650, 58, 140, 36, '换一题', () => this.loadPuzzle(), 0x2a2f31)
  }

  // 生成一套不重复的随机题目
  loadPuzzle() {
    let heights
    let water
    let total
    do {
      heights = randomHeights()
      const r = trapWater(heights)
      water = r.water
      total = r.total
    } while (total < 3) // 保证至少能接 3 格，题目更有意思

    this.currentTotal = total
    this.currentHeights = heights
    this.currentWater = water
    this.solved = false
    if (this.feedback) {
      this.feedback.destroy()
      this.feedback = null
    }
    if (this.waterLayer) {
      this.waterLayer.destroy()
      this.waterLayer = null
    }
    this.drawBars(heights)
    this.buildOptions(total)
  }

  drawBars(heights) {
    if (this.bars) this.bars.destroy()
    this.bars = this.add.container(0, 0)

    const centers = barCenters(heights)
    const totalW = heights.length * RAIN_BW + (heights.length - 1) * RAIN_GAP

    this.drawGrid(heights, totalW)

    // 地面基线
    this.bars.add(
      this.add.rectangle(480, RAIN_BASE_Y, totalW + 20, 5, 0x3a2f31).setOrigin(0.5, 0)
    )

    heights.forEach((h, i) => {
      const x = centers[i]
      // 柱子
      if (h > 0) {
        this.bars.add(
          this.add.rectangle(x, RAIN_BASE_Y, RAIN_BW, h * RAIN_UNIT, 0x6f5340).setOrigin(0.5, 1)
        )
        this.bars.add(
          this.add.rectangle(x, RAIN_BASE_Y - h * RAIN_UNIT, RAIN_BW, 3, 0x9a7355).setOrigin(0.5, 0)
        )
      }
    })
  }

  // 坐标网格线：横线标高度、竖线分隔列，帮玩家看清「一格」多大
  drawGrid(heights, totalW) {
    const n = heights.length
    const left = 480 - totalW / 2
    const right = 480 + totalW / 2
    const maxUnits = Math.max(...heights) + 1 // 顶部多留一格
    const gridColor = 0x4a3f42

    // 水平网格线 + 左侧高度刻度
    for (let k = 0; k <= maxUnits; k++) {
      const y = RAIN_BASE_Y - k * RAIN_UNIT
      this.bars.add(
        this.add.rectangle((left + right) / 2, y, totalW, 1, gridColor).setOrigin(0.5, 0.5)
      )
      this.bars.add(
        this.txt(left - 14, y, String(k), 11, '#8a8582').setOrigin(1, 0.5)
      )
    }

    // 垂直网格线（列边界）
    for (let j = 0; j <= n; j++) {
      const x = left + j * RAIN_BW
      this.bars.add(
        this.add.rectangle(x, RAIN_BASE_Y - maxUnits * RAIN_UNIT, 1, maxUnits * RAIN_UNIT, gridColor).setOrigin(0.5, 0)
      )
    }
  }

  // 答对后揭示积水
  revealWater() {
    if (this.waterLayer) this.waterLayer.destroy()
    this.waterLayer = this.add.container(0, 0)

    const heights = this.currentHeights
    const water = this.currentWater
    const centers = barCenters(heights)

    heights.forEach((h, i) => {
      const x = centers[i]
      if (water[i] > 0) {
        this.waterLayer.add(
          this.add.rectangle(x, RAIN_BASE_Y - h * RAIN_UNIT, RAIN_BW, water[i] * RAIN_UNIT, 0x3fa7d6).setOrigin(0.5, 1)
        )
        this.waterLayer.add(
          this.add.rectangle(x, RAIN_BASE_Y - (h + water[i]) * RAIN_UNIT, RAIN_BW, 3, 0x74c6ea).setOrigin(0.5, 0)
        )
      }
    })
  }

  buildOptions(total) {
    this.answerButtons.forEach((b) => {
      b.rect.destroy()
      b.t.destroy()
    })
    this.answerButtons = []

    // 正确答案 + 附近的干扰项，共 3 个
    const pool = new Set([total])
    for (const d of [-1, 1, -2, 2, -3, 3]) {
      const v = total + d
      if (v >= 0 && v !== total) pool.add(v)
    }
    const rest = Phaser.Utils.Array.Shuffle([...pool].filter((v) => v !== total))
    const options = Phaser.Utils.Array.Shuffle([total, ...rest.slice(0, 2)])

    const xs = [340, 480, 620]
    options.forEach((val, i) => {
      const b = this.button(xs[i], 450, 120, 46, String(val), () => this.answer(val), 0x3a2f31)
      this.answerButtons.push(b)
    })
  }

  answer(val) {
    if (this.solved) return
    if (val === this.currentTotal) {
      this.solved = true
      this.revealWater()
      this.feedback = this.txt(480, 175, '答对了！看，水是这样被接住的。', 14, '#7fd6a0', '"Noto Sans SC", sans-serif')
      this.time.delayedCall(1200, () => this.finish(true))
    } else {
      this.cameras.main.shake(80, 0.004)
      if (this.feedback) this.feedback.destroy()
      this.feedback = this.txt(480, 175, '再想想？', 13, '#ff8fb1')
    }
  }
}

// ============ 健身 · 坚持挑战 ============
export class FitnessScene extends BaseMini {
  constructor() {
    super('Fitness')
  }

  create() {
    this.backdrop()
    this.quitButton()
    this.title('KEEP GOING')
    this.subtitle('每次点击「打卡」坚持一天，撑到第 180 天。')

    this.day = 0
    this.add.rectangle(480, 250, 560, 26, 0x0e0a0b).setStrokeStyle(2, 0x3a2f31)
    this.bar = this.add.rectangle(200, 250, 0, 18, 0xff8fb1).setOrigin(0, 0.5)
    this.meter = this.txt(480, 300, 'Day 1', 18, '#9fd8ef')

    this.button(480, 360, 200, 60, '打卡', () => this.punch(), 0xff6b57)
  }

  punch() {
    this.day += 10
    if (this.day >= 180) this.day = 180
    this.bar.width = (this.day / 180) * 560
    this.meter.setText(`Day ${this.day}`)
    if (this.day === 180) {
      this.txt(480, 410, '半年后……“年卡结束了。”', 13, '#7fd6a0')
      this.time.delayedCall(900, () => this.finish(true))
    }
  }
}