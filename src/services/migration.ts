import type { Snippet, SnippetRepository } from '../types/snippet'
import { LANGUAGE_NAMES } from '../languages'

const langMap = Object.fromEntries(LANGUAGE_NAMES.map((n) => [n.toLowerCase(), n]))

function migrateLang(s: Snippet): Snippet {
  if (LANGUAGE_NAMES.includes(s.language)) return s
  return { ...s, language: langMap[s.language.toLowerCase()] ?? s.language }
}

export async function migrateSnippets(repo: SnippetRepository, snippets: Snippet[]): Promise<Snippet[]> {
  let changed = false
  const migrated = snippets.map((s) => {
    const m = migrateLang(s)
    if (m !== s) changed = true
    return m
  })
  if (changed) {
    for (const s of migrated) await repo.save(s)
  }
  return migrated
}
