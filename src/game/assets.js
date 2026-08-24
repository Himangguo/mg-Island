import { PALETTE } from './palette'

// ================= 像素纹理生成 =================
// 所有贴图都在运行时用 Canvas 绘制，无需外部图片资源

const TILE_SIZE = 16

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function ctx2d(c) {
  const ctx = c.getContext('2d')
  ctx.imageSmoothingEnabled = false
  return ctx
}

// 画单个像素
function p(ctx, x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, 1, 1)
}
// 画矩形
function r(ctx, x, y, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

// ---------- 地面/地形 tiles（16x16） ----------
function drawGrass(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.grass)
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const n = (x * 7 + y * 13) % 23
      if (n === 0) p(ctx, x, y, PALETTE.grassDark)
      else if (n === 6) p(ctx, x, y, PALETTE.grassLight)
    }
  }
}
function drawGrassDark(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.grassDark)
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const n = (x * 5 + y * 11) % 19
      if (n === 0) p(ctx, x, y, PALETTE.grass)
      else if (n === 4) p(ctx, x, y, PALETTE.grassTuft)
    }
  }
}
function drawGrassFlower(ctx) {
  drawGrass(ctx)
  r(ctx, 7, 10, 1, 4, PALETTE.grassDark) // 茎
  p(ctx, 7, 7, PALETTE.flower)
  p(ctx, 8, 6, PALETTE.flower)
  p(ctx, 6, 6, PALETTE.flower)
  p(ctx, 7, 6, PALETTE.flowerCore)
}
function drawPath(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.path)
  r(ctx, 0, 0, 16, 2, PALETTE.sand)
  for (let y = 4; y < 16; y += 3) {
    for (let x = (y / 3) % 2; x < 16; x += 4) p(ctx, x, y, PALETTE.pathEdge)
  }
}
function drawSand(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.sand)
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const n = (x * 9 + y * 7) % 17
      if (n === 0) p(ctx, x, y, PALETTE.sandDark)
    }
  }
}
function drawWater(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.water)
  for (let y = 0; y < 16; y += 4) {
    p(ctx, (y * 3) % 16, y, PALETTE.waterLight)
    p(ctx, ((y + 2) * 5) % 16, y + 1, PALETTE.waterLight)
    p(ctx, ((y + 4) * 7) % 16, y + 2, PALETTE.waterDeep)
  }
}
function drawWaterDeep(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.waterDeep)
  r(ctx, 0, 0, 16, 2, PALETTE.foam) // 浪花边
}

// ---------- 建筑/物件 tiles ----------
function drawWall(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.wall)
  for (let x = 3; x < 16; x += 4) r(ctx, x, 0, 1, 16, PALETTE.wallDark)
  r(ctx, 0, 0, 16, 1, PALETTE.wallLight)
  r(ctx, 0, 15, 16, 1, PALETTE.wallDark)
}
function drawRoof(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.roof)
  for (let y = 2; y < 16; y += 3) r(ctx, 0, y, 16, 1, PALETTE.roofDark)
  r(ctx, 0, 0, 16, 1, PALETTE.roofLight)
}
function drawDoor(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.wall)
  r(ctx, 4, 4, 8, 12, PALETTE.door)
  r(ctx, 4, 4, 8, 1, PALETTE.wallLight)
  p(ctx, 10, 10, '#ffd76a') // 门把手
}
function drawWindow(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.wall)
  r(ctx, 4, 5, 8, 7, PALETTE.windowFrame)
  r(ctx, 5, 6, 6, 5, PALETTE.window)
  r(ctx, 8, 6, 1, 5, PALETTE.windowFrame)
}
function drawBush(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.grass)
  r(ctx, 3, 6, 10, 7, PALETTE.bush)
  r(ctx, 2, 7, 12, 5, PALETTE.bush)
  r(ctx, 5, 5, 6, 2, PALETTE.treeLight)
  p(ctx, 6, 6, PALETTE.treeLight)
}
function drawTree(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.grass)
  r(ctx, 7, 10, 2, 6, PALETTE.trunk)
  r(ctx, 3, 4, 10, 8, PALETTE.tree)
  r(ctx, 2, 5, 12, 6, PALETTE.tree)
  r(ctx, 5, 3, 6, 3, PALETTE.tree)
  for (let y = 5; y < 12; y += 3) for (let x = 4; x < 12; x += 4) p(ctx, x, y, PALETTE.treeLight)
}
function drawStone(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.grass)
  r(ctx, 3, 7, 10, 6, PALETTE.stone)
  r(ctx, 3, 7, 10, 2, '#c4bfba')
  r(ctx, 3, 7, 1, 6, PALETTE.stoneDark)
}
function drawFence(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.grass)
  r(ctx, 2, 5, 2, 8, PALETTE.fence)
  r(ctx, 7, 5, 2, 8, PALETTE.fence)
  r(ctx, 12, 5, 2, 8, PALETTE.fence)
  r(ctx, 1, 7, 14, 2, PALETTE.fence)
  r(ctx, 1, 11, 14, 2, PALETTE.fenceDark)
}
function drawSign(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.grass)
  r(ctx, 7, 7, 2, 9, PALETTE.sign)
  r(ctx, 3, 2, 10, 6, PALETTE.signBoard)
  r(ctx, 4, 3, 8, 4, '#ffe8b0')
  p(ctx, 6, 4, PALETTE.sign)
  p(ctx, 8, 4, PALETTE.sign)
  p(ctx, 6, 6, PALETTE.sign)
  p(ctx, 8, 6, PALETTE.sign)
}
function drawMonitor(ctx) {
  r(ctx, 0, 0, 16, 16, PALETTE.wall)
  r(ctx, 2, 2, 12, 8, '#2a2a33')
  r(ctx, 3, 3, 10, 6, '#3fa7d6')
  r(ctx, 5, 5, 5, 2, '#d9f1fb')
  p(ctx, 6, 6, '#ff6b57') // 屏幕上的 Bug
  p(ctx, 9, 11, '#ff6b57')
  r(ctx, 6, 10, 4, 2, PALETTE.wallDark)
}

const TILE_DRAWERS = [
  drawGrass,
  drawGrassDark,
  drawGrassFlower,
  drawPath,
  drawSand,
  drawWater,
  drawWaterDeep,
  drawWall,
  drawRoof,
  drawDoor,
  drawWindow,
  drawBush,
  drawTree,
  drawStone,
  drawFence,
  drawSign,
  drawMonitor
]

// 瓷砖名称 -> 索引（0 起）
export const TILE = {
  grass: 0,
  grassDark: 1,
  grassFlower: 2,
  path: 3,
  sand: 4,
  water: 5,
  waterDeep: 6,
  wall: 7,
  roof: 8,
  door: 9,
  window: 10,
  bush: 11,
  tree: 12,
  stone: 13,
  fence: 14,
  sign: 15,
  monitor: 16
}

// ---------- 角色（程序化像素小人，16x18） ----------
const CHAR_W = 16
const CHAR_H = 18

function drawChibi(ctx, o) {
  const { hair, shirtDark, shirt, skin, facing, frame } = o
  // 头部 / 脸
  r(ctx, 4, 4, 8, 7, skin)
  // 头发
  if (facing === 'up') {
    r(ctx, 3, 2, 10, 5, hair)
    r(ctx, 3, 2, 1, 7, hair)
    r(ctx, 12, 2, 1, 7, hair)
  } else if (facing === 'side') {
    r(ctx, 3, 2, 10, 3, hair)
    r(ctx, 3, 2, 1, 8, hair)
    r(ctx, 12, 2, 1, 6, hair)
  } else {
    r(ctx, 3, 2, 10, 3, hair)
    r(ctx, 3, 2, 1, 8, hair)
    r(ctx, 12, 2, 1, 8, hair)
  }
  // 眼睛 / 嘴
  if (facing === 'down') {
    p(ctx, 6, 7, '#2a2a33')
    p(ctx, 10, 7, '#2a2a33')
    p(ctx, 8, 9, '#a8483c')
  } else if (facing === 'side') {
    p(ctx, 10, 7, '#2a2a33')
  }
  // 身体
  r(ctx, 5, 11, 6, 3, shirt)
  r(ctx, 5, 12, 6, 1, shirtDark)
  // 手臂
  r(ctx, 4, 11, 1, 3, skin)
  r(ctx, 11, 11, 1, 3, skin)
  // 腿（走动时交替）
  if (frame === 0) {
    r(ctx, 5, 14, 2, 3, shirtDark)
    r(ctx, 9, 14, 2, 3, shirtDark)
  } else {
    r(ctx, 4, 14, 2, 3, shirtDark)
    r(ctx, 10, 14, 2, 3, shirtDark)
  }
  // 鞋
  r(ctx, 5, 17, 2, 1, '#2a2a33')
  r(ctx, 9, 17, 2, 1, '#2a2a33')
}

function chibiCanvases(opts) {
  return ['down', 'up', 'side'].map((facing) =>
    [0, 1].map((frame) => {
      const c = makeCanvas(CHAR_W, CHAR_H)
      drawChibi(ctx2d(c), { ...opts, facing, frame })
      return c
    })
  ).flat()
}

// ---------- 猫（银渐层「豆泡」，16x16） ----------
const CAT_W = 16
const CAT_H = 16
function drawCat(ctx, frame) {
  const coat = '#dcd8d1'
  const coatDark = '#b3ada4'
  // 身体
  r(ctx, 3, 6, 10, 8, coat)
  r(ctx, 4, 14, 2, 2, coatDark)
  r(ctx, 10, 14, 2, 2, coatDark)
  // 头 + 耳朵
  r(ctx, 4, 3, 8, 6, coat)
  r(ctx, 5, 1, 2, 3, coat)
  r(ctx, 9, 1, 2, 3, coat)
  p(ctx, 5, 2, '#f0a0a0')
  p(ctx, 10, 2, '#f0a0a0')
  // 眼睛 / 鼻子
  if (frame === 0) {
    p(ctx, 6, 5, '#5a8a3a')
    p(ctx, 10, 5, '#5a8a3a')
  } else {
    p(ctx, 6, 5, '#2a2a33')
    p(ctx, 10, 5, '#2a2a33')
  }
  p(ctx, 8, 7, '#f0a0a0')
  // 尾巴
  r(ctx, 13, 4, 2, 3, coatDark)
  r(ctx, 13, 6, 3, 1, coatDark)
}

// ---------- 可交互点「宝石」标记（16x16） ----------
function drawGem(ctx) {
  ctx.clearRect(0, 0, 16, 16)
  const c = [
    [8, 1],
    [5, 4],
    [6, 4],
    [3, 8],
    [5, 11],
    [8, 15],
    [11, 11],
    [13, 8],
    [10, 4],
    [11, 4]
  ]
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  c.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
  ctx.fill()
}

// ---------- 地标像素图标（16x16） ----------
// 用色块 + 像素拼出每个地标的形状，替代纯文字标签。
const IC = {
  outline: '#20181a',
  dark: '#2a2a33',
  white: '#ffffff',
  grey: '#a8a29e',
  greyDark: '#7c7672',
  red: '#ff6b57',
  yellow: '#ffd76a',
  blue: '#4aa8e0',
  blueDark: '#3789c0',
  cyan: '#62c7f0',
  green: '#79c143',
  greenDark: '#4b9a4e',
  pink: '#ff8fb1',
  wood: '#c8965a',
  woodDark: '#8a5a3a',
  brown: '#5b3b2a',
  roof: '#cf6354',
  roofDark: '#a8483c',
  sand: '#f0dfa0'
}

function drawBedIcon(c) {
  r(c, 2, 2, 12, 3, IC.woodDark) // 床头板
  r(c, 2, 5, 12, 2, IC.white) // 枕头
  r(c, 2, 7, 12, 7, IC.green) // 被子
  for (let i = 0; i < 3; i++) r(c, 2 + i * 4, 7, 2, 7, IC.greenDark) // 被子条纹
  r(c, 2, 14, 12, 1, IC.woodDark) // 床尾板
  r(c, 3, 15, 2, 1, IC.dark) // 腿
  r(c, 11, 15, 2, 1, IC.dark)
}

function drawAlbumIcon(c) {
  r(c, 1, 1, 14, 14, IC.white) // 相纸白边
  r(c, 2, 2, 12, 9, IC.cyan) // 天空
  r(c, 9, 3, 3, 3, IC.yellow) // 太阳
  r(c, 2, 7, 12, 4, IC.green) // 山丘
  r(c, 5, 8, 4, 2, IC.greenDark) // 山阴影
  r(c, 2, 11, 12, 4, IC.white) // 底部留白
}

function drawStoneIcon(c) {
  r(c, 3, 5, 10, 8, IC.grey)
  r(c, 2, 6, 12, 6, IC.grey) // 圆石
  r(c, 3, 5, 1, 5, IC.greyDark) // 阴影
  r(c, 3, 5, 10, 1, IC.white) // 高光
  // 心形刻痕
  p(c, 7, 8, IC.red); p(c, 8, 8, IC.red)
  p(c, 6, 9, IC.red); p(c, 7, 9, IC.red); p(c, 8, 9, IC.red); p(c, 9, 9, IC.red)
  p(c, 7, 10, IC.red); p(c, 8, 10, IC.red)
}

function drawStudioIcon(c) {
  r(c, 2, 3, 12, 9, IC.dark) // 屏幕边框
  r(c, 3, 4, 10, 7, IC.cyan) // 屏幕
  r(c, 6, 5, 2, 3, IC.red) // Bug 身体
  r(c, 9, 5, 2, 3, IC.red)
  p(c, 8, 6, IC.dark) // 触须
  r(c, 7, 10, 2, 2, IC.greyDark) // 底座
  r(c, 5, 12, 6, 1, IC.greyDark)
}

function drawBoardIcon(c) {
  r(c, 2, 3, 12, 10, IC.white) // 看板
  r(c, 2, 3, 12, 2, IC.blue) // 标题栏
  r(c, 3, 6, 1, 6, IC.pink) // 第一列卡片
  r(c, 6, 6, 1, 4, IC.green)
  r(c, 9, 6, 1, 7, IC.yellow)
  r(c, 2, 13, 12, 1, IC.grey) // 底部
}

function drawMountainIcon(c) {
  r(c, 2, 1, 5, 3, IC.white) // 云
  r(c, 5, 0, 4, 2, IC.white)
  p(c, 4, 5, IC.blue); p(c, 7, 5, IC.blue); p(c, 3, 7, IC.blue) // 雨
  r(c, 4, 9, 8, 5, IC.green) // 山体
  r(c, 3, 10, 10, 4, IC.green)
  r(c, 3, 14, 10, 1, IC.green)
  r(c, 6, 7, 4, 2, IC.white) // 雪顶
  r(c, 7, 6, 2, 2, IC.white)
}

function drawSkateIcon(c) {
  r(c, 2, 6, 12, 3, IC.red) // 板面
  p(c, 1, 7, IC.red); p(c, 14, 7, IC.red) // 翘起两端
  r(c, 4, 9, 2, 2, IC.greyDark) // 支架
  r(c, 9, 9, 2, 2, IC.greyDark)
  r(c, 3, 11, 3, 2, IC.dark) // 轮
  r(c, 9, 11, 3, 2, IC.dark)
}

function drawGuitarIcon(c) {
  r(c, 6, 0, 4, 2, IC.woodDark) // 琴头
  r(c, 7, 2, 2, 6, IC.woodDark) // 琴颈
  r(c, 4, 8, 8, 3, IC.wood) // 琴身上
  r(c, 5, 11, 6, 2, IC.wood) // 收腰
  r(c, 6, 13, 4, 2, IC.wood) // 琴身下
  r(c, 7, 9, 2, 2, IC.dark) // 音孔
  p(c, 8, 6, IC.white); p(c, 8, 7, IC.white) // 弦
}

function drawSwimIcon(c) {
  r(c, 2, 6, 5, 6, IC.cyan) // 左镜片
  r(c, 9, 6, 5, 6, IC.cyan) // 右镜片
  r(c, 2, 6, 5, 1, IC.blueDark) // 镜框
  r(c, 9, 6, 5, 1, IC.blueDark)
  r(c, 7, 7, 2, 4, IC.greyDark) // 鼻梁
  r(c, 1, 8, 1, 2, IC.blueDark) // 镜带
  r(c, 14, 8, 1, 2, IC.blueDark)
  r(c, 3, 7, 1, 2, IC.white) // 高光
  r(c, 10, 7, 1, 2, IC.white)
}

function drawFitnessIcon(c) {
  r(c, 1, 5, 3, 6, IC.grey) // 左配重
  r(c, 1, 5, 3, 1, IC.greyDark)
  r(c, 12, 5, 3, 6, IC.grey) // 右配重
  r(c, 12, 12, 3, 1, IC.greyDark)
  r(c, 4, 7, 8, 2, IC.greyDark) // 横杆
}

function drawArcadeIcon(c) {
  r(c, 2, 6, 12, 5, IC.dark) // 机身
  r(c, 2, 6, 3, 5, IC.greyDark) // 左握把
  r(c, 11, 6, 3, 5, IC.greyDark) // 右握把
  p(c, 4, 8, IC.white); r(c, 3, 9, 3, 1, IC.white) // 十字键
  p(c, 5, 9, IC.white)
  p(c, 10, 8, IC.red); p(c, 11, 9, IC.yellow) // 按钮
}

function drawYunnanIcon(c) {
  r(c, 6, 3, 4, 2, IC.greyDark) // 提手
  r(c, 3, 5, 10, 8, IC.wood) // 箱体
  r(c, 3, 5, 10, 2, IC.woodDark) // 顶盖
  r(c, 8, 7, 1, 6, IC.woodDark) // 拉链
  r(c, 3, 12, 10, 1, IC.woodDark)
  p(c, 5, 9, IC.yellow) // 锁
}

function drawRecordIcon(c) {
  r(c, 3, 3, 10, 10, IC.dark) // 黑胶外圈
  r(c, 4, 2, 8, 12, IC.dark)
  r(c, 2, 4, 12, 8, IC.dark)
  r(c, 5, 5, 6, 6, '#3a3f56') // 纹理反光
  r(c, 6, 6, 4, 4, IC.yellow) // 中心标签
  p(c, 7, 7, IC.red); p(c, 8, 8, IC.red) // 中心孔
}

function drawLibraryIcon(c) {
  r(c, 4, 3, 8, 11, IC.red) // 封面
  r(c, 4, 3, 1, 11, IC.roofDark) // 书脊
  r(c, 5, 5, 6, 3, IC.white) // 内页
  r(c, 5, 9, 6, 2, IC.white)
  r(c, 11, 3, 1, 11, IC.sand) // 书口纸边
  r(c, 6, 12, 1, 2, IC.yellow) // 书签带
}

// key 顺序即帧序（生成图集与引用时保持一致）
const LANDMARK_ICONS = {
  home_bed: drawBedIcon,
  home_album: drawAlbumIcon,
  ei_stone: drawStoneIcon,
  studio: drawStudioIcon,
  studio_tech: drawBoardIcon,
  rain_mountain: drawMountainIcon,
  skate: drawSkateIcon,
  guitar: drawGuitarIcon,
  swim: drawSwimIcon,
  fitness: drawFitnessIcon,
  arcade: drawArcadeIcon,
  yunnan: drawYunnanIcon,
  record: drawRecordIcon,
  library: drawLibraryIcon
}

export const LANDMARK_ICON_FRAME = Object.fromEntries(
  Object.keys(LANDMARK_ICONS).map((k, i) => [k, i])
)

// ------------- 统一入口 -------------
export function generateAssets(scene) {
  if (scene.textures.exists('tiles')) return

  // tiles 图集（16 个 16x16 tile 排成一行）
  const tilesCanvas = makeCanvas(TILE_SIZE * TILE_DRAWERS.length, TILE_SIZE)
  const tctx = ctx2d(tilesCanvas)
  TILE_DRAWERS.forEach((draw, i) => {
    const tileCanvas = makeCanvas(TILE_SIZE, TILE_SIZE)
    draw(ctx2d(tileCanvas))
    tctx.drawImage(tileCanvas, i * TILE_SIZE, 0)
  })
  scene.textures.addCanvas('tiles', tilesCanvas)

  // 玩家（6 帧：down0/1 up0/1 side0/1）
  const playerFrames = chibiCanvases({
    hair: '#40332b',
    shirt: PALETTE.shirt,
    shirtDark: '#3789c0',
    skin: PALETTE.skin
  })
  addSheet(scene, 'player', playerFrames, CHAR_W, CHAR_H)

  // NPC「角色」（神秘人，暖色卫衣）
  const npcFrames = chibiCanvases({
    hair: '#6b4f2f',
    shirt: '#e07b5a',
    shirtDark: '#c9664a',
    skin: PALETTE.skin
  })
  addSheet(scene, 'npc', npcFrames.slice(0, 2), CHAR_W, CHAR_H)

  // 猫
  const catFrames = [0, 1].map((f) => {
    const c = makeCanvas(CAT_W, CAT_H)
    drawCat(ctx2d(c), f)
    return c
  })
  addSheet(scene, 'cat', catFrames, CAT_W, CAT_H)

  // 宝石标记
  const gemC = makeCanvas(16, 16)
  drawGem(ctx2d(gemC))
  scene.textures.addCanvas('gem', gemC)

  // 地标像素图标图集（帧序与 LANDMARK_ICON_FRAME 一致）
  const iconFrames = Object.keys(LANDMARK_ICONS).map((k) => {
    const c = makeCanvas(16, 16)
    LANDMARK_ICONS[k](ctx2d(c))
    return c
  })
  addSheet(scene, 'landmarks', iconFrames, 16, 16)
}

function addSheet(scene, key, canvases, w, h) {
  const sheet = makeCanvas(w * canvases.length, h)
  const sctx = ctx2d(sheet)
  canvases.forEach((c, i) => sctx.drawImage(c, i * w, 0))
  scene.textures.addSpriteSheet(key, sheet, { frameWidth: w, frameHeight: h })
}