export interface Snippet {
  id: string
  title: string
  language: string
  code: string
  createdAt: number
  updatedAt: number
}

export type Theme = 'dark' | 'light'

export interface Settings {
  theme: Theme
  storagePath: string
}

export interface SnippetRepository {
  getAll: () => Promise<Snippet[]>
  save: (snippet: Snippet) => Promise<void>
  remove: (id: string) => Promise<void>
}

export interface SettingsRepository {
  get: () => Promise<Settings>
  save: (settings: Settings) => Promise<void>
  chooseFolder: () => Promise<string | null>
  getStoragePath: () => Promise<string>
}

export interface WindowService {
  resize: (width: number, height: number, hideMenu: boolean) => Promise<void>
}

export interface MenuService {
  on: (channel: string, callback: () => void) => () => void
}
