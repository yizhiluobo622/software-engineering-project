<template>
  <div class="col">
    <div class="row">
      <div class="h1">总览</div>
      <span class="muted">概览与最近更新</span>
    </div>
    <div class="grid cols-3">
      <div class="panel">
        <div class="h3">课程</div>
        <div>{{ counts.courses }}</div>
      </div>
      <div class="panel">
        <div class="h3">资源</div>
        <div>{{ counts.resources }}</div>
      </div>
      <div class="panel">
        <div class="h3">笔记</div>
        <div>{{ counts.notes }}</div>
      </div>
    </div>
    <div class="panel">
      <div class="h3">任务完成率</div>
      <div>{{ completionRate }}%</div>
    </div>
    <div class="panel">
      <div class="h3">最近更新</div>
      <ul>
        <li v-for="n in recentNotes" :key="n.id">{{ n.title }} · {{ new Date(n.updatedAt).toLocaleString() }}</li>
      </ul>
    </div>
    <div class="panel">
      <div class="h3">新手引导</div>
      <div v-if="counts.courses === 0" class="muted">暂无课程，前往“课程”页面创建一个吧。</div>
      <div v-if="counts.resources === 0" class="muted">暂无资源，前往“资源库”导入文件。</div>
      <div v-if="counts.notes === 0" class="muted">暂无笔记，前往“笔记”页面新建。</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '../services/db'

const counts = ref({ courses: 0, resources: 0, notes: 0 })
const completionRate = ref(0)
const recentNotes = ref<any[]>([])

onMounted(async () => {
  try {
    const courses = await db.courses.toArray()
    const resources = await db.resources.toArray()
    const notes = await db.notes.toArray()
    const tasks = await db.tasks.toArray()
    counts.value.courses = courses.length
    counts.value.resources = resources.length
    counts.value.notes = notes.length
    const doneTasks = tasks.filter(t => t.done === true).length
    completionRate.value = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0
    recentNotes.value = notes.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)).slice(0, 5)
  } catch (e) {
    console.error('Dashboard init failed', e)
  }
})
</script>
