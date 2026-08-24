import { gameState } from './state'
import { eventBus, EVT } from './eventBus'
import { FRAGMENTS, levelForCount } from './content'
import { music } from './audio'

// 根据已收集的碎片，把三个字的部件拼到 HUD 的名字提示里
export function updateNameHint() {
  const parts = [[], [], []]
  for (const f of FRAGMENTS) {
    if (gameState.fragments.includes(f.id)) parts[f.charIndex].push(f.glyph)
  }
  gameState.nameHint = parts.map((p) => (p.length ? p.join('') : '？'))
}

// 授予一个姓名碎片，并计算成长等级
export function grantFragment(id) {
  if (gameState.fragments.includes(id)) return false
  gameState.fragments.push(id)
  updateNameHint()
  const frag = FRAGMENTS.find((f) => f.id === id)
  eventBus.emit(EVT.FRAGMENT_GET, frag)
  recalcLevel()
  if (gameState.fragments.length >= gameState.totalFragments) {
    setTimeout(() => eventBus.emit(EVT.FINAL_QUEST), 900)
  }
  return true
}

export function recalcLevel() {
  const count = gameState.fragments.length
  const lv = levelForCount(count)
  if (gameState.level !== lv.name) {
    gameState.level = lv.name
    gameState.levelLabel = lv.label
    gameState.levelNote = lv.note
    eventBus.emit(EVT.LEVEL_UP, lv)
  } else {
    gameState.levelLabel = lv.label
    gameState.levelNote = lv.note
  }
}

// 兴趣森林：完成 4 项后授予「辰」的碎片
const ALL_INTERESTS = ['skate', 'guitar', 'swim', 'fitness']

export function completeInterest(key) {
  if (gameState.interests.includes(key)) return
  gameState.interests.push(key)
  if (key === 'guitar') {
    music.playArpeggio()
    eventBus.emit(EVT.TOAST, { text: '♪ 通关！一段记忆里的和弦响起', kind: 'info' })
  }
  if (ALL_INTERESTS.every((k) => gameState.interests.includes(k))) {
    grantFragment('chen_1')
  }
}