import Dexie, { Table } from 'dexie'
import type { Course, Module, Resource, Note, Task, Tag } from '../domain/types'

export class StudyDB extends Dexie {
  courses!: Table<Course, string>
  modules!: Table<Module, string>
  resources!: Table<Resource, string>
  notes!: Table<Note, string>
  tasks!: Table<Task, string>
  tags!: Table<Tag, string>
  resBlobs!: Table<{ id: string; blob: Blob }, string>

  constructor() {
    super('smart-study-manager')
    // base schema for first-time users
    this.version(1).stores({
      courses: 'id, name, term',
      modules: 'id, courseId, order',
      resources: 'id, courseId, type, title',
      notes: 'id, courseId, resourceId, updatedAt',
      tasks: 'id, courseId, dueAt, done',
      tags: 'id, name'
    })
    // upgraded schema with createdAt index and resBlobs table
    this.version(2).stores({
      courses: 'id, name, term',
      modules: 'id, courseId, order',
      resources: 'id, courseId, type, title, createdAt',
      notes: 'id, courseId, resourceId, updatedAt',
      tasks: 'id, courseId, dueAt, done',
      tags: 'id, name',
      resBlobs: 'id'
    }).upgrade(async tx => {
      // ensure existing resources have createdAt for new index
      await tx.table('resources').toCollection().modify((r: any) => {
        if (r.createdAt == null) r.createdAt = Date.now()
      })
    })
  }
}

export const db = new StudyDB()
