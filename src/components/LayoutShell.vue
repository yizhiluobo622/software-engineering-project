<template>
  <div class="layout">
    <aside class="sidebar panel">
      <div class="h2">智能学习管理</div>
      <div class="col" style="margin-top:8px">
        <input v-model="q" placeholder="全局搜索…" @keydown.enter="goSearch" />
        <button @click="goSearch">搜索</button>
      </div>
      <nav class="col" style="margin-top:8px">
        <router-link to="/">仪表盘</router-link>
        <router-link to="/courses">课程</router-link>
        <router-link to="/resources">资源库</router-link>
        <router-link to="/notes">笔记</router-link>
        <router-link to="/tasks">任务</router-link>
        <router-link to="/tags">标签</router-link>
        <router-link to="/settings">设置</router-link>
        <router-link to="/assistant">AI 助手</router-link>
      </nav>
    </aside>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const q = ref('')
const router = useRouter()
function goSearch() {
  router.push({ name: 'search', query: { q: q.value } })
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100%;
  gap: 16px;
  padding: 16px;
}
.sidebar nav a {
  padding: 8px 10px;
  border-radius: 8px;
}
.sidebar nav a.router-link-active {
  background: #eef2ff;
  color: var(--primary);
  border: 1px solid var(--primary);
}
.content {
  overflow: auto;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 8px;
}
</style>
