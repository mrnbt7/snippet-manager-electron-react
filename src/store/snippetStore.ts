import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { Snippet } from '../types/snippet'
import { snippetRepo } from '../services/bridge'
import { migrateSnippets } from '../services/migration'
import { createDefaultSnippets } from '../data/defaults'

interface SnippetStore {
  snippets: Snippet[]
  selectedId: string | null
  search: string
  load: () => Promise<void>
  select: (id: string | null) => void
  setSearch: (q: string) => void
  add: (title: string, language: string) => Promise<void>
  update: (id: string, patch: Partial<Pick<Snippet, 'title' | 'language' | 'code'>>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useSnippetStore = create<SnippetStore>((set, get) => ({
  snippets: [],
  selectedId: null,
  search: '',

  load: async () => {
    let snippets = await snippetRepo.getAll()
    if (!snippets.length) {
      snippets = createDefaultSnippets()
      for (const s of snippets) await snippetRepo.save(s)
    }
    snippets = await migrateSnippets(snippetRepo, snippets)
    set({ snippets })
  },

  select: (id) => set({ selectedId: id }),
  setSearch: (search) => set({ search }),

  add: async (title, language) => {
    const now = Date.now()
    const snippet: Snippet = { id: uuid(), title, language, code: '', createdAt: now, updatedAt: now }
    await snippetRepo.save(snippet)
    set((s) => ({ snippets: [...s.snippets, snippet], selectedId: snippet.id }))
  },

  update: async (id, patch) => {
    const snippet = get().snippets.find((s) => s.id === id)
    if (!snippet) return
    const updated = { ...snippet, ...patch, updatedAt: Date.now() }
    await snippetRepo.save(updated)
    set((s) => ({ snippets: s.snippets.map((x) => (x.id === id ? updated : x)) }))
  },

  remove: async (id) => {
    await snippetRepo.remove(id)
    set((s) => ({
      snippets: s.snippets.filter((x) => x.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    }))
  },
}))
