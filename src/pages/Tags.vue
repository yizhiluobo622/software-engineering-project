<template>
  <div class="col">
    <div class="row">
      <div class="h1">标签管理</div>
      <input v-model="tagName" placeholder="新标签名称" />
      <button @click="add">添加</button>
    </div>
    <div class="panel">
      <ul>
        <li v-for="t in tags" :key="t.id" class="row">
          <span class="tag">{{ t.name }}</span>
          <button class="danger" @click="removeOne(t.id)">删除</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listTags, createTag, removeTag } from '../repositories/tags'

const tagName = ref('')
const tags = ref<any[]>([])

async function reload() {
  tags.value = await listTags()
}
onMounted(reload)

async function add() {
  const name = tagName.value.trim()
  if (!name) return
  await createTag(name)
  tagName.value = ''
  await reload()
}

async function removeOne(id: string) {
  await removeTag(id)
  await reload()
}
</script>
