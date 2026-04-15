import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { Snippet, Folder } from '../types/snippet'
import { snippetRepo, folderRepo } from '../services/bridge'
import { migrateSnippets } from '../services/migration'
import { createDefaultSnippets } from '../data/defaults'

interface SnippetStore {
  snippets: Snippet[]
  folders: Folder[]
  selectedId: string | null
  search: string
  load: () => Promise<void>
  select: (id: string | null) => void
  setSearch: (q: string) => void
  add: (title: string, language: string, folderId?: string | null) => Promise<void>
  update: (id: string, patch: Partial<Pick<Snippet, 'title' | 'language' | 'code' | 'folderId'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  reorder: (fromId: string, toId: string) => Promise<void>
  addFolder: (name: string) => Promise<void>
  renameFolder: (id: string, name: string) => Promise<void>
  removeFolder: (id: string) => Promise<void>
}

export const useSnippetStore = create<SnippetStore>((set, get) => ({
  snippets: [],
  folders: [],
  selectedId: null,
  search: '',

  load: async () => {
    let snippets = await snippetRepo.getAll()
    if (!snippets.length) {
      snippets = createDefaultSnippets()
      await snippetRepo.saveAll(snippets)
    }
    snippets = await migrateSnippets(snippetRepo, snippets)
    const folders = await folderRepo.getAll()
    set({ snippets, folders })
  },

  select: (id) => set({ selectedId: id }),
  setSearch: (search) => set({ search }),

  add: async (title, language, folderId = null) => {
    const now = Date.now()
    const snippet: Snippet = { id: uuid(), title, language, code: '', folderId, createdAt: now, updatedAt: now }
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

  reorder: async (fromId, toId) => {
    const { snippets } = get()
    const fromIdx = snippets.findIndex((s) => s.id === fromId)
    const toIdx = snippets.findIndex((s) => s.id === toId)
    if (fromIdx < 0 || toIdx < 0) return
    const reordered = [...snippets]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    set({ snippets: reordered })
    await snippetRepo.saveAll(reordered)
  },

  addFolder: async (name) => {
    const { folders } = get()
    const folder: Folder = { id: uuid(), name, order: folders.length }
    const updated = [...folders, folder]
    set({ folders: updated })
    await folderRepo.saveAll(updated)
  },

  renameFolder: async (id, name) => {
    const updated = get().folders.map((f) => (f.id === id ? { ...f, name } : f))
    set({ folders: updated })
    await folderRepo.saveAll(updated)
  },

  removeFolder: async (id) => {
    const folders = get().folders.filter((f) => f.id !== id)
    const snippets = get().snippets.map((s) => (s.folderId === id ? { ...s, folderId: null } : s))
    set({ folders, snippets })
    await folderRepo.saveAll(folders)
    await snippetRepo.saveAll(snippets)
  },
}))
