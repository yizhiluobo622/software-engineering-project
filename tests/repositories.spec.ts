import { describe, it, expect, beforeAll } from 'vitest'
import { db } from '../src/services/db'
import { createCourse, listCourses } from '../src/repositories/courses'
import { createResource, listResources } from '../src/repositories/resources'
import { createNote, listNotes } from '../src/repositories/notes'
import { createTask, listTasks } from '../src/repositories/tasks'

beforeAll(async () => {
  try {
    await db.courses.clear()
    await db.modules.clear()
    await db.resources.clear()
    await db.notes.clear()
    await db.tasks.clear()
    await db.tags.clear()
  } catch {}
})

describe('repositories', () => {
  it('course CRUD basic', async () => {
    await createCourse('软件工程', '2025春')
    const list = await listCourses()
    expect(list.length).toBe(1)
    expect(list[0].name).toBe('软件工程')
  })

  it('resource create', async () => {
    await createResource({ type: 'text', title: '课程大纲' })
    const list = await listResources()
    expect(list.length).toBe(1)
    expect(list[0].title).toBe('课程大纲')
  })

  it('note create', async () => {
    await createNote({ title: '第一次课堂笔记', contentMd: '# 内容' })
    const list = await listNotes()
    expect(list.length).toBe(1)
    expect(list[0].title).toBe('第一次课堂笔记')
  })

  it('task create', async () => {
    await createTask({ title: '完成实验一' })
    const list = await listTasks()
    expect(list.length).toBe(1)
    expect(list[0].title).toBe('完成实验一')
  })
})
