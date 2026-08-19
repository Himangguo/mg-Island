import Phaser from 'phaser'
import { createIsland, TILE_SIZE, MAP_W, MAP_H, tileToWorld, LANDMARKS, LANDMARK_LABELS } from '../maps'
import { CONTENT } from '../content'
import { DialogRunner } from '../DialogRunner'
import { eventBus, EVT } from '../eventBus'
import { gameState } from '../state'

const GEM_COLORS = {
  home_bed: 0xffd76a,
  home_album: 0xffd76a,
  ei_stone: 0x9fd8ef,
  studio: 0x62c7f0,
  studio_tech: 0x62c7f0,
  rain_mountain: 0xb0c4ff,
  skate: 0xff8fb1,
  guitar: 0xffb36a,
  swim: 0x3fa7d6,
  fitness: 0xff8fb1,
  arcade: 0xff6b57,
  yunnan: 0xffd76a,
  record: 0xc79bff,
  library: 0x7fd6a0
}

const IDLE_FRAME = { down: 0, up: 2, side: 4 }

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super('World')
  }

  create() {
    this.content = CONTENT
    this.dialog = new DialogRunner(this)

    const island = createIsland(this)
    this.ground = island.ground

    // 玩家
    const spawn = tileToWorld(24, 15)
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'player', 0)
    this.player.setOrigin(0.5, 1)
    this.player.setSize(10, 9)
    this.player.setDepth(10)
    this.player.setCollideWorldBounds(true)
    this.physics.add.collider(this.player, this.ground)
    this.physics.world.setBounds(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE)

    // 相机
    const cam = this.cameras.main
    cam.setBounds(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE)
    cam.startFollow(this.player, true, 0.12, 0.12)
    cam.setZoom(2)

    // 动画
    const fr = (key, a, b) => this.anims.generateFrameNumbers(key, { start: a, end: b })
    this.anims.create({ key: 'p-down', frames: fr('player', 0, 1), frameRate: 6, repeat: -1 })
    this.anims.create({ key: 'p-up', frames: fr('player', 2, 3), frameRate: 6, repeat: -1 })
    this.anims.create({ key: 'p-side', frames: fr('player', 4, 5), frameRate: 6, repeat: -1 })

    this.facing = 'down'
    this.flipX = false

    // 输入
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys('W,A,S,D')
    this.interactKey = this.input.keyboard.addKeys('SPACE,E')

    // 提示气泡
    this.prompt = this.add
      .text(0, 0, 'E', { fontFamily: 'monospace', fontSize: '14px', color: '#ffe8b0' })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false)

    this.interactables = []
    this.buildInteractables()

    // 姓名提示对象：只在收集满时由 Vue 显示，这里不处理
    this.pendingMini = null

    // 监听小游戏结束
    eventBus.on(EVT.MINIGAME_DONE, ({ id, success }) => {
      if (!this.pendingMini) return
      const p = this.pendingMini
      this.pendingMini = null
      this.scene.resume('World')
      gameState.minigame.open = false
      gameState.phase = 'playing'
      if (success) p.onSuccess()
      else p.onFail()
    })

    // 入场提示
    this.time.delayedCall(600, () => {
      if (gameState.phase === 'playing') {
        eventBus.emit(EVT.TOAST, { text: '你来到了一座小岛。四处逛逛吧。', kind: 'info' })
      }
    })
  }

  buildInteractables() {
    // 宝石（内容交互点）
    for (const lm of LANDMARKS) {
      const pos = tileToWorld(lm.tx, lm.ty)
      const gem = this.add.sprite(pos.x, pos.y, 'gem').setTint(GEM_COLORS[lm.key] || 0xffffff)
      gem.setDepth(3)
      const label = this.add
        .text(pos.x, pos.y - 16, LANDMARK_LABELS[lm.key] || lm.key, {
          fontFamily: '"Noto Sans SC", sans-serif',
          fontSize: '9px',
          color: '#ffe8b0'
        })
        .setOrigin(0.5, 1)
        .setStroke('#20181a', 3)
        .setDepth(4)
      this.tweens.add({ targets: gem, y: pos.y - 2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
      this.interactables.push({
        key: lm.key,
        dialogKey: lm.key,
        kind: 'gem',
        x: pos.x,
        y: pos.y,
        sprite: gem,
        label
      })
    }

    // NPC「角色」（中央广场的神秘人）
    const mePos = tileToWorld(22, 15)
    this.me = this.add.sprite(mePos.x, mePos.y, 'npc', 0).setOrigin(0.5, 1)
    this.me.setDepth(5)
    this.interactables.push({ key: 'npc_me', dialogKey: 'npc_me', kind: 'me', x: mePos.x, y: mePos.y, sprite: this.me })

    // 猫「豆泡」（跟随玩家，也是可互动对象）
    const catPos = tileToWorld(24, 15)
    this.cat = this.add.sprite(catPos.x, catPos.y, 'cat', 0).setOrigin(0.5, 1)
    this.cat.setDepth(6)
    this.catEntry = { key: 'cat', dialogKey: 'home_cat', kind: 'cat', x: catPos.x, y: catPos.y, sprite: this.cat }
    this.interactables.push(this.catEntry)
  }

  update(time, delta) {
    this.updatePrompts()
    if (gameState.phase !== 'playing') {
      this.player.setVelocity(0)
      this.player.anims.stop()
      return
    }

    this.handleMovement()
    this.handleInteraction()
    this.updateCat(delta)
  }

  handleMovement() {
    const c = this.cursors
    const k = this.wasd
    const left = c.left.isDown || k.A.isDown
    const right = c.right.isDown || k.D.isDown
    const up = c.up.isDown || k.W.isDown
    const down = c.down.isDown || k.S.isDown

    let vx = 0
    let vy = 0
    if (left) {
      vx = -1
      this.facing = 'side'
      this.flipX = true
    } else if (right) {
      vx = 1
      this.facing = 'side'
      this.flipX = false
    }
    if (up) {
      vy = -1
      if (!left && !right) this.facing = 'up'
    } else if (down) {
      vy = 1
      if (!left && !right) this.facing = 'down'
    }

    const speed = 95
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071
      vy *= 0.7071
    }
    this.player.setVelocity(vx * speed, vy * speed)
    this.player.setFlipX(this.flipX)

    if (vx !== 0 || vy !== 0) {
      this.player.play(`p-${this.facing}`, true)
    } else {
      this.player.anims.stop()
      this.player.setTexture('player', IDLE_FRAME[this.facing])
    }
  }

  handleInteraction() {
    if (Phaser.Input.Keyboard.JustDown(this.interactKey.SPACE) || Phaser.Input.Keyboard.JustDown(this.interactKey.E)) {
      const near = this.nearest()
      if (near) this.handleInteract(near)
    }
  }

  nearest() {
    let best = null
    let bestD = Infinity
    for (const it of this.interactables) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, it.x, it.y - 6)
      if (d < 30 && d < bestD) {
        best = it
        bestD = d
      }
    }
    return best
  }

  handleInteract(it) {
    if (it.kind === 'me' && gameState.fragments.length >= gameState.totalFragments) {
      gameState.phase = 'reveal'
      return
    }
    this.dialog.run(it.dialogKey)
  }

  updatePrompts() {
    const near = this.nearest()
    if (near && !gameState.dialogue.open && !gameState.dialogue.choices) {
      this.prompt.setPosition(near.x, near.y - 26).setVisible(true)
    } else {
      this.prompt.setVisible(false)
    }
  }

  updateCat(delta) {
    if (!this.cat) return
    const dx = this.player.x - this.cat.x
    const dy = this.player.y - this.cat.y
    const d = Math.hypot(dx, dy)
    if (d > 44) {
      const speed = 60
      this.cat.x += (dx / d) * speed * (delta / 1000)
      this.cat.y += (dy / d) * speed * (delta / 1000)
      this.cat.setFrame(1)
    } else {
      this.cat.setFrame(0)
    }
    if (this.cat.x > this.player.x) this.cat.setFlipX(false)
    else if (this.cat.x < this.player.x) this.cat.setFlipX(true)

    // 同步互动点的坐标，让「喵」的交互跟随到猫当前的位置
    if (this.catEntry) {
      this.catEntry.x = this.cat.x
      this.catEntry.y = this.cat.y
    }
  }

  startMini(id, onSuccess, onFail) {
    gameState.minigame = { open: true, name: id }
    gameState.phase = 'minigame'
    this.pendingMini = { id, onSuccess, onFail }
    this.scene.pause('World')
    this.scene.launch(id)
  }
}