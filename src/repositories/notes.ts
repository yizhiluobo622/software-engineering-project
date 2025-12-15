import { db } from '../services/db'
import type { Note, ID } from '../domain/types'
import { uid } from '../utils/id'

export async function createNote(input: {
  courseId?: ID
  resourceId?: ID
  title: string
  contentMd: string
  tags?: string[]
}): Promise<Note> {
  const now = Date.now()
  const note: Note = {
    id: uid('note'),
    courseId: input.courseId,
    resourceId: input.resourceId,
    title: input.title,
    contentMd: input.contentMd,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now
  }
  await db.notes.add(note)
  return note
}

export async function updateNote(id: ID, patch: Partial<Note>): Promise<void> {
  patch.updatedAt = Date.now()
  await db.notes.update(id, patch)
}

export async function listNotes(): Promise<Note[]> {
  return db.notes.orderBy('updatedAt').reverse().toArray()
}

export async function removeNote(id: ID): Promise<void> {
  await db.notes.delete(id)
}

