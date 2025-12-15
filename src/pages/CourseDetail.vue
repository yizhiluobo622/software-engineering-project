<template>
  <div class="col" v-if="course">
    <div class="row">
      <div class="h1">{{ course.name }}</div>
      <span class="muted">学期：{{ course.term || '-' }}</span>
    </div>
    <div class="grid cols-2">
      <div class="panel">
        <div class="h3">模块</div>
        <div class="row">
          <input v-model="modTitle" placeholder="模块标题" />
          <input v-model.number="modOrder" type="number" placeholder="排序" />
          <button @click="addMod">添加</button>
        </div>
        <ul>
          <li v-for="m in modules" :key="m.id">{{ m.order }} · {{ m.title }}</li>
        </ul>
      </div>
      <div class="panel">
        <div class="h3">关联资源</div>
        <ul>
          <li v-for="r in resources" :key="r.id">{{ r.title }} <span class="muted">({{ r.type }})</span></li>
        </ul>
      </div>
    </div>
    <div class="panel">
      <div class="h3">关联笔记</div>
      <ul>
        <li v-for="n in notes" :key="n.id">{{ n.title }}</li>
      </ul>
    </div>
  </div>
  <div v-else class="panel">课程不存在</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getCourse, addModule, listModules } from '../repositories/courses'
import { db } from '../services/db'

const route = useRoute()
const course = ref<any>(null)
const modules = ref<any[]>([])
const resources = ref<any[]>([])
const notes = ref<any[]>([])

const modTitle = ref('')
const modOrder = ref(1)

onMounted(async () => {
  const id = String(route.params.id)
  course.value = await getCourse(id)
  modules.value = await listModules(id)
  resources.value = await db.resources.where('courseId').equals(id).toArray()
  notes.value = await db.notes.where('courseId').equals(id).toArray()
})

async function addMod() {
  if (!course.value) return
  if (!modTitle.value.trim()) return
  await addModule(course.value.id, modTitle.value.trim(), modOrder.value || 1)
  modules.value = await listModules(course.value.id)
  modTitle.value = ''
  modOrder.value = 1
}
</script>

