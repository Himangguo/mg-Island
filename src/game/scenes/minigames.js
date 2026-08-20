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

// ============ 接雨水（LeetCode）============
export class RainTrapScene extends BaseMini {
  constructor() {
    super('RainTrap')
  }

  create() {
    this.backdrop()
    this.quitButton()
    this.title('TRAP RAIN WATER')
    this.subtitle('Hard Mode · 这些柱子能接住多少格雨水？')

    const heights = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
    const correct = 6
    this.drawBars(heights)

    this.button(290, 430, 120, 46, '4', () => this.answer(4, correct))
    this.button(480, 430, 120, 46, '6', () => this.answer(6, correct))
    this.button(670, 430, 120, 46, '8', () => this.answer(8, correct))
  }

  drawBars(heights) {
    const baseY = 320
    const bw = 30
    const gap = 14
    const totalW = heights.length * bw + (heights.length - 1) * gap
    let x = 480 - totalW / 2 + bw / 2
    heights.forEach((h) => {
      this.add.rectangle(x, baseY - (h * 20) / 2 + 10, bw - 6, h * 20 + 8, 0x6f5340).setOrigin(0.5)
      x += bw + gap
    })
  }

  answer(val, correct) {
    if (val === correct) {
      this.txt(480, 270, '“这道题，我曾经折腾了很久。”', 13, '#7fd6a0')
      this.time.delayedCall(900, () => this.finish(true))
    } else {
      this.cameras.main.shake(80, 0.004)
      this.txt(480, 270, '再想想？', 13, '#ff8fb1')
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