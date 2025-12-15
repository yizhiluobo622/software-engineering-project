import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import nodeCrypto from 'node:crypto'

export default defineConfig({
  plugins: [vue(), viteSingleFile()],
  server: {
    port: 5173,
    host: true
  },
  base: './',
  root: '.',
  publicDir: 'public'
})

// ensure globalThis.crypto.getRandomValues available for Vite internals in some environments
const hasRootCrypto = typeof globalThis.crypto !== 'undefined'
const hasGRV = hasRootCrypto && typeof (globalThis.crypto as any).getRandomValues === 'function'
if (!hasGRV) {
  const webcrypto = (nodeCrypto as any).webcrypto
  if (webcrypto && typeof webcrypto.getRandomValues === 'function') {
    // @ts-ignore
    globalThis.crypto = { ...(globalThis.crypto || {}), getRandomValues: webcrypto.getRandomValues.bind(webcrypto) }
  }
}
