import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 등 서브 경로 배포에서 자산 경로가 깨지지 않도록 상대 경로로 빌드
  base: './',
})
