<template>
  <div class="col">
    <div class="row">
      <div class="h1">搜索</div>
      <input v-model="q" placeholder="搜索关键字" @keydown.enter="reload" />
      <button @click="reload">搜索</button>
    </div>
    <div class="grid cols-3">
      <div class="panel">
        <div class="h3">课程</div>
        <ul><li v-for="c in results.courses" :key="c.id">{{ c.name }}</li></ul>
      </div>
      <div class="panel">
        <div class="h3">资源</div>
        <ul><li v-for="r in results.resources" :key="r.id">{{ r.title }} <span class="muted">({{ r.type }})</span></li></ul>
      </div>
      <div class="panel">
        <div class="h3">笔记</div>
        <ul><li v-for="n in results.notes" :key="n.id">{{ n.title }}</li></ul>
      </div>
    </div>
    <div class="panel">
      <div class="h3">任务</div>
      <ul><li v-for="t in results.tasks" :key="t.id">{{ t.title }}</li></ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../services/db'
import { filterResults } from '../composables/useSearch'

const route = useRoute()
const q = ref(String(route.query.q || ''))
const results = ref({ courses: [], resources: [], notes: [], tasks: [] } as any)

async function reload() {
  const data = {
    courses: await db.courses.toArray(),
    resources: await db.resources.toArray(),
    notes: await db.notes.toArray(),
    tasks: await db.tasks.toArray()
  }
  results.value = filterResults(q.value, data) as any
}
onMounted(reload)
</script>

