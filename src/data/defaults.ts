import type { Snippet } from '../types/snippet'
import rawDefaults from './defaults.json'

export function createDefaultSnippets(): Snippet[] {
  const now = Date.now()
  return rawDefaults.map((s) => ({ ...s, createdAt: now, updatedAt: now }))
}
