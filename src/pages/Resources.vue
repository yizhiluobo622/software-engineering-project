<template>
  <div class="col">
    <div class="row">
      <div class="h1">资源库</div>
      <span class="muted">导入本地文件，预览 PDF，编辑元数据</span>
    </div>
    <div class="panel col">
      <input type="file" multiple @change="onFiles" />
      <div class="row">
        <select v-model="assignCourseId">
          <option value="">不关联课程</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <button @click="reload">刷新</button>
      </div>
      <div class="row">
        <select v-model="filterCourseId">
          <option value="">全部课程</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select v-model="filterType">
          <option value="">全部类型</option>
          <option value="pdf">PDF</option>
          <option value="image">图片</option>
          <option value="text">文本</option>
        </select>
        <button @click="reload">筛选</button>
      </div>
    </div>
    <div class="grid cols-3">
      <div v-for="r in resources" :key="r.id" class="panel col">
        <div class="h3">{{ r.title }}</div>
        <div class="muted">{{ r.type }} · {{ r.authors.join(', ') }}</div>
        <div class="row">
          <select v-model="assocSelect[r.id]" @change="changeAssoc(r)">
            <option value="">不关联课程</option>
            <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="row">
          <button @click="openExternal(r)">打开/下载</button>
        </div>
        <div class="row">
          <input v-model="r.title" @change="save(r)" />
          <input :value="r.authors.join(', ')" @change="e => save(r, { authors: String((e.target as HTMLInputElement).value).split(',').map(s=>s.trim()).filter(Boolean) })" />
        </div>
        <div class="row">
          <input v-model="newTag" placeholder="添加标签" @keydown.enter="addTag(r)" />
          <button @click="addTag(r)">添加</button>
          <select @change="e => addTagFromGlobal(r, (e.target as HTMLSelectElement).value)">
            <option value="">选择全局标签</option>
            <option v-for="t in globalTags" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
          <div>
            <span class="tag" v-for="t in r.tags" :key="t">{{ t }}</span>
          </div>
        </div>
        <div class="row">
          <button class="danger" @click="remove(r.id)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listResources, createResource, updateResource, removeResource } from '../repositories/resources'
import { listCourses } from '../repositories/courses'
import { listTags } from '../repositories/tags'
import PDFViewer from '../components/PDFViewer.vue'
import { db } from '../services/db'

  const resources = ref<any[]>([])
  const courses = ref<any[]>([])
  const assignCourseId = ref<string>('')
  const blobs = ref<Record<string, Blob>>({})
  const urls = ref<Record<string, string>>({})
  const newTag = ref('')
  const filterCourseId = ref<string>('')
  const filterType = ref<string>('')
  const assocSelect = ref<Record<string, string>>({})
  const globalTags = ref<any[]>([])

async function reload() {
  const all = await listResources()
  resources.value = all.filter(r => {
    const okCourse = filterCourseId.value ? r.courseId === filterCourseId.value : true
    const okType = filterType.value ? r.type === filterType.value : true
    return okCourse && okType
  })
  const ids = resources.value.filter(r => r.type === 'pdf' || r.type === 'image').map(r => r.id)
  const mapB: Record<string, Blob> = {}
  const mapU: Record<string, string> = {}
  // revoke old urls
  Object.values(urls.value).forEach(u => URL.revokeObjectURL(u))
  for (const r of resources.value) {
    if (r.type !== 'pdf' && r.type !== 'image') continue
    const b = await db.resBlobs.get(r.id)
    let blob: Blob | undefined = b?.blob
    // fallback: use resource.meta.blob if available
    if (!blob && r.meta && (r.meta as any).blob instanceof Blob) {
      blob = (r.meta as any).blob as Blob
    }
    if (blob) {
      mapB[r.id] = blob
      if (r.type === 'image') {
        mapU[r.id] = URL.createObjectURL(blob)
      }
    }
  }
  blobs.value = mapB
  urls.value = mapU
  assocSelect.value = Object.fromEntries(resources.value.map(r => [r.id, r.courseId || '']))
}

onMounted(async () => {
  courses.value = await listCourses()
  globalTags.value = await listTags()
  await reload()
})

async function onFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (!files) return
  for (const file of Array.from(files)) {
    const mime = file.type
    const name = file.name.toLowerCase()
    const type: any =
      mime.includes('pdf') || name.endsWith('.pdf') ? 'pdf' :
      mime.startsWith('image/') ? 'image' :
      mime.includes('msword') || name.endsWith('.doc') || name.endsWith('.docx') ? 'doc' :
      mime.includes('presentation') || name.endsWith('.ppt') || name.endsWith('.pptx') ? 'ppt' :
      mime.startsWith('text/') ? 'text' : 'file'
    const meta: Record<string, unknown> = {}
    meta.blob = file
    await createResource({
      courseId: assignCourseId.value || undefined,
      type,
      title: file.name.replace(/\.[^.]+$/, ''),
      authors: [],
      tags: [],
      blobRef: 'resBlobs',
      meta
    })
  }
  await reload()
  if (input) input.value = ''
}

async function save(r: any, patch: any = {}) {
  await updateResource(r.id, { title: r.title, authors: r.authors, ...patch })
}
async function remove(id: string) {
  await removeResource(id)
  await reload()
}

async function addTag(r: any) {
  const t = newTag.value.trim()
  if (!t) return
  const tags = Array.from(new Set([...(r.tags || []), t]))
  await updateResource(r.id, { tags })
  newTag.value = ''
  await reload()
}

async function changeAssoc(r: any) {
  const v = assocSelect.value[r.id]
  await updateResource(r.id, { courseId: v || undefined })
  await reload()
}

async function addTagFromGlobal(r: any, tagId: string) {
  const tag = globalTags.value.find((t: any) => t.id === tagId)
  if (!tag) return
  const tags = Array.from(new Set([...(r.tags || []), tag.name]))
  await updateResource(r.id, { tags })
  await reload()
}

async function openExternal(r: any) {
  const b = blobs.value[r.id]
  if (!b && r.meta && (r.meta as any).blob instanceof Blob) {
    const blob = (r.meta as any).blob as Blob
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = r.title || 'download'
    a.target = '_blank'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
    return
  }
  if (b) {
    const url = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = url
    a.download = r.title || 'download'
    a.target = '_blank'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}
</script>
