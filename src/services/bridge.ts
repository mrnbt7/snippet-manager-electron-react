import type { Snippet, SnippetRepository, SettingsRepository, WindowService, MenuService, Settings } from '../types/snippet'

const STORAGE_KEY = 'snippets'
const SETTINGS_KEY = 'settings'

interface RawElectronAPI {
  getAll: () => Promise<Snippet[]>
  save: (snippet: Snippet) => Promise<void>
  remove: (id: string) => Promise<void>
  resizeWindow: (w: number, h: number, hideMenu: boolean) => Promise<void>
  getSettings: () => Promise<Settings>
  saveSettings: (settings: Settings) => Promise<void>
  chooseFolder: () => Promise<string | null>
  getStoragePath: () => Promise<string>
  onMenuEvent: (channel: string, callback: () => void) => () => void
}

const raw = (window as unknown as { snippetAPI?: RawElectronAPI }).snippetAPI

function createLocalSnippetRepo(): SnippetRepository {
  const read = (): Snippet[] => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const write = (all: Snippet[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return {
    getAll: async () => read(),
    save: async (snippet) => {
      const all = read()
      const idx = all.findIndex((s) => s.id === snippet.id)
      if (idx >= 0) all[idx] = snippet; else all.push(snippet)
      write(all)
    },
    remove: async (id) => write(read().filter((s) => s.id !== id)),
  }
}

function createLocalSettingsRepo(): SettingsRepository {
  const defaults: Settings = { theme: 'dark', storagePath: '' }
  return {
    get: async () => JSON.parse(localStorage.getItem(SETTINGS_KEY) || JSON.stringify(defaults)),
    save: async (settings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)),
    chooseFolder: async () => null,
    getStoragePath: async () => '',
  }
}

const noopWindow: WindowService = { resize: async () => {} }
const noopMenu: MenuService = { on: () => () => {} }

export const snippetRepo: SnippetRepository = raw
  ? { getAll: raw.getAll, save: raw.save, remove: raw.remove }
  : createLocalSnippetRepo()

export const settingsRepo: SettingsRepository = raw
  ? { get: raw.getSettings, save: raw.saveSettings, chooseFolder: raw.chooseFolder, getStoragePath: raw.getStoragePath }
  : createLocalSettingsRepo()

export const windowService: WindowService = raw
  ? { resize: raw.resizeWindow }
  : noopWindow

export const menuService: MenuService = raw
  ? { on: raw.onMenuEvent }
  : noopMenu
