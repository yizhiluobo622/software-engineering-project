<template>
  <div class="col">
    <div class="row">
      <div class="h1">课程</div>
      <div class="row">
        <input v-model="name" placeholder="课程名称" />
        <input v-model="term" placeholder="学期" />
        <button @click="addCourse">创建课程</button>
      </div>
    </div>
    <div class="panel">
      <table style="width:100%">
        <thead>
          <tr><th align="left">名称</th><th align="left">学期</th><th align="left">标签</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in courses" :key="c.id">
            <td><router-link class="link" :to="`/courses/${c.id}`">{{ c.name }}</router-link></td>
            <td>{{ c.term || '-' }}</td>
            <td>
              <span v-for="t in c.tags" :key="t" class="tag">{{ t }}</span>
            </td>
            <td>
              <button class="danger" @click="remove(c.id)">删除</button>
              <input v-model="tagInput[c.id]" placeholder="添加标签" />
              <button @click="addTag(c.id)">添加</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listCourses, createCourse, removeCourse, updateCourse } from '../repositories/courses'

const name = ref('')
const term = ref('')
const courses = ref<any[]>([])
const tagInput = ref<Record<string, string>>({})

async function reload() {
  courses.value = await listCourses()
}
onMounted(reload)

async function addCourse() {
  if (!name.value.trim()) return
  await createCourse(name.value.trim(), term.value.trim() || undefined)
  name.value = ''
  term.value = ''
  await reload()
}
async function remove(id: string) {
  await removeCourse(id)
  await reload()
}

async function addTag(id: string) {
  const t = (tagInput.value[id] || '').trim()
  if (!t) return
  const course = courses.value.find((c: any) => c.id === id)
  const next = Array.from(new Set([...(course?.tags || []), t]))
  await updateCourse(id, { tags: next })
  tagInput.value[id] = ''
  await reload()
}
</script>
