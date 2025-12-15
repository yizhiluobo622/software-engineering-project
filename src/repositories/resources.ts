import { db } from '../services/db'
import type { Resource, ResourceType, ID } from '../domain/types'
import { uid } from '../utils/id'

export async function createResource(input: {
  courseId?: ID
  type: ResourceType
  title: string
  authors?: string[]
  tags?: string[]
  blobRef?: string
  meta?: Record<string, unknown>
}): Promise<Resource> {
  const resource: Resource = {
    id: uid('res'),
    courseId: input.courseId,
    type: input.type,
    title: input.title,
    authors: input.authors ?? [],
    tags: input.tags ?? [],
    blobRef: input.blobRef,
    meta: input.meta,
    createdAt: Date.now()
  }
  await db.resources.add(resource)
  if (input.meta && input.meta.blob instanceof Blob) {
    await db.resBlobs.put({ id: resource.id, blob: input.meta.blob as Blob })
  }
  return resource
}

export async function listResources(): Promise<Resource[]> {
  return db.resources.orderBy('createdAt').reverse().toArray()
}

export async function getResource(id: ID): Promise<Resource | undefined> {
  return db.resources.get(id)
}

export async function updateResource(id: ID, patch: Partial<Resource>): Promise<void> {
  await db.resources.update(id, patch)
}

export async function removeResource(id: ID): Promise<void> {
  await db.resBlobs.delete(id)
  await db.resources.delete(id)
}
