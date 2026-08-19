// 全局调色板：统一海岛像素画风
export const PALETTE = {
  grass: '#79c143',
  grassDark: '#5da934',
  grassLight: '#93d45c',
  grassTuft: '#3e7d22',

  path: '#e0bd78',
  pathEdge: '#c79b52',

  sand: '#f0dfa0',
  sandDark: '#dfc67f',

  water: '#3fa7d6',
  waterDeep: '#2f86b8',
  waterLight: '#74c6ea',
  foam: '#d9f1fb',

  wall: '#9a7355',
  wallDark: '#77563f',
  wallLight: '#b2896a',

  roof: '#cf6354',
  roofDark: '#a8483c',
  roofLight: '#e07b6b',

  door: '#5b3b2a',
  window: '#a8e0ef',
  windowFrame: '#6f5340',

  tree: '#4b9a4e',
  treeDark: '#326e38',
  treeLight: '#65b45e',
  trunk: '#7a4b2a',

  bush: '#5aa83c',
  flower: '#ff8fb1',
  flowerCore: '#ffd76a',

  stone: '#a8a29e',
  stoneDark: '#7c7672',

  fence: '#c8965a',
  fenceDark: '#a06f3c',

  sign: '#8a5a3a',
  signBoard: '#f0c060',

  // 角色
  skin: '#ffd9b0',
  skinShadow: '#e9b98a',
  hair: '#40332b',
  shirt: '#4aa8e0',
  pants: '#3a3f56',
  shoes: '#2a2a33',

  outline: '#20181a'
}

// 将颜色映射为紧凑字符索引表，便于像素网格作画
export const C = {
  '.': null, // 透明
  o: PALETTE.outline,
  k: '#000000',
  w: '#ffffff',
  s: PALETTE.skin,
  S: PALETTE.skinShadow,
  h: PALETTE.hair,
  H: '#2b211c',
  b: PALETTE.shirt,
  B: '#3789c0',
  p: PALETTE.pants,
  P: '#2c3040',
  e: PALETTE.shoes,
  f: PALETTE.flower,
  y: '#ffd76a',
  g: PALETTE.grass,
  r: '#ff6b57',
  c: '#62c7f0'
}