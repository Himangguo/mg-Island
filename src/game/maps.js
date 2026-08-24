import { TILE } from './assets'

// ================= 岛屿地图 =================
// 用「盖章」的方式在代码里搭建 tilemap（Phaser 的 make.tilemap 数据与 Tiled 同构，
// 后续可平滑替换为 Tiled 导出的 JSON）。

export const TILE_SIZE = 16
export const MAP_W = 48
export const MAP_H = 34

// 图例字符 -> tile 名称
const LEGEND = {
  grass: TILE.grass,
  grassDark: TILE.grassDark,
  flower: TILE.grassFlower,
  path: TILE.path,
  sand: TILE.sand,
  water: TILE.water,
  waterDeep: TILE.waterDeep,
  wall: TILE.wall,
  roof: TILE.roof,
  door: TILE.door,
  window: TILE.window,
  bush: TILE.bush,
  tree: TILE.tree,
  stone: TILE.stone,
  fence: TILE.fence,
  sign: TILE.sign,
  monitor: TILE.monitor
}

// 可碰撞（固体）tile 名称
export const SOLID = new Set([
  'wall',
  'roof',
  'door',
  'window',
  'tree',
  'bush',
  'stone',
  'fence',
  'water',
  'waterDeep'
])

// 可交互点（宝石）的位置（tile 坐标）。地图生成时会强制清空为可通行。
export const LANDMARKS = [
  { key: 'home_bed', tx: 10, ty: 11 },
  { key: 'home_album', tx: 17, ty: 10 },
  { key: 'ei_stone', tx: 20, ty: 17 },
  { key: 'studio', tx: 39, ty: 11 },
  { key: 'studio_tech', tx: 33, ty: 7 },
  { key: 'rain_mountain', tx: 28, ty: 4 },
  { key: 'skate', tx: 13, ty: 1 },
  { key: 'guitar', tx: 20, ty: 1 },
  { key: 'swim', tx: 5, ty: 28 },
  { key: 'fitness', tx: 30, ty: 20 },
  { key: 'arcade', tx: 8, ty: 22 },
  { key: 'yunnan', tx: 43, ty: 26 },
  { key: 'record', tx: 37, ty: 24 },
  { key: 'library', tx: 15, ty: 24 }
]

// 可交互点的中文名，供悬浮标签使用
export const LANDMARK_LABELS = {
  home_bed: '家 · 床',
  home_album: '相册',
  ei_stone: '性格石',
  studio: '工作室 · Bug Lab',
  studio_tech: '技术看板',
  rain_mountain: '算法山 · 接雨水',
  skate: '滑板',
  guitar: '吉他',
  swim: '游泳镜',
  fitness: '健身 · 年卡',
  arcade: '游戏厅 · 无畏契约',
  yunnan: '云南 · 旅行',
  record: '唱片店 · 周杰伦',
  library: '记忆图书馆'
}

function emptyGrid() {
  return Array.from({ length: MAP_H }, () => Array.from({ length: MAP_W }, () => 'grass'))
}

function inBounds(x, y) {
  return x >= 0 && x < MAP_W && y >= 0 && y < MAP_H
}

function stamp(g, x0, y0, w, h, tile) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (inBounds(x, y)) g[y][x] = tile
    }
  }
}

// 确定性伪随机（保证每次生成一致）
function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function buildGrid() {
  const g = emptyGrid()
  const rand = seeded(20260819)

  // 稀疏草地细节
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (rand() < 0.06) g[y][x] = 'grassDark'
      else if (rand() < 0.015) g[y][x] = 'flower'
    }
  }

  // 底部海滩 + 海
  stamp(g, 0, 27, MAP_W, 2, 'sand')
  stamp(g, 0, 29, MAP_W, 4, 'water')
  stamp(g, 0, 33, MAP_W, 1, 'waterDeep')

  // 中央广场 + 主路（十字路）
  stamp(g, 21, 15, 6, 7, 'path')
  stamp(g, 23, 0, 2, MAP_H, 'path') // 纵向主路
  stamp(g, 0, 17, MAP_W, 2, 'path') // 横向主路

  // 房子（左上）
  stamp(g, 8, 3, 8, 4, 'roof')
  stamp(g, 8, 7, 8, 3, 'wall')
  stamp(g, 11, 9, 2, 1, 'door')
  stamp(g, 9, 8, 1, 1, 'window')
  stamp(g, 14, 8, 1, 1, 'window')

  // 工作室（右上，Bug Lab）
  stamp(g, 35, 3, 9, 4, 'roof')
  stamp(g, 35, 7, 9, 3, 'wall')
  stamp(g, 39, 9, 2, 1, 'door')
  stamp(g, 36, 8, 1, 1, 'window')
  stamp(g, 42, 8, 1, 1, 'window')
  stamp(g, 41, 5, 1, 1, 'monitor') // 屋顶上的小屏幕装饰

  // 树（顶部森林带 + 两侧，避开建筑与道路）
  const treeSpots = []
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rand() * MAP_W)
    const y = Math.floor(rand() * 16) // 上半部
    if (g[y][x] === 'grass') treeSpots.push([x, y])
  }
  treeSpots.forEach(([x, y]) => (g[y][x] = 'tree'))

  // 灌木 / 石头 / 花朵点缀
  for (let i = 0; i < 26; i++) {
    const x = Math.floor(rand() * MAP_W)
    const y = Math.floor(rand() * MAP_H)
    if (g[y][x] === 'grass') {
      const roll = rand()
      g[y][x] = roll < 0.4 ? 'bush' : roll < 0.7 ? 'stone' : 'flower'
    }
  }

  // 栅栏（房子院子，底部正对大门处留缺口，方便走进去）
  stamp(g, 7, 10, 1, 4, 'fence')
  stamp(g, 15, 10, 1, 4, 'fence')
  stamp(g, 8, 13, 3, 1, 'fence') // 家下边：x=8..10
  stamp(g, 13, 13, 2, 1, 'fence') // 家下边：x=13..14，留出 x=11,12 进门
  stamp(g, 34, 10, 1, 4, 'fence')
  stamp(g, 43, 10, 1, 4, 'fence')
  stamp(g, 35, 13, 4, 1, 'fence') // 工作室下边：x=35..38
  stamp(g, 41, 13, 2, 1, 'fence') // 工作室下边：x=41..42，留出 x=39,40 进门

  // 清空交互点所在 tile（保证可达、醒目）
  for (const l of LANDMARKS) {
    stamp(g, l.tx, l.ty, 1, 1, 'path')
  }

  return g
}

function gridToLayerData(g) {
  // 返回二维数组（行优先）。make.tilemap 走 ARRAY_2D 格式，
  // 其中每个值就是 gid（0 基，直接对应 tileset 内的 tile 序号），-1 表示空。
  return g.map((row) => row.map((tile) => LEGEND[tile]))
}

// 在场景里创建 tilemap 与碰撞层
export function createIsland(scene) {
  const g = buildGrid()
  const data = gridToLayerData(g)

  const map = scene.make.tilemap({
    data,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE
  })
  const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE, 0, 0)
  const ground = map.createLayer(0, tileset, 0, 0)
  ground.setDepth(0)

  // 碰撞索引（ARRAY_2D 下 gid 为 0 基，直接对应 tile 序号）
  const solids = []
  for (const name of SOLID) solids.push(LEGEND[name])
  ground.setCollision(solids)

  return { map, ground }
}

// tile 坐标 -> 世界像素（用于摆放实体）
export function tileToWorld(tx, ty, ox = 0.5, oy = 0.5) {
  return { x: tx * TILE_SIZE + ox * TILE_SIZE, y: ty * TILE_SIZE + oy * TILE_SIZE }
}