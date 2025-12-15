export function uid(prefix = ''): string {
  const s = Math.random().toString(36).slice(2) + Date.now().toString(36)
  return prefix ? `${prefix}_${s}` : s
}

