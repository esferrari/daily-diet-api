import tsconfigPaths from 'vite-tsconfig-paths' // only if you are using custom tsconfig paths
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    hookTimeout: 120000,
    testTimeout: 120000,
  },
  plugins: [tsconfigPaths()], // only if you are using custom tsconfig paths
})