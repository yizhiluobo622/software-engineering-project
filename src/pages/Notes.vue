<template>
  <div class="col">
    <div class="row">
      <div class="h1">笔记</div>
      <span class="muted">Markdown 编辑与预览</span>
    </div>
    <div class="panel grid cols-2">
      <div class="col">
        <input v-model="title" placeholder="标题" />
        <select v-model="courseId">
          <option value="">不关联课程</option>
          <option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <textarea v-model="md" rows="12" placeholder="在此输入 Markdown 内容。提示：可在“设置→外观设置”中切换是否采用普通回车换行（Markdown breaks）。"></textarea>
        <button @click="save">保存笔记</button>
      </div>
      <div class="col">
        <div class="h3">预览</div>
        <div class="panel preview" v-html="renderMarkdown(md)"></div>
        <div class="panel" v-if="filtered.length">
          <div class="h3">选中笔记内容</div>
          <div class="muted">点击下方笔记标题即可查看详细内容</div>
          <div class="panel preview" v-html="renderMarkdown(activeMd)"></div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="row">
        <input v-model="q" placeholder="搜索标题或内容" />
        <button @click="reload">刷新</button>
      </div>
      <ul>
        <li v-for="n in filtered" :key="n.id">
          <div class="h3" @click="openNote(n)">{{ n.title }}</div>
          <div class="muted">{{ new Date(n.updatedAt).toLocaleString() }}</div>
          <div class="row">
            <input v-model="tagInput" placeholder="添加标签" @keydown.enter="addTag(n)" />
            <button @click="addTag(n)">添加</button>
            <select @change="e => addTagFromGlobal(n, (e.target as HTMLSelectElement).value)">
              <option value="">选择全局标签</option>
              <option v-for="t in globalTags" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
            <span class="tag" v-for="t in n.tags" :key="t">{{ t }}</span>
            <button class="danger" @click="delNote(n.id)">删除</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { listCourses } from '../repositories/courses'
import { createNote, listNotes, updateNote, removeNote } from '../repositories/notes'
import { listTags } from '../repositories/tags'
import { marked } from 'marked'
marked.setOptions({ gfm: true, breaks: true })

const courses = ref<any[]>([])
const title = ref('')
const courseId = ref<string>('')
const md = ref('')
const notes = ref<any[]>([])
const q = ref('')
const tagInput = ref('')
const globalTags = ref<any[]>([])
const activeMd = ref('')

onMounted(async () => {
  courses.value = await listCourses()
  globalTags.value = await listTags()
  await reload()
})

async function reload() {
  notes.value = await listNotes()
}

async function save() {
  if (!title.value.trim()) return
  await createNote({
    title: title.value.trim(),
    contentMd: md.value,
    courseId: courseId.value || undefined
  })
  title.value = ''
  courseId.value = ''
  md.value = '# 新笔记'
  await reload()
}

function renderMarkdown(src: string): string {
  return marked.parse(src ?? '')
}

const filtered = computed(() => {
  if (!q.value) return notes.value
  const s = q.value.toLowerCase()
  return notes.value.filter(n =>
    n.title.toLowerCase().includes(s) || n.contentMd.toLowerCase().includes(s)
  )
})

async function addTag(n: any) {
  const t = tagInput.value.trim()
  if (!t) return
  const tags = Array.from(new Set([...(n.tags || []), t]))
  await updateNote(n.id, { tags })
  tagInput.value = ''
  await reload()
}

async function addTagFromGlobal(n: any, tagId: string) {
  const tag = globalTags.value.find((t: any) => t.id === tagId)
  if (!tag) return
  const tags = Array.from(new Set([...(n.tags || []), tag.name]))
  await updateNote(n.id, { tags })
  await reload()
}

function openNote(n: any) {
  activeMd.value = n.contentMd || ''
}

async function delNote(id: string) {
  await removeNote(id)
  await reload()
}
</script>

<style scoped>
.preview {
  display: block;
  width: 100%;
  max-width: 100%;
  height: var(--preview-height, 360px);
  overflow-y: auto;
  overflow-x: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: normal;
}
textarea {
  min-height: 240px;
  resize: vertical;
}
</style>
