import { gameState } from './state'
import { eventBus, EVT } from './eventBus'
import { grantFragment, completeInterest } from './progress'

// 对话脚本解释器：把 CONTENT 里的节点数组逐步执行，驱动 Vue 对话 UI 与小游戏
export class DialogRunner {
  constructor(scene) {
    this.scene = scene
    this.active = false
    this.nodes = []
    this.i = 0
    this.currentSpeaker = ''
  }

  run(id) {
    const script = this.scene.content[id]
    if (!script) return
    this.nodes = [...script]
    this.i = 0
    this.currentSpeaker = ''
    this.active = true
    gameState.phase = 'playing'
    this.step()
  }

  abort() {
    this.active = false
    this.nodes = []
    gameState.dialogue.open = false
    gameState.dialogue.choices = null
  }

  close() {
    this.active = false
    gameState.dialogue.open = false
    gameState.dialogue.choices = null
  }

  step() {
    if (!this.active) return
    while (this.i < this.nodes.length) {
      const node = this.nodes[this.i++]

      if (node.say != null) {
        if (node.speaker) this.currentSpeaker = node.speaker
        this._say(node.say)
        return
      }

      if (node.choices) {
        this._choices(node.choices)
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
        this.close()
        return
      }
    }
    this.close()
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
      if (chosen && chosen.do) {
        const rest = this.nodes.slice(this.i)
        this.nodes = [...chosen.do, ...rest]
        this.i = 0
      }
      this.step()
    })
  }

  _mini(id) {
    // 暂停世界，拉起小游戏；成功后继续脚本
    this.scene.startMini(id, () => this.step(), () => this.abort())
  }

  _toast(text) {
    eventBus.emit(EVT.TOAST, { text, kind: 'info' })
  }
}