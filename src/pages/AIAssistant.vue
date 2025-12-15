<template>
  <div class="col">
    <div class="row">
      <div class="h1">AI 助手</div>
      <span class="muted">跳转至 DeepSeek 官网对话，并使用以下框中的内容与结果</span>
      <button @click="openDS">打开 DeepSeek 官网</button>
    </div>
  <div class="grid cols-2">
      <div class="panel col">
        <div class="h3">本地数据导出（摘要 JSON）</div>
        <div class="row">
          <button @click="buildDataJson">生成数据摘要 JSON</button>
        </div>
        <textarea v-model="dataJson" rows="14" placeholder='点击“生成数据摘要 JSON”后，此处将填充 {"tasks":[...], "courses":[...]}'></textarea>
      </div>
      <div class="panel col">
        <div class="h3">给 DeepSeek 的提示词（预装）</div>
        <div class="muted">提示：请将导出的数据复制到下方提示词中的占位位置</div>
        <textarea v-model="dsPrompt" rows="14"></textarea>
      </div>
    </div>
    <div class="panel col">
      <div class="h3">导入 DeepSeek 回复（JSON）</div>
      <textarea v-model="importText" rows="16" placeholder='粘贴 AI 返回的 JSON，如 {"tasks":[...], "courses":[...]}'></textarea>
      <div class="row">
        <button class="danger" @click="applyImport">一键导入（覆盖本地数据）</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from '../services/db'

const dataJson = ref('')
const dsPrompt = ref(`这里是我的课程及日程安排等，请你按下述格式进行分析与建议，并在必要时给出修改方案：

【数据占位】
在此粘贴我导出的 JSON 摘要

【格式说明】
{
  "tasks": [
    { "title": "任务标题", "dueAt": "YYYY-MM-DD", "priority": "low|mid|high", "tags": ["标签1","标签2"] }
  ],
  "courses": [
    { "name": "课程名称", "term": "学期", "tags": ["标签"], "modules": [
      { "title": "模块标题", "order": 1 }
    ]}
  ]
}

要求：
1. 如果你对我的日程安排有修改建议，可以按上面的 JSON 结构给我建议。
2. 对“tasks”中的日期请使用 YYYY-MM-DD。
3. 优先级仅允许 low、mid、high 三种。
4. 如需新增课程或模块请完整填充 courses 数组。
5. 如果你有什么生活上的建议，或者习惯的养成建议，可以顺带告诉我。
`)
const importText = ref('')

function openDS() {
  window.open('https://chat.deepseek.com/', '_blank')
}

async function buildDataJson() {
  const courses = await db.courses.toArray()
  const modules = await db.modules.toArray()
  const tasks = await db.tasks.toArray()
  const courseOut = courses.map(c => ({
    name: c.name,
    term: c.term,
    tags: c.tags,
    modules: modules.filter(m => m.courseId === c.id).map(m => ({ title: m.title, order: m.order }))
  }))
  const taskOut = tasks.map(t => ({
    title: t.title,
    dueAt: t.dueAt ? new Date(t.dueAt).toISOString().slice(0,10) : undefined,
    priority: t.priority,
    tags: t.tags
  }))
  dataJson.value = JSON.stringify({ tasks: taskOut, courses: courseOut }, null, 2)
}

async function applyImport() {
  let data: any
  try {
    data = JSON.parse(importText.value || '{}')
  } catch (e) {
    alert('JSON 解析失败，请检查格式')
    return
  }
  await db.transaction('rw', db.tasks, db.courses, db.modules, async () => {
    if (Array.isArray(data.tasks)) {
      await db.tasks.clear()
      const toAdd = data.tasks.map((t: any) => ({
        id: `${Math.random().toString(36).slice(2)}`,
        title: String(t.title || ''),
        dueAt: t.dueAt ? new Date(t.dueAt).getTime() : undefined,
        priority: ['low','mid','high'].includes(t.priority) ? t.priority : 'mid',
        tags: Array.isArray(t.tags) ? t.tags : [],
        done: false,
        createdAt: Date.now()
      }))
      await db.tasks.bulkAdd(toAdd)
    }
    if (Array.isArray(data.courses)) {
      await db.courses.clear()
      await db.modules.clear()
      for (const c of data.courses) {
        const cid = `${Math.random().toString(36).slice(2)}`
        await db.courses.add({ id: cid, name: String(c.name||''), term: String(c.term||''), tags: Array.isArray(c.tags)?c.tags:[], createdAt: Date.now() })
        if (Array.isArray(c.modules)) {
          for (const m of c.modules) {
            await db.modules.add({ id: `${Math.random().toString(36).slice(2)}`, courseId: cid, title: String(m.title||''), order: Number(m.order||1) })
          }
        }
      }
    }
  })
  alert('导入完成，已覆盖本地数据（任务与课程/模块）')
}
</script>

<style scoped></style>
