import Phaser from 'phaser'
import { createIsland, TILE_SIZE, MAP_W, MAP_H, tileToWorld, LANDMARKS, LANDMARK_LABELS } from '../maps'
import { LANDMARK_ICON_FRAME, TILE } from '../assets'
import { CONTENT } from '../content'
import { DialogRunner } from '../DialogRunner'
import { eventBus, EVT } from '../eventBus'
import { gameState } from '../state'

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
    this.breakKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)

    // 提示气泡
    this.prompt = this.add
      .text(0, 0, 'E', { fontFamily: 'monospace', fontSize: '14px', color: '#ffe8b0' })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false)

    this.guideArrow = this.add
      .text(480, 54, '↑', {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: '#ffd76a',
        stroke: '#0e0a0b',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false)
    this.guideLabel = this.add
      .text(480, 84, '', {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        color: '#f5eede',
        backgroundColor: '#20181a',
        padding: { x: 9, y: 5 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false)

    this.interactables = []
    this.buildInteractables()
    this.catGuide = null

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
        eventBus.emit(EVT.TOAST, {
          text: '左上角的「发现手记」可以随时回顾你找到的线索。',
          kind: 'info'
        })
      }
    })
  }

  buildInteractables() {
    // 像素图标（内容交互点）
    for (const lm of LANDMARKS) {
      const pos = tileToWorld(lm.tx, lm.ty)
      const icon = this.add.sprite(pos.x, pos.y, 'landmarks', LANDMARK_ICON_FRAME[lm.key])
      icon.setDepth(3)
      this.tweens.add({ targets: icon, y: pos.y - 2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' })
      this.interactables.push({
        key: lm.key,
        dialogKey: lm.key,
        kind: 'gem',
        x: pos.x,
        y: pos.y,
        sprite: icon
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
    if (gameState.phase !== 'playing' || gameState.dialogue.open) {
      this.player.setVelocity(0)
      this.player.anims.stop()
      this.setGuideVisible(false)
      return
    }

    this.handleMovement()
    this.handleInteraction()
    this.handleBreak()
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

  handleBreak() {
    if (!Phaser.Input.Keyboard.JustDown(this.breakKey)) return
    const target = this.breakableInFront()
    if (!target) return

    const { tile, tileX, tileY } = target
    const x = (tileX + 0.5) * TILE_SIZE
    const y = (tileY + 0.5) * TILE_SIZE
    const color = tile.index === TILE.stone ? 0xb3ada4 : 0x79c143

    for (let i = 0; i < 7; i++) {
      const chip = this.add.rectangle(x, y, 4, 4, color).setDepth(12)
      this.tweens.add({
        targets: chip,
        x: x + Phaser.Math.Between(-20, 20),
        y: y + Phaser.Math.Between(-18, 12),
        alpha: 0,
        scale: 0.35,
        duration: 260,
        ease: 'Quad.out',
        onComplete: () => chip.destroy()
      })
    }

    this.ground.putTileAt(TILE.grass, tileX, tileY)
    this.cameras.main.shake(80, 0.002)
  }

  breakableInFront() {
    const direction =
      this.facing === 'up'
        ? { x: 0, y: -1 }
        : this.facing === 'down'
          ? { x: 0, y: 1 }
          : { x: this.flipX ? -1 : 1, y: 0 }
    const centerY = this.player.y - this.player.displayHeight / 2
    const tileX = Math.floor((this.player.x + direction.x * (TILE_SIZE + 2)) / TILE_SIZE)
    const tileY = Math.floor((centerY + direction.y * (TILE_SIZE + 2)) / TILE_SIZE)
    const tile = this.ground.getTileAt(tileX, tileY)
    const breakable = [TILE.tree, TILE.bush, TILE.stone]

    if (!tile || !breakable.includes(tile.index)) return null
    return { tile, tileX, tileY }
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
    if (it.kind === 'gem' && !gameState.exploredLandmarks.includes(it.key)) {
      gameState.exploredLandmarks.push(it.key)
    }
    if (it.kind === 'me' && gameState.fragments.length >= gameState.totalFragments) {
      gameState.phase = 'reveal'
      return
    }
    this.dialog.run(it.dialogKey)
  }

  updatePrompts() {
    const obstacle = this.breakableInFront()
    if (obstacle && !gameState.dialogue.open) {
      this.prompt
        .setText('F')
        .setPosition((obstacle.tileX + 0.5) * TILE_SIZE, (obstacle.tileY + 0.5) * TILE_SIZE - 16)
        .setVisible(true)
      return
    }

    const near = this.nearest()
    if (near && !gameState.dialogue.open && !gameState.dialogue.choices) {
      this.prompt.setText('E').setPosition(near.x, near.y - 26).setVisible(true)
    } else {
      this.prompt.setVisible(false)
    }
  }

  updateCat(delta) {
    if (!this.cat) return

    if (this.catGuide && gameState.exploredLandmarks.includes(this.catGuide.target.key)) {
      this.catGuide = null
      this.setGuideVisible(false)
    }

    if (this.catGuide) {
      const { target, label } = this.catGuide
      const playerDx = target.x - this.player.x
      const playerDy = target.y - this.player.y
      const playerDistance = Math.hypot(playerDx, playerDy)
      const catDx = target.x - this.cat.x
      const catDy = target.y - this.cat.y
      const catDistance = Math.hypot(catDx, catDy)

      this.guideArrow
        .setRotation(Math.atan2(playerDy, playerDx) + Math.PI / 2)
        .setVisible(true)
      this.guideLabel.setVisible(true)

      if (playerDistance < 24) {
        this.catGuide = null
        this.setGuideVisible(false)
        eventBus.emit(EVT.TOAST, {
          text: `豆泡带你到了「${label}」附近，按 E 完成探索。`,
          kind: 'info'
        })
      } else if (catDistance > 10) {
        const speed = 62
        this.cat.x += (catDx / catDistance) * speed * (delta / 1000)
        this.cat.y += (catDy / catDistance) * speed * (delta / 1000)
        this.cat.setFrame(1)
        this.cat.setFlipX(catDx < 0)
        this.syncCatEntry()
        return
      } else {
        this.cat.setFrame(0)
      }
    }

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

    this.syncCatEntry()
  }

  startCatGuide() {
    if (this.catGuide) {
      eventBus.emit(EVT.TOAST, { text: '豆泡正在带路，沿着箭头跟上它吧。', kind: 'info' })
      return
    }

    const candidates = this.interactables.filter(
      (item) => item.kind === 'gem' && !gameState.exploredLandmarks.includes(item.key)
    )
    if (!candidates.length) {
      eventBus.emit(EVT.TOAST, { text: '豆泡绕着你转了一圈：这座岛已经都逛过啦。', kind: 'info' })
      return
    }

    candidates.sort(
      (a, b) =>
        Phaser.Math.Distance.Between(this.player.x, this.player.y, a.x, a.y) -
        Phaser.Math.Distance.Between(this.player.x, this.player.y, b.x, b.y)
    )
    const target = candidates[0]
    const label = LANDMARK_LABELS[target.key] || target.key
    this.catGuide = { target, label }
    this.guideLabel.setText(`豆泡带路 · ${label}`)
    this.guideArrow.setVisible(true)
    this.guideLabel.setVisible(true)
    eventBus.emit(EVT.TOAST, { text: `豆泡出发了：跟着箭头去「${label}」看看。`, kind: 'info' })
  }

  setGuideVisible(visible) {
    this.guideArrow.setVisible(visible)
    this.guideLabel.setVisible(visible)
  }

  syncCatEntry() {
    if (!this.catEntry) return
    this.catEntry.x = this.cat.x
    this.catEntry.y = this.cat.y
  }

  startMini(id, onSuccess, onFail) {
    gameState.minigame = { open: true, name: id }
    gameState.phase = 'minigame'
    gameState.dialogue.open = false
    gameState.dialogue.choices = null
    this.pendingMini = { id, onSuccess, onFail }
    this.scene.pause('World')
    this.scene.launch(id)
  }
}
