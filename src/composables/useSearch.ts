import type { Course, Resource, Note, Task } from '../domain/types'

export interface SearchResult {
  courses: Course[]
  resources: Resource[]
  notes: Note[]
  tasks: Task[]
}

function includes(text: string | undefined, q: string): boolean {
  if (!text) return false
  return text.toLowerCase().includes(q.toLowerCase())
}

export function filterResults(q: string, data: {
  courses: Course[]
  resources: Resource[]
  notes: Note[]
  tasks: Task[]
}): SearchResult {
  if (!q) return data
  return {
    courses: data.courses.filter(c => includes(c.name, q) || includes(c.term, q)),
    resources: data.resources.filter(r => includes(r.title, q) || r.authors.some(a => includes(a, q))),
    notes: data.notes.filter(n => includes(n.title, q) || includes(n.contentMd, q)),
    tasks: data.tasks.filter(t => includes(t.title, q))
  }
}

