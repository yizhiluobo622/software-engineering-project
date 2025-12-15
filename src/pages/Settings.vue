<template>
  <div class="col">
    <div class="row">
      <div class="h1">设置</div>
      <span class="muted">数据与外观设置</span>
    </div>
    <div class="panel col">
      <div class="row">
        <button @click="exportAll">导出 JSON</button>
        <input type="file" accept="application/json,.json" @change="importAll" />
      </div>
      <div class="muted">导出包含课程、模块、资源、笔记、任务、标签所有数据。导入时请选择 JSON 文件以恢复用户数据。</div>
    </div>
    <div class="panel col">
      <div class="h3">用户数据导入与导出</div>
      <div class="row">
        <button @click="seed">装载示例数据</button>
        <button class="danger" @click="wipe">清空全部数据</button>
      </div>
    </div>
    <div class="panel col">
      <div class="h3">外观设置</div>
      <div class="row">
        <label>主题</label>
        <select v-model="theme" @change="applyTheme">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </div>
      <div class="row">
        <label>背景色</label>
        <input type="color" v-model="bgColor" @input="applyColors" />
        <label>主色</label>
        <input type="color" v-model="primaryColor" @input="applyColors" />
      </div>
      <div class="row">
        <button @click="resetUi">恢复外观默认</button>
      </div>
      <div class="muted">外观设置仅影响本机浏览器（保存在 localStorage）。</div>
    </div>
    <div class="panel col">
      <div class="h3">编辑与预览</div>
      <div class="row">
        <label>预览高度</label>
        <input type="range" min="240" max="640" step="20" v-model.number="previewHeight" @input="applyPreviewHeight" />
        <span class="muted">{{ previewHeight }}px</span>
      </div>
      <div class="row">
        <label>Markdown 普通回车换行</label>
        <input type="checkbox" v-model="mdBreaks" @change="saveUiSettings" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { db } from '../services/db'
import { createCourse } from '../repositories/courses'
import { createResource } from '../repositories/resources'
import { createNote } from '../repositories/notes'
import { createTask } from '../repositories/tasks'
import { onMounted, ref } from 'vue'

async function exportAll() {
  const data = {
    courses: await db.courses.toArray(),
    modules: await db.modules.toArray(),
    resources: await db.resources.toArray(),
    resBlobs: await (async () => {
      const rows = await db.resBlobs.toArray()
      const out: any[] = []
      for (const r of rows) {
        const b64 = await blobToBase64(r.blob)
        out.push({ id: r.id, base64: b64, type: r.blob.type })
      }
      return out
    })(),
    notes: await db.notes.toArray(),
    tasks: await db.tasks.toArray(),
    tags: await db.tags.toArray()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'smart-study-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}

async function importAll(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await file.text()
  const data = JSON.parse(text)
  await db.transaction('rw', db.courses, db.modules, db.resources, db.notes, db.tasks, db.tags, db.resBlobs, async () => {
    await db.courses.clear()
    await db.modules.clear()
    await db.resources.clear()
    await db.notes.clear()
    await db.tasks.clear()
    await db.tags.clear()
    await db.resBlobs.clear()
    await db.courses.bulkAdd(data.courses || [])
    await db.modules.bulkAdd(data.modules || [])
    await db.resources.bulkAdd(data.resources || [])
    if (Array.isArray(data.resBlobs)) {
      for (const r of data.resBlobs) {
        const binStr = atob(r.base64)
        const bytes = new Uint8Array(binStr.length)
        for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i)
        const blob = new Blob([bytes], { type: r.type || 'application/octet-stream' })
        await db.resBlobs.put({ id: r.id, blob })
      }
    }
    await db.notes.bulkAdd(data.notes || [])
    await db.tasks.bulkAdd(data.tasks || [])
    await db.tags.bulkAdd(data.tags || [])
  })
  if (input) input.value = ''
  alert('导入完成')
}

async function seed() {
  const c1 = await createCourse('软件工程', '2025春', ['必修'])
  const c2 = await createCourse('数据库系统原理', '2025春', ['必修'])
  await createResource({ courseId: c1.id, type: 'text', title: '课程大纲', authors: ['教师A'] })
  await createResource({ courseId: c2.id, type: 'text', title: '关系模型概述' })
  await createNote({ courseId: c1.id, title: '第一次课堂笔记', contentMd: '# 需求工程\\n- 用例\\n- DFD' })
  await createTask({ title: '完成实验一', courseId: c1.id })
  await createTask({ title: '阅读教材第3章', courseId: c2.id })
  alert('示例数据已装载')
}

async function wipe() {
  await db.transaction('rw', db.courses, db.modules, db.resources, db.notes, db.tasks, db.tags, db.resBlobs, async () => {
    await db.courses.clear()
    await db.modules.clear()
    await db.resources.clear()
    await db.notes.clear()
    await db.tasks.clear()
    await db.tags.clear()
    await db.resBlobs.clear()
  })
  alert('已清空所有数据')
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
        const res = reader.result as string
        const b64 = res.split(',')[1] || ''
        resolve(b64)
      }
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(blob)
    } catch (e) {
      reject(e)
    }
  })
}

const theme = ref<'light' | 'dark'>('light')
const bgColor = ref('#ffffff')
const primaryColor = ref('#2563eb')
const previewHeight = ref(360)
const mdBreaks = ref(true)

function saveUiSettings() {
  const cfg = {
    theme: theme.value,
    bgColor: bgColor.value,
    primaryColor: primaryColor.value,
    previewHeight: previewHeight.value,
    mdBreaks: mdBreaks.value
  }
  localStorage.setItem('ssm-ui', JSON.stringify(cfg))
}
function applyTheme() {
  if (theme.value === 'dark') {
    setVars({
      '--bg': '#0f172a',
      '--panel': '#111827',
      '--text': '#e5e7eb',
      '--muted': '#9ca3af',
      '--border': '#1f2937',
      '--surface': '#0b1220'
    })
  } else {
    setVars({
      '--bg': '#ffffff',
      '--panel': '#ffffff',
      '--text': '#111827',
      '--muted': '#6b7280',
      '--border': '#e5e7eb',
      '--surface': '#f9fafb'
    })
  }
  applyColors()
  applyPreviewHeight()
  saveUiSettings()
}
function applyColors() {
  setVars({
    '--primary': primaryColor.value,
    '--bg': bgColor.value
  })
  saveUiSettings()
}
function applyPreviewHeight() {
  document.documentElement.style.setProperty('--preview-height', `${previewHeight.value}px`)
  saveUiSettings()
}
function resetUi() {
  theme.value = 'light'
  bgColor.value = '#ffffff'
  primaryColor.value = '#2563eb'
  previewHeight.value = 360
  mdBreaks.value = true
  applyTheme()
}
function setVars(vars: Record<string, string>) {
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
}
onMounted(() => {
  try {
    const raw = localStorage.getItem('ssm-ui')
    if (raw) {
      const cfg = JSON.parse(raw)
      theme.value = cfg.theme ?? 'light'
      bgColor.value = cfg.bgColor ?? '#ffffff'
      primaryColor.value = cfg.primaryColor ?? '#2563eb'
      previewHeight.value = cfg.previewHeight ?? 360
      mdBreaks.value = cfg.mdBreaks ?? true
    }
  } catch {}
  applyTheme()
})
</script>
