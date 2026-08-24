// 全部游戏内容：姓名碎片、成长等级、NPC 对话脚本、小游戏元数据

export const TOTAL_FRAGMENTS = 9

// 三个字「周 学 辰」，各有 3 个碎片。charIndex 0/1/2。
// 玩家只见进度，永远看不到真正的字，直到最终揭晓。
export const FRAGMENTS = [
  { id: 'zhou_1', charIndex: 0, label: '认识', glyph: '冂' },
  { id: 'zhou_2', charIndex: 0, label: '生活', glyph: '土' },
  { id: 'zhou_3', charIndex: 0, label: '性格', glyph: '口' },
  { id: 'xue_1', charIndex: 1, label: '工作', glyph: '⺍' },
  { id: 'xue_2', charIndex: 1, label: '算法', glyph: '冖' },
  { id: 'xue_3', charIndex: 1, label: '技术', glyph: '子' },
  { id: 'chen_1', charIndex: 2, label: '兴趣', glyph: '厂' },
  { id: 'chen_2', charIndex: 2, label: '游戏', glyph: '二' },
  { id: 'chen_3', charIndex: 2, label: '旅行', glyph: '衣' }
]

// 认识度等级：随着收集的碎片数量成长
export const LEVELS = [
  { min: 0, name: 'LV.1', label: 'Unknown', note: '你还不认识这个人。' },
  { min: 2, name: 'LV.2', label: '开始认识这个人', note: '你知道他有点三分钟热度，但一直在尝试。' },
  { min: 5, name: 'LV.3', label: 'You know me a little.', note: '前端工程师 · 猫奴 · 游戏玩家 · 周杰伦。' },
  { min: 9, name: 'LV.MAX', label: '你终于认识了他。', note: '也许，认识一个人从来不是靠简历。' }
]

export function levelForCount(count) {
  let lv = LEVELS[0]
  for (const l of LEVELS) {
    if (count >= l.min) lv = l
  }
  return lv
}

// 小游戏元数据（Vue 覆盖层提示 & 场景名）
export const MINIGAMES = {
  BugHunter: { title: '🐛 Bug Hunter', hint: '找出三个 Bug：CSS / JS / UI，点错了会被扣分' },
  AimChallenge: { title: '🎮 Aim Challenge', hint: '点击不断出现的目标，打进一定分数' },
  Swim: { title: '🏊 50m 自由泳', hint: '连续快速按「空格」或点画面，保持游泳直到 50m' },
  Chord: { title: '🎹 旋律琴键', hint: '照谱弹出单音旋律' },
  Ollie: { title: '🛹 Ollie Challenge', hint: '按「空格」跳过石头，别被绊倒' },
  RainTrap: { title: '🧠 接雨水', hint: '拖动柱子到正确位置，让雨水被接住' },
  Fitness: { title: '💪 坚持挑战', hint: '疯狂点「打卡」，坚持到 180 天' }
}

// —— 对话脚本 ——
// 节点类型：
//   { say }   { speaker }   { choices:[{text,do}] }  { grant }  { toast }
//   { mini }  { interest }  { end }  { note }
export const CONTENT = {
  npc_me: [
    { speaker: '？？？', say: '你好。' },
    { say: '等等……' },
    { say: '你是来干嘛的？' },
    { say: '如果你想认识我，就自己逛逛吧。' },
    {
      choices: [
        {
          text: '你叫什么名字？',
          do: [{ say: '……' }, { say: '你自己找。' }, { toast: '目标出现：在岛上找出他的名字。' }]
        },
        {
          text: '这里是什么地方？',
          do: [{ say: '一座岛。' }, { say: '一座关于我的岛。' }]
        }
      ]
    },
    { grant: 'zhou_1' }
  ],

  home_bed: [
    { speaker: '豆泡', say: '喵。' },
    { speaker: '你', say: '这里每天晚上都会有一个小家伙睡在这。' },
    { say: '豆泡——一只 4 岁的银渐层，脾气好到不行，每天都陪我一起睡。' },
    { toast: '你更了解他了：他有一只猫，叫豆泡。' },
    { grant: 'zhou_2' }
  ],

  home_album: [
    { speaker: '你', say: '你翻开相册。' },
    { say: '里面是一些日常的、安静的片段。' },
    { say: '没有刻意的摆拍，都是些「当时的自己」。' }
  ],

  home_cat: [{ speaker: '豆泡', say: '喵。' }],

  ei_stone: [
    { speaker: '你', say: '路边立着一块小石头，刻着一行字。' },
    { speaker: '性格石', say: '我的 E / I，取决于你是谁。' },
    {
      choices: [
        {
          text: '主动攀谈（外向）',
          do: [
            { say: '（石头微微发亮）' },
            { speaker: '他', say: '和聊得来的人在一起，我其实挺 E 的。' }
          ]
        },
        {
          text: '默默观察（内向）',
          do: [
            { say: '在陌生人面前，我更习惯先观察。' },
            { say: '话少，不代表冷漠。' }
          ]
        }
      ]
    },
    { toast: '你更了解他了：他的性格会因人而异。' },
    { grant: 'zhou_3' }
  ],

  studio: [
    { speaker: '你', say: '你推开工作室的门。' },
    { say: '桌上堆着电脑、咖啡、键盘，还有一只……在爬的 Bug？' },
    { say: '电脑屏幕突然跳出一行字。' },
    { speaker: '终端', say: 'SYSTEM ERROR' },
    {
      choices: [
        {
          text: '开始 Debug',
          do: [
            { mini: 'BugHunter' },
            { speaker: '他', say: '谢了。这就是我平时工作的东西。' },
            { toast: '你更了解他了：他是一名前端工程师。' },
            { grant: 'xue_1' }
          ]
        },
        { text: '先看看', do: [{ say: '你决定先在工作室里转转。' }] }
      ]
    }
  ],

  studio_tech: [
    { speaker: '你', say: '墙上贴着一张潦草的清单。' },
    { say: 'HTML / CSS / JavaScript / Vue / Phaser…' },
    { say: '前端这件事，他好像挺较真的。' },
    { toast: '你更了解他了：他是一名前端工程师。' },
    { grant: 'xue_3' }
  ],

  rain_mountain: [
    { speaker: '你', say: '你爬上一座正在下雨的山。' },
    { say: '山顶立着一块牌子：「Hard Mode · 接雨水」。' },
    { say: '雨水要怎样，才能被柱子接住？' },
    {
      choices: [
        {
          text: '试一试',
          do: [
            { mini: 'RainTrap' },
            { speaker: '他', say: '这道题，我曾经折腾了很久。' },
            { toast: '你发现了他的秘密：他刷 LeetCode。' },
            { grant: 'xue_2' }
          ]
        },
        { text: '不想爬山', do: [{ say: '你绕开了这座山。' }] }
      ]
    }
  ],

  skate: [
    { speaker: '你', say: '你捡起一块滑板。' },
    { say: '（做一个 Ollie 跳过石头？）' },
    {
      choices: [
        {
          text: '试试 Ollie',
          do: [
            { mini: 'Ollie' },
            { speaker: '他', say: '我会 Ollie。' },
            { say: '不过，也就会这一点。' },
            { interest: 'skate' }
          ]
        },
        { text: '放下', do: [{ say: '你放下了滑板。' }] }
      ]
    }
  ],

  guitar: [
    { speaker: '你', say: '你抱起一把吉他。' },
    { say: '就几个单音，能连成一段旋律。' },
    {
      choices: [
        {
          text: '来一段',
          do: [
            { mini: 'Chord' },
            { speaker: '他', say: '是不是有那么一点熟悉这个旋律？' },
            { interest: 'guitar' }
          ]
        },
        { text: '算了', do: [{ say: '他的手有点僵。' }] }
      ]
    }
  ],

  swim: [
    { speaker: '你', say: '海边放着一副游泳镜。' },
    { say: '（游到 50 米试试？）' },
    {
      choices: [
        {
          text: '跳下去',
          do: [
            { mini: 'Swim' },
            { speaker: '他', say: '不行了。' },
            { say: '（他沉了下去）' },
            { interest: 'swim' }
          ]
        },
        { text: '不下水', do: [{ say: '海水有点凉。' }] }
      ]
    }
  ],

  fitness: [
    { speaker: '你', say: '一张健身房的年卡。' },
    { say: 'Day 1 … Day 2 … Day 3 ……' },
    { say: '他到底坚持了多久？' },
    {
      choices: [
        {
          text: '打卡',
          do: [
            { mini: 'Fitness' },
            { speaker: '他', say: '年卡结束了。' },
            { say: '半年，说长不长，说短不短。' },
            { interest: 'fitness' }
          ]
        },
        { text: '跳过', do: [{ say: '你不想出汗。' }] }
      ]
    }
  ],

  arcade: [
    { speaker: '你', say: '你走进游戏厅。' },
    { say: '屏幕上亮着一串字：AIM CHALLENGE。' },
    { say: '（他平时玩的，是无畏契约。）' },
    {
      choices: [
        {
          text: '开一局',
          do: [
            { mini: 'AimChallenge' },
            { speaker: '他', say: '还行。' },
            { say: '别看了，我平时没这么菜。' },
            { grant: 'chen_2' }
          ]
        },
        { text: '不玩', do: [{ say: '你只是看了看。' }] }
      ]
    }
  ],

  yunnan: [
    { speaker: '你', say: '路边停着一辆「跟团游」大巴。' },
    { say: '（这是一次关于云南的旅行？）' },
    {
      choices: [
        {
          text: '上车',
          do: [
            { speaker: '导游', say: '大家醒一醒，坐好。' },
            {
              choices: [
                { text: '睡觉', do: [{ speaker: '导游', say: '不允许睡觉。' }] },
                { text: '听讲', do: [{ speaker: '导游', say: '白银要不要？玉要不要？' }, { say: '（……）' }] }
              ]
            },
            { say: '这是他的第一次跟团旅行。' },
            { say: '也是他对「跟团」印象最深的一次。' },
            { toast: '你更了解他了：他在云南踩过坑。' },
            { grant: 'chen_3' }
          ]
        },
        { text: '不上车', do: [{ say: '你觉得自由行更好。' }] }
      ]
    }
  ],

  record: [
    { speaker: '你', say: '你走进一家唱片店。' },
    { say: '唱针落下，是《时光机》和《搁浅》。' },
    { speaker: '唱片机', say: '♪ …' },
    { speaker: '他', say: '有些歌不是因为好听才记住。' },
    { say: '而是因为那个时候的自己。' },
    { toast: '你更了解他了：他喜欢周杰伦。' }
  ],

  library: [
    { speaker: '你', say: '记忆图书馆。' },
    { say: '三本翻旧了的书：' },
    { say: '《天气之子》《仙逆》《凡人修仙传》。' },
    { say: '他说，喜欢一部作品，是因为能在里面看到一点自己。' }
  ]
}