// 轻量事件总线：连接 Phaser（游戏）与 Vue（UI 覆盖层）
class EventBus {
  constructor() {
    this._handlers = new Map()
  }

  on(event, fn) {
    if (!this._handlers.has(event)) this._handlers.set(event, new Set())
    this._handlers.get(event).add(fn)
    return () => this.off(event, fn)
  }

  once(event, fn) {
    const off = this.on(event, (payload) => {
      off()
      fn(payload)
    })
    return off
  }

  off(event, fn) {
    const set = this._handlers.get(event)
    if (set) set.delete(fn)
  }

  emit(event, payload) {
    const set = this._handlers.get(event)
    if (set) set.forEach((fn) => fn(payload))
  }
}

export const eventBus = new EventBus()

// 事件名统一管理，避免拼写错误
export const EVT = {
  GAME_READY: 'game:ready',
  GAME_START: 'game:start',

  DIALOGUE_OPEN: 'dialogue:open',
  DIALOGUE_NEXT: 'dialogue:next',
  DIALOGUE_CLOSE: 'dialogue:close',
  DIALOGUE_CHOICE: 'dialogue:choice',

  SET_CHOICES: 'ui:set-choices',
  CLEAR_CHOICES: 'ui:clear-choices',

  FRAGMENT_GET: 'progress:fragment',
  LEVEL_UP: 'progress:level-up',

  TOAST: 'ui:toast',

  MINIGAME_START: 'minigame:start',
  MINIGAME_DONE: 'minigame:done',

  FINAL_QUEST: 'quest:final',
  ENDING: 'game:ending',
  RETRY: 'game:retry',

  INPUT_TOGGLE: 'ui:input-toggle'
}