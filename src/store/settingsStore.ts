import { create } from 'zustand'
import type { Theme, Settings } from '../types/snippet'
import { settingsRepo } from '../services/bridge'

interface SettingsStore {
  theme: Theme
  storagePath: string
  load: () => Promise<void>
  toggleTheme: () => Promise<void>
  setStoragePath: (path: string) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  theme: 'dark',
  storagePath: '',

  load: async () => {
    const settings = await settingsRepo.get()
    const path = await settingsRepo.getStoragePath()
    set({ theme: settings.theme ?? 'dark', storagePath: settings.storagePath || path })
  },

  toggleTheme: async () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    set({ theme: next })
    await settingsRepo.save({ theme: next, storagePath: get().storagePath })
  },

  setStoragePath: async (storagePath) => {
    set({ storagePath })
    await settingsRepo.save({ theme: get().theme, storagePath })
  },
}))
