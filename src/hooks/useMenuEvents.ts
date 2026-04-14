import { useEffect } from 'react'
import { menuService, settingsRepo } from '../services/bridge'
import { useSnippetStore } from '../store/snippetStore'
import { useSettingsStore } from '../store/settingsStore'

export function useMenuEvents() {
  const addSnippet = useSnippetStore((s) => s.add)
  const loadSnippets = useSnippetStore((s) => s.load)
  const toggleTheme = useSettingsStore((s) => s.toggleTheme)
  const setStoragePath = useSettingsStore((s) => s.setStoragePath)

  useEffect(() => {
    const unsubs = [
      menuService.on('menu:new-snippet', () => addSnippet('Untitled', 'JavaScript')),
      menuService.on('menu:toggle-theme', () => toggleTheme()),
      menuService.on('menu:change-storage', () => {
        settingsRepo.chooseFolder().then((folder) => {
          if (folder) {
            setStoragePath(folder)
            loadSnippets()
          }
        })
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [addSnippet, loadSnippets, toggleTheme, setStoragePath])
}
