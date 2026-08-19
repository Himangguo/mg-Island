import { reactive } from 'vue'

// 游戏全局状态（Phaser 与 Vue 共享这一份响应式数据）
export const gameState = reactive({
  phase: 'title', // title | playing | minigame | reveal | ending

  // 认识度成长
  level: 1,
  levelLabel: 'Unknown',
  levelNote: '',

  // 姓名碎片
  totalFragments: 9,
  fragments: [], // 已收集的碎片 id
  nameHint: ['？', '？', '？'],

  // 兴趣森林：滑板 / 吉他 / 游泳 / 健身 是否已完成
  interests: [],

  // 对话
  dialogue: {
    open: false,
    speaker: '',
    text: '',
    choices: null, // [{ label, icon }] 或 null
    typing: false
  },

  // 顶部提示 toast
  toast: {
    open: false,
    text: '',
    kind: 'info' // info | fragment | level
  },

  // 小游戏
  minigame: {
    open: false,
    name: ''
  },

  controlsHint: 'WASD / 方向键 移动 · 空格 / E 互动'
})