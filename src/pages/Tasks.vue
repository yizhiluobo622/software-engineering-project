<template>
  <div class="col">
    <div class="row">
      <div class="h1">任务</div>
      <span class="muted">待办与简易日历</span>
    </div>
    <div class="panel row">
      <input v-model="title" placeholder="任务标题" />
      <input v-model="due" type="date" />
      <select v-model="priority">
        <option value="low">低</option>
        <option value="mid">中</option>
        <option value="high">高</option>
      </select>
      <button @click="addTask">添加</button>
    </div>
    <div class="grid cols-2">
      <div class="panel">
        <div class="h3">列表</div>
        <ul>
          <li v-for="t in tasks" :key="t.id" class="row">
            <input type="checkbox" :checked="t.done" @change="toggleDone(t)" />
            <span>{{ t.title }}</span>
            <span class="muted">{{ t.dueAt ? new Date(t.dueAt).toLocaleDateString() : '-' }}</span>
            <span class="tag">{{ t.priority }}</span>
            <button class="danger" @click="remove(t.id)">删除</button>
          </li>
        </ul>
      </div>
      <div class="panel">
        <div class="h3">简易日历</div>
        <ul>
          <li v-for="d in groupedDates" :key="d.date">
            <strong>{{ d.date }}</strong>
            <ul>
              <li v-for="t in d.items" :key="t.id">{{ t.title }} <span class="tag">{{ t.priority }}</span></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { createTask, listTasks, updateTask, removeTask } from '../repositories/tasks'
import { todayYMD } from '../utils/date'

const title = ref('')
const due = ref(todayYMD())
const priority = ref<'low' | 'mid' | 'high'>('mid')
const tasks = ref<any[]>([])

async function reload() {
  tasks.value = await listTasks()
}
onMounted(reload)

async function addTask() {
  if (!title.value.trim()) return
  const dueAt = due.value ? new Date(due.value).getTime() : undefined
  await createTask({ title: title.value.trim(), dueAt, priority: priority.value })
  title.value = ''
  await reload()
}

async function toggleDone(t: any) {
  await updateTask(t.id, { done: !t.done })
  await reload()
}
async function remove(id: string) {
  await removeTask(id)
  await reload()
}

const groupedDates = computed(() => {
  const map: Record<string, any[]> = {}
  for (const t of tasks.value) {
    const d = t.dueAt ? new Date(t.dueAt).toISOString().slice(0, 10) : '无日期'
    map[d] = map[d] || []
    map[d].push(t)
  }
  return Object.keys(map).sort().map(date => ({ date, items: map[date] }))
})
</script>
