export interface Snippet {
  id: string
  title: string
  language: string
  code: string
  folderId: string | null
  createdAt: number
  updatedAt: number
}

export interface Folder {
  id: string
  name: string
  order: number
}

export type Theme = 'dark' | 'light'

export interface Settings {
  theme: Theme
  storagePath: string
}

export interface SnippetRepository {
  getAll: () => Promise<Snippet[]>
  save: (snippet: Snippet) => Promise<void>
  saveAll: (snippets: Snippet[]) => Promise<void>
  remove: (id: string) => Promise<void>
}

export interface FolderRepository {
  getAll: () => Promise<Folder[]>
  saveAll: (folders: Folder[]) => Promise<void>
}

export interface SettingsRepository {
  get: () => Promise<Settings>
  save: (settings: Settings) => Promise<void>
  chooseFolder: () => Promise<string | null>
  getStoragePath: () => Promise<string>
}

export interface WindowService {
  resize: (width: number, height: number, hideMenu: boolean) => Promise<void>
  dock: () => Promise<void>
  undock: () => Promise<void>
  dockResize: (width: number) => Promise<void>
}

export interface MenuService {
  on: (channel: string, callback: () => void) => () => void
}
