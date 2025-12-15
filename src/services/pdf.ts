import * as pdfjsLib from 'pdfjs-dist/build/pdf'
const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url)
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.toString()

export async function renderFirstPage(blob: Blob, canvas: HTMLCanvasElement): Promise<void> {
  const url = URL.createObjectURL(blob)
  try {
    const pdf = await pdfjsLib.getDocument({ url }).promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 })
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: ctx, viewport }).promise
  } finally {
    URL.revokeObjectURL(url)
  }
}

