import { db } from '../services/db'
import type { Task, Priority, ID } from '../domain/types'
import { uid } from '../utils/id'

export async function createTask(input: {
  title: string
  courseId?: ID
  dueAt?: number
  priority?: Priority
  tags?: string[]
}): Promise<Task> {
  const task: Task = {
    id: uid('task'),
    title: input.title,
    courseId: input.courseId,
    dueAt: input.dueAt,
    priority: input.priority ?? 'mid',
    tags: input.tags ?? [],
    done: false,
    createdAt: Date.now()
  }
  await db.tasks.add(task)
  return task
}

export async function listTasks(): Promise<Task[]> {
  const all = await db.tasks.toArray()
  return all.sort((a, b) => {
    const av = a.dueAt ?? Number.MAX_SAFE_INTEGER
    const bv = b.dueAt ?? Number.MAX_SAFE_INTEGER
    return av - bv
  })
}

export async function updateTask(id: ID, patch: Partial<Task>): Promise<void> {
  await db.tasks.update(id, patch)
}

export async function removeTask(id: ID): Promise<void> {
  await db.tasks.delete(id)
}
