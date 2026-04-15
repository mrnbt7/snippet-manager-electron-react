import type { Snippet, SnippetRepository } from '../types/snippet'
import { LANGUAGE_NAMES } from '../languages'

const langMap = Object.fromEntries(LANGUAGE_NAMES.map((n) => [n.toLowerCase(), n]))

function migrateOne(s: Snippet): Snippet {
  let changed = s
  if (!LANGUAGE_NAMES.includes(s.language)) {
    changed = { ...changed, language: langMap[s.language.toLowerCase()] ?? s.language }
  }
  if (changed.folderId === undefined) {
    changed = { ...changed, folderId: null }
  }
  return changed
}

export async function migrateSnippets(repo: SnippetRepository, snippets: Snippet[]): Promise<Snippet[]> {
  let changed = false
  const migrated = snippets.map((s) => {
    const m = migrateOne(s)
    if (m !== s) changed = true
    return m
  })
  if (changed) await repo.saveAll(migrated)
  return migrated
}
