import { gameState } from './state'
import { eventBus, EVT } from './eventBus'
import { grantFragment, completeInterest } from './progress'
import { LANDMARKS } from './maps'

// 对话脚本解释器：把 CONTENT 里的节点数组逐步执行，驱动 Vue 对话 UI 与小游戏
export class DialogRunner {
  constructor(scene) {
    this.scene = scene
    this.active = false
    this.nodes = []
    this.i = 0
    this.currentSpeaker = ''
    this.miniResult = null
    this.landmark = null
  }

  run(id) {
    const script = this.scene.content[id]
    if (!script) return
    this.landmark = LANDMARKS.find((item) => item.key === id) || null
    this.nodes = script.map((node) => {
      if (!node.sayByProfile) return node
      const text =
        node.sayByProfile[gameState.profile.personalityRoute] ||
        node.sayByProfile.default ||
        node.say
      return { ...node, say: text }
    })
    this.i = 0
    this.currentSpeaker = ''
    this.miniResult = null
    this.active = true
    gameState.phase = 'playing'
    this.step()
  }

  abort() {
    this.active = false
    this.nodes = []
    this.landmark = null
    gameState.dialogue.open = false
    gameState.dialogue.choices = null
    gameState.album.open = false
    gameState.album.key = ''
  }

  close() {
    this.active = false
    this.landmark = null
    gameState.dialogue.open = false
    gameState.dialogue.choices = null
  }

  finish() {
    const completion = this.landmark?.completion
    const goalMet =
      !completion ||
      (completion.fragment && gameState.fragments.includes(completion.fragment)) ||
      (completion.interest && gameState.interests.includes(completion.interest))

    if (
      this.landmark &&
      goalMet &&
      !gameState.completedLandmarks.includes(this.landmark.key)
    ) {
      const key = this.landmark.key
      gameState.completedLandmarks.push(key)
      this.scene.markLandmarkComplete?.(key)
    }
    this.close()
  }

  step() {
    if (!this.active) return
    while (this.i < this.nodes.length) {
      const node = this.nodes[this.i++]

      if (node.sayByMiniResult) {
        const text =
          node.sayByMiniResult[this.miniResult?.rank] ||
          node.sayByMiniResult.default ||
          node.say
        if (text != null) {
          if (node.speaker) this.currentSpeaker = node.speaker
          this._say(text)
          return
        }
      }

      if (node.say != null) {
        if (node.speaker) this.currentSpeaker = node.speaker
        this._say(node.say)
        return
      }

      if (node.choices) {
        this._choices(node.choices)
        return
      }

      if (node.album) {
        this._album(node.album)
        return
      }

      if (node.guide) {
        this.scene.startCatGuide()
        this.close()
        return
      }

      if (node.grant) grantFragment(node.grant)
      if (node.toast) this._toast(node.toast)
      if (node.interest) completeInterest(node.interest)

      if (node.mini) {
        this._mini(node.mini)
        return
      }

      if (node.end) {
        this.finish()
        return
      }
    }
    this.finish()
  }

  _say(text) {
    gameState.dialogue.open = true
    gameState.dialogue.speaker = this.currentSpeaker
    gameState.dialogue.text = text
    gameState.dialogue.choices = null
    eventBus.emit(EVT.DIALOGUE_OPEN)
    eventBus.once(EVT.DIALOGUE_NEXT, () => this.step())
  }

  _choices(options) {
    gameState.dialogue.open = true
    gameState.dialogue.choices = options.map((o) => o.text)
    eventBus.emit(EVT.SET_CHOICES)
    eventBus.once(EVT.DIALOGUE_CHOICE, ({ index }) => {
      gameState.dialogue.choices = null
      const chosen = options[index]
      if (chosen && chosen.remember) {
        gameState.profile[chosen.remember.key] = chosen.remember.value
      }
      if (chosen && chosen.do) {
        const rest = this.nodes.slice(this.i)
        this.nodes = [...chosen.do, ...rest]
        this.i = 0
      }
      this.step()
    })
  }

  _album(id) {
    gameState.dialogue.open = false
    gameState.dialogue.choices = null
    gameState.album.open = true
    gameState.album.key = id
    gameState.phase = 'album'
    eventBus.emit(EVT.ALBUM_OPEN, { id })
    eventBus.once(EVT.ALBUM_CLOSE, () => this.step())
  }

  _mini(id) {
    // 暂停世界，拉起小游戏；成功后继续脚本
    this.scene.startMini(
      id,
      (result) => {
        this.miniResult = result || null
        this.step()
      },
      () => this.abort()
    )
  }

  _toast(text) {
    eventBus.emit(EVT.TOAST, { text, kind: 'info' })
  }
}
