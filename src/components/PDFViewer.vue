<template>
  <div class="panel col">
    <div class="row">
      <button @click="prev">上一页</button>
      <span>第 {{ pageNum }} / {{ numPages }} 页</span>
      <button @click="next">下一页</button>
    </div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'

const props = defineProps<{ blob: Blob }>()
const canvas = ref<HTMLCanvasElement | null>(null)
const pdfRef = ref<any>(null)
const pageNum = ref(1)
const numPages = ref(1)

async function load() {
  try {
    const buf = await props.blob.arrayBuffer()
    const doc = await pdfjsLib.getDocument({
      data: buf,
      disableWorker: true,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@4.10.38/standard_fonts/'
    }).promise
    pdfRef.value = doc
    numPages.value = doc.numPages || 1
    pageNum.value = 1
    await renderPage()
  } catch (e) {
    numPages.value = 1
    pageNum.value = 1
  }
}

async function renderPage() {
  if (!pdfRef.value || !canvas.value) return
  try {
    const page = await pdfRef.value.getPage(pageNum.value)
    const viewport = page.getViewport({ scale: 1.5 })
    const ctx = canvas.value.getContext('2d')
    if (!ctx) return
    canvas.value.width = Math.floor(viewport.width)
    canvas.value.height = Math.floor(viewport.height)
    await page.render({ canvasContext: ctx, viewport }).promise
  } catch {
    // ignore single-page fallback
  }
}

function prev() {
  if (pageNum.value > 1) {
    pageNum.value--
    renderPage()
  }
}
function next() {
  if (pageNum.value < numPages.value) {
    pageNum.value++
    renderPage()
  }
}

onMounted(load)

watch(() => props.blob, async (b) => {
  if (b) await load()
})
</script>
