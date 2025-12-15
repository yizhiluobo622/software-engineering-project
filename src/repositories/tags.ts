import { db } from '../services/db'
import type { Tag } from '../domain/types'
import { uid } from '../utils/id'

export async function createTag(name: string, color?: string): Promise<Tag> {
  const tag: Tag = { id: uid('tag'), name, color }
  await db.tags.add(tag)
  return tag
}

export async function listTags(): Promise<Tag[]> {
  return db.tags.orderBy('name').toArray()
}

export async function removeTag(id: string): Promise<void> {
  await db.tags.delete(id)
}

