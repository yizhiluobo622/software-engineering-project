export type ID = string

export interface Course {
  id: ID
  name: string
  term?: string
  tags: string[]
  createdAt: number
}

export interface Module {
  id: ID
  courseId: ID
  title: string
  order: number
}

export type ResourceType = 'pdf' | 'image' | 'text' | 'doc' | 'ppt' | 'file'

export interface Resource {
  id: ID
  courseId?: ID
  type: ResourceType
  title: string
  authors: string[]
  tags: string[]
  blobRef?: string
  meta?: Record<string, unknown>
  createdAt: number
}

export interface Note {
  id: ID
  courseId?: ID
  resourceId?: ID
  title: string
  contentMd: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export type Priority = 'low' | 'mid' | 'high'

export interface Task {
  id: ID
  title: string
  courseId?: ID
  dueAt?: number
  priority: Priority
  tags: string[]
  done: boolean
  createdAt: number
}

export interface Tag {
  id: ID
  name: string
  color?: string
}
