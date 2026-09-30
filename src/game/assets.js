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

function drawSwimChibi(ctx, o) {
  const { hair, shirtDark, shirt, skin, facing, frame } = o
  const strokeY = frame === 0 ? 7 : 10

  if (facing === 'side') {
    r(ctx, 9, 5, 5, 6, skin)
    r(ctx, 9, 3, 6, 3, hair)
    r(ctx, 14, 4, 1, 7, hair)
    p(ctx, 12, 7, '#2a2a33')
    r(ctx, 4, 6, 5, 5, shirt)
    r(ctx, 4, 10, 5, 1, shirtDark)
    r(ctx, 6, strokeY, 4, 2, skin)
    r(ctx, 2, 7, 3, 2, shirtDark)
    r(ctx, 2, 9, 3, 2, skin)
    r(ctx, frame === 0 ? 1 : 2, 6, 3, 2, shirtDark)
    return
  }

  if (facing === 'up') {
    r(ctx, 3, 0, 10, 5, hair)
    r(ctx, 4, 3, 8, 5, skin)
    r(ctx, 3, 1, 1, 6, hair)
    r(ctx, 12, 1, 1, 6, hair)
    r(ctx, 5, 7, 6, 6, shirt)
    r(ctx, 5, 9, 6, 1, shirtDark)
    r(ctx, 5, 13, 2, 3, shirtDark)
    r(ctx, 9, 13, 2, 3, shirtDark)
  } else {
    r(ctx, 4, 10, 8, 6, skin)
    r(ctx, 3, 13, 10, 4, hair)
    r(ctx, 3, 10, 1, 6, hair)
    r(ctx, 12, 10, 1, 6, hair)
    p(ctx, 6, 12, '#2a2a33')
    p(ctx, 10, 12, '#2a2a33')
    r(ctx, 5, 5, 6, 6, shirt)
    r(ctx, 5, 7, 6, 1, shirtDark)
    r(ctx, 5, 1, 2, 3, shirtDark)
    r(ctx, 9, 1, 2, 3, shirtDark)
  }

  r(ctx, 0, strokeY, 5, 2, skin)
  r(ctx, 11, strokeY, 5, 2, skin)
}

function swimCanvases(opts) {
  return ['down', 'up', 'side'].flatMap((facing) =>
    [0, 1].map((frame) => {
      const c = makeCanvas(CHAR_W, CHAR_H)
      drawSwimChibi(ctx2d(c), { ...opts, facing, frame })
      return c
    })
  )
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

function drawSwimmingCat(ctx, frame) {
  const coat = '#dcd8d1'
  const coatDark = '#b3ada4'

  // Low, stretched body with the head leading and paws alternating through the water.
  r(ctx, 0, 7, 4, 2, coatDark)
  r(ctx, 1, 5, 2, 2, coatDark)
  r(ctx, 3, 5, 8, 7, coat)
  r(ctx, 5, 11, 5, 2, coatDark)
  r(ctx, 9, 4, 6, 7, coat)
  r(ctx, 10, 2, 2, 4, coat)
  r(ctx, 14, 2, 2, 4, coat)
  p(ctx, 10, 3, '#f0a0a0')
  p(ctx, 14, 3, '#f0a0a0')
  p(ctx, 12, 7, '#5a8a3a')
  p(ctx, 14, 7, '#5a8a3a')
  p(ctx, 15, 9, '#f0a0a0')

  if (frame === 0) {
    r(ctx, 7, 2, 2, 4, coatDark)
    r(ctx, 10, 11, 2, 4, coat)
    r(ctx, 2, 11, 3, 2, coatDark)
  } else {
    r(ctx, 7, 11, 2, 4, coatDark)
    r(ctx, 10, 1, 2, 4, coat)
    r(ctx, 2, 4, 3, 2, coatDark)
  }
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

const LANDMARK_ICON_SIZE = 20

function outlineLandmarkIcon(drawIcon) {
  const artwork = makeCanvas(16, 16)
  drawIcon(ctx2d(artwork))

  const source = ctx2d(artwork).getImageData(0, 0, 16, 16).data
  const icon = makeCanvas(LANDMARK_ICON_SIZE, LANDMARK_ICON_SIZE)
  const ctx = ctx2d(icon)
  ctx.fillStyle = IC.outline

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (source[(y * 16 + x) * 4 + 3] === 0) continue
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          ctx.fillRect(x + 2 + ox, y + 2 + oy, 1, 1)
        }
      }
    }
  }
  ctx.drawImage(artwork, 2, 2)
  return icon
}

function drawPixelGlyph(c, rows, x, y, color) {
  rows.forEach((row, rowIndex) => {
    for (let column = 0; column < row.length; column++) {
      if (row[column] === '1') p(c, x + column, y + rowIndex, color)
    }
  })
}

function drawBedIcon(c) {
  r(c, 2, 3, 12, 3, IC.woodDark)
  r(c, 3, 4, 4, 2, IC.white)
  r(c, 8, 4, 5, 2, IC.sand)
  r(c, 2, 7, 12, 6, IC.blue)
  r(c, 8, 7, 6, 6, IC.cyan)
  r(c, 2, 13, 12, 2, IC.wood)
  r(c, 3, 15, 2, 1, IC.woodDark)
  r(c, 11, 15, 2, 1, IC.woodDark)
}

function drawAlbumIcon(c) {
  r(c, 2, 2, 12, 12, IC.white)
  r(c, 3, 3, 10, 7, IC.cyan)
  p(c, 10, 4, IC.yellow)
  r(c, 3, 8, 5, 2, IC.green)
  r(c, 7, 6, 6, 4, IC.greenDark)
  r(c, 4, 11, 8, 1, IC.grey)
  r(c, 6, 13, 4, 1, IC.woodDark)
}

function drawStoneIcon(c) {
  r(c, 4, 4, 8, 2, IC.greyDark)
  r(c, 2, 6, 12, 6, IC.grey)
  r(c, 4, 12, 8, 2, IC.greyDark)
  r(c, 4, 7, 3, 4, IC.cyan)
  r(c, 9, 7, 3, 4, IC.pink)
  drawPixelGlyph(c, ['111', '100', '110', '100', '111'], 4, 7, IC.white)
  drawPixelGlyph(c, ['111', '010', '010', '010', '111'], 9, 7, IC.white)
}

function drawStudioIcon(c) {
  r(c, 2, 2, 12, 9, IC.dark)
  r(c, 3, 3, 10, 7, IC.cyan)
  drawPixelGlyph(c, ['101', '010', '101'], 4, 5, IC.white)
  r(c, 9, 5, 2, 2, IC.red)
  p(c, 8, 4, IC.yellow)
  r(c, 7, 11, 2, 2, IC.grey)
  r(c, 5, 13, 6, 1, IC.greyDark)
}

function drawBoardIcon(c) {
  r(c, 3, 2, 10, 2, IC.woodDark)
  r(c, 2, 4, 12, 9, IC.sand)
  r(c, 3, 5, 10, 1, IC.blue)
  r(c, 4, 7, 2, 4, IC.pink)
  r(c, 7, 7, 2, 3, IC.green)
  r(c, 10, 7, 2, 5, IC.yellow)
  p(c, 5, 8, IC.white)
  p(c, 8, 8, IC.white)
  p(c, 11, 8, IC.white)
}

function drawMountainIcon(c) {
  r(c, 2, 2, 5, 2, IC.white)
  r(c, 4, 1, 4, 2, IC.white)
  p(c, 3, 5, IC.cyan)
  p(c, 7, 6, IC.cyan)
  p(c, 11, 4, IC.cyan)
  r(c, 2, 10, 6, 5, IC.greenDark)
  r(c, 7, 7, 7, 8, IC.green)
  r(c, 8, 7, 3, 2, IC.white)
  p(c, 7, 9, IC.white)
  r(c, 2, 14, 12, 1, IC.blue)
}

function drawSkateIcon(c) {
  r(c, 2, 6, 12, 3, IC.blue)
  p(c, 1, 7, IC.blue)
  p(c, 14, 7, IC.blue)
  r(c, 3, 7, 10, 1, IC.yellow)
  r(c, 4, 9, 2, 2, IC.grey)
  r(c, 10, 9, 2, 2, IC.grey)
  r(c, 3, 11, 3, 2, IC.dark)
  r(c, 10, 11, 3, 2, IC.dark)
  p(c, 4, 11, IC.white)
  p(c, 11, 11, IC.white)
}

function drawGuitarIcon(c) {
  r(c, 6, 1, 4, 2, IC.woodDark)
  p(c, 5, 2, IC.woodDark)
  p(c, 10, 2, IC.woodDark)
  r(c, 7, 3, 2, 5, IC.wood)
  r(c, 5, 7, 6, 3, IC.wood)
  r(c, 4, 9, 8, 4, IC.wood)
  r(c, 5, 12, 6, 2, IC.wood)
  r(c, 7, 9, 2, 2, IC.woodDark)
  p(c, 8, 4, IC.white)
  p(c, 8, 5, IC.white)
  p(c, 8, 6, IC.white)
  p(c, 8, 7, IC.white)
  p(c, 8, 12, IC.yellow)
}

function drawSwimIcon(c) {
  r(c, 1, 7, 2, 3, IC.blueDark)
  r(c, 3, 5, 4, 7, IC.cyan)
  r(c, 9, 5, 4, 7, IC.cyan)
  r(c, 4, 6, 2, 4, IC.blue)
  r(c, 10, 6, 2, 4, IC.blue)
  r(c, 7, 7, 2, 2, IC.greyDark)
  r(c, 13, 7, 2, 3, IC.blueDark)
  p(c, 4, 6, IC.white)
  p(c, 10, 6, IC.white)
}

function drawWaterNoteIcon(c) {
  r(c, 7, 1, 3, 2, IC.woodDark) // 瓶塞
  r(c, 6, 3, 5, 2, IC.cyan)
  r(c, 5, 5, 7, 6, IC.cyan) // 瓶身
  r(c, 6, 6, 5, 4, IC.sand) // 瓶中的便签
  r(c, 7, 7, 3, 1, IC.woodDark)
  r(c, 6, 11, 5, 2, IC.blueDark)
  p(c, 7, 4, IC.white)
  p(c, 6, 12, IC.cyan)
  p(c, 10, 12, IC.cyan)
}

function drawFitnessIcon(c) {
  r(c, 2, 3, 12, 10, IC.pink)
  r(c, 4, 5, 8, 6, IC.sand)
  r(c, 5, 7, 2, 2, IC.greyDark)
  r(c, 7, 8, 3, 1, IC.greyDark)
  r(c, 10, 7, 2, 2, IC.greyDark)
  r(c, 5, 6, 1, 4, IC.grey)
  r(c, 11, 6, 1, 4, IC.grey)
  p(c, 4, 4, IC.white)
}

function drawArcadeIcon(c) {
  r(c, 3, 5, 10, 7, IC.dark)
  r(c, 2, 7, 3, 5, IC.dark)
  r(c, 11, 7, 3, 5, IC.dark)
  r(c, 4, 6, 8, 1, IC.greyDark)
  r(c, 4, 8, 1, 3, IC.white)
  r(c, 3, 9, 3, 1, IC.white)
  p(c, 10, 8, IC.red)
  p(c, 12, 9, IC.yellow)
  p(c, 10, 10, IC.cyan)
}

function drawYunnanIcon(c) {
  r(c, 6, 2, 4, 2, IC.greyDark)
  r(c, 7, 3, 2, 1, IC.sand)
  r(c, 3, 5, 10, 8, IC.wood)
  r(c, 3, 5, 10, 2, IC.woodDark)
  r(c, 8, 7, 1, 6, IC.woodDark)
  r(c, 4, 8, 3, 3, IC.cyan)
  p(c, 4, 10, IC.green)
  p(c, 5, 9, IC.white)
  p(c, 10, 10, IC.yellow)
}

function drawRecordIcon(c) {
  r(c, 5, 2, 6, 1, IC.dark)
  r(c, 3, 3, 10, 1, IC.dark)
  r(c, 2, 4, 12, 8, IC.dark)
  r(c, 3, 12, 10, 1, IC.dark)
  r(c, 5, 4, 6, 1, IC.greyDark)
  r(c, 4, 5, 8, 6, IC.greyDark)
  r(c, 5, 6, 6, 4, IC.dark)
  r(c, 6, 7, 4, 2, IC.yellow)
  p(c, 7, 7, IC.red)
  p(c, 8, 8, IC.red)
}

function drawLibraryIcon(c) {
  r(c, 2, 4, 6, 9, IC.white)
  r(c, 8, 4, 6, 9, IC.sand)
  r(c, 7, 4, 2, 10, IC.red)
  r(c, 3, 5, 4, 1, IC.cyan)
  r(c, 3, 7, 3, 1, IC.grey)
  r(c, 9, 5, 4, 1, IC.cyan)
  r(c, 10, 7, 3, 1, IC.grey)
  r(c, 8, 12, 1, 3, IC.yellow)
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
  water_note: drawWaterNoteIcon,
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
  const playerOpts = {
    hair: '#40332b',
    shirt: PALETTE.shirt,
    shirtDark: '#3789c0',
    skin: PALETTE.skin
  }
  const playerFrames = [...chibiCanvases(playerOpts), ...swimCanvases(playerOpts)]
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
  const catFrames = [0, 1, 2, 3].map((f) => {
    const c = makeCanvas(CAT_W, CAT_H)
    const ctx = ctx2d(c)
    if (f < 2) drawCat(ctx, f)
    else drawSwimmingCat(ctx, f - 2)
    return c
  })
  addSheet(scene, 'cat', catFrames, CAT_W, CAT_H)

  // 宝石标记
  const gemC = makeCanvas(16, 16)
  drawGem(ctx2d(gemC))
  scene.textures.addCanvas('gem', gemC)

  // 地标像素图标图集（帧序与 LANDMARK_ICON_FRAME 一致）
  const iconFrames = Object.keys(LANDMARK_ICONS).map((k) => outlineLandmarkIcon(LANDMARK_ICONS[k]))
  addSheet(scene, 'landmarks', iconFrames, LANDMARK_ICON_SIZE, LANDMARK_ICON_SIZE)
}

function addSheet(scene, key, canvases, w, h) {
  const sheet = makeCanvas(w * canvases.length, h)
  const sctx = ctx2d(sheet)
  canvases.forEach((c, i) => sctx.drawImage(c, i * w, 0))
  scene.textures.addSpriteSheet(key, sheet, { frameWidth: w, frameHeight: h })
}
