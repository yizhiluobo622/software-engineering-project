import { db } from '../services/db'
import type { Course, Module, ID } from '../domain/types'
import { uid } from '../utils/id'

export async function createCourse(name: string, term?: string, tags: string[] = []): Promise<Course> {
  const course: Course = { id: uid('course'), name, term, tags, createdAt: Date.now() }
  await db.courses.add(course)
  return course
}

export async function listCourses(): Promise<Course[]> {
  return db.courses.orderBy('name').toArray()
}

export async function getCourse(id: ID): Promise<Course | undefined> {
  return db.courses.get(id)
}

export async function updateCourse(id: ID, patch: Partial<Course>): Promise<void> {
  await db.courses.update(id, patch)
}

export async function removeCourse(id: ID): Promise<void> {
  await db.transaction('rw', db.modules, db.courses, async () => {
    const mods = await db.modules.where('courseId').equals(id).toArray()
    const res = await db.resources.where('courseId').equals(id).toArray()
    const notes = await db.notes.where('courseId').equals(id).toArray()
    const tasks = await db.tasks.where('courseId').equals(id).toArray()
    await db.modules.bulkDelete(mods.map(m => m.id))
    await db.resources.bulkDelete(res.map(r => r.id))
    await db.notes.bulkDelete(notes.map(n => n.id))
    await db.tasks.bulkDelete(tasks.map(t => t.id))
    await db.courses.delete(id)
  })
}

export async function addModule(courseId: ID, title: string, order: number): Promise<Module> {
  const mod: Module = { id: uid('module'), courseId, title, order }
  await db.modules.add(mod)
  return mod
}

export async function listModules(courseId: ID): Promise<Module[]> {
  return db.modules.where('courseId').equals(courseId).sortBy('order')
}

