import type { Snippet, Folder, SnippetRepository, FolderRepository, SettingsRepository, WindowService, MenuService, Settings } from '../types/snippet'

const STORAGE_KEY = 'snippets'
const FOLDERS_KEY = 'folders'
const SETTINGS_KEY = 'settings'

interface RawElectronAPI {
  getAll: () => Promise<Snippet[]>
  save: (snippet: Snippet) => Promise<void>
  saveAll: (snippets: Snippet[]) => Promise<void>
  remove: (id: string) => Promise<void>
  getFolders: () => Promise<Folder[]>
  saveFolders: (folders: Folder[]) => Promise<void>
  resizeWindow: (w: number, h: number, hideMenu: boolean) => Promise<void>
  dockWindow: () => Promise<void>
  undockWindow: () => Promise<void>
  dockResize: (w: number) => Promise<void>
  getSettings: () => Promise<Settings>
  saveSettings: (settings: Settings) => Promise<void>
  chooseFolder: () => Promise<string | null>
  getStoragePath: () => Promise<string>
  onMenuEvent: (channel: string, callback: () => void) => () => void
}

const raw = (window as unknown as { snippetAPI?: RawElectronAPI }).snippetAPI

function localJsonStore<T>(key: string, fallback: T): { read: () => T; write: (v: T) => void } {
  return {
    read: () => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)),
    write: (v) => localStorage.setItem(key, JSON.stringify(v)),
  }
}

function createLocalSnippetRepo(): SnippetRepository {
  const { read, write } = localJsonStore<Snippet[]>(STORAGE_KEY, [])
  return {
    getAll: async () => read(),
    save: async (snippet) => {
      const all = read()
      const idx = all.findIndex((s) => s.id === snippet.id)
      if (idx >= 0) all[idx] = snippet; else all.push(snippet)
      write(all)
    },
    saveAll: async (snippets) => write(snippets),
    remove: async (id) => write(read().filter((s) => s.id !== id)),
  }
}

function createLocalFolderRepo(): FolderRepository {
  const { read, write } = localJsonStore<Folder[]>(FOLDERS_KEY, [])
  return {
    getAll: async () => read(),
    saveAll: async (folders) => write(folders),
  }
}

function createLocalSettingsRepo(): SettingsRepository {
  const { read, write } = localJsonStore<Settings>(SETTINGS_KEY, { theme: 'dark', storagePath: '' })
  return {
    get: async () => read(),
    save: async (settings) => write(settings),
    chooseFolder: async () => null,
    getStoragePath: async () => '',
  }
}

const noopWindow: WindowService = { resize: async () => {}, dock: async () => {}, undock: async () => {}, dockResize: async () => {} }
const noopMenu: MenuService = { on: () => () => {} }

export const snippetRepo: SnippetRepository = raw
  ? { getAll: raw.getAll, save: raw.save, saveAll: raw.saveAll, remove: raw.remove }
  : createLocalSnippetRepo()

export const folderRepo: FolderRepository = raw
  ? { getAll: raw.getFolders, saveAll: raw.saveFolders }
  : createLocalFolderRepo()

export const settingsRepo: SettingsRepository = raw
  ? { get: raw.getSettings, save: raw.saveSettings, chooseFolder: raw.chooseFolder, getStoragePath: raw.getStoragePath }
  : createLocalSettingsRepo()

export const windowService: WindowService = raw
  ? { resize: raw.resizeWindow, dock: raw.dockWindow, undock: raw.undockWindow, dockResize: raw.dockResize }
  : noopWindow

export const menuService: MenuService = raw
  ? { on: raw.onMenuEvent }
  : noopMenu
