# 芒果与你 · Island

一个像素风个人介绍网站：控制一个像素角色探索一座小岛，通过探索与迷你游戏拼出「他」的名字，最终认识这个人。

> 纯前端项目，所有像素美术与背景音乐均在运行时由代码程序化生成，无任何外部图片/音频依赖。

## 玩法

- **探索**：WASD / 方向键移动，空格 / E 与地标、NPC 互动。
- **小游戏**：工作室 Bug Hunter、接雨水算法、滑板 / 吉他 / 游泳 / 健身等兴趣小游戏。
- **收集**：每完成一处探索或小游戏，获得一枚「姓名碎片」，同时提升「认识度」等级。
- **结局**：集齐 9 枚碎片后，进入「WHO AM I ?」，拼出他的名字。

## 技术栈

- [Phaser 3](https://phaser.io/) —— 游戏场景 / 物理 / 精灵（地图为程序化生成的 Tilemap，数据结构与 Tiled 同构）
- [Vue 3](https://vuejs.org/) —— HUD / 对话系统 / 结局界面等 UI 覆盖层
- [Vite](https://vitejs.dev/) —— 构建与开发服务器
- Web Audio API —— 程序化生成像素风 chiptune 背景音乐

## 本地运行

```bash
npm install
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 生产构建，产物输出到 dist/
npm run preview  # 预览生产构建
```

## 部署到 GitHub Pages

仓库已配置好 [GitHub Actions 工作流](.github/workflows/deploy.yml)：

1. 在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
2. 推送代码到 `main` 分支，Actions 会自动构建 `dist/` 并部署到 Pages。

## 目录结构

```
src/
├── game/
│   ├── scenes/          # Phaser 场景：Boot / World / 迷你游戏
│   ├── assets.js        # 程序化像素纹理生成
│   ├── maps.js          # 岛屿 Tilemap 与碰撞
│   ├── content.js       # 剧情 / 碎片 / 对话脚本
│   ├── progress.js      # 认识度等级与碎片收集
│   ├── audio.js         # Web Audio 背景音乐
│   └── ...
├── components/          # Vue UI：HUD / 对话 / 标题 / 结局
├── App.vue
└── main.js
```