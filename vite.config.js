import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 相对路径 base，兼容部署到 GitHub Pages 的任意子路径
  base: './',
  plugins: [vue()],
  server: {
    host: true,
    port: 5173
  }
})