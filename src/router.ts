import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'dashboard', component: () => import('./pages/Dashboard.vue') },
  { path: '/courses', name: 'courses', component: () => import('./pages/Courses.vue') },
  { path: '/courses/:id', name: 'course-detail', component: () => import('./pages/CourseDetail.vue') },
  { path: '/resources', name: 'resources', component: () => import('./pages/Resources.vue') },
  { path: '/notes', name: 'notes', component: () => import('./pages/Notes.vue') },
  { path: '/tasks', name: 'tasks', component: () => import('./pages/Tasks.vue') },
  { path: '/settings', name: 'settings', component: () => import('./pages/Settings.vue') },
  { path: '/search', name: 'search', component: () => import('./pages/Search.vue') },
  { path: '/tags', name: 'tags', component: () => import('./pages/Tags.vue') }
  ,
  { path: '/assistant', name: 'assistant', component: () => import('./pages/AIAssistant.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
