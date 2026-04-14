import { useEffect, useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import { useSnippetStore } from './store/snippetStore'
import { useSettingsStore } from './store/settingsStore'
import { useMenuEvents } from './hooks/useMenuEvents'
import { windowService } from './services/bridge'
import './App.css'

const FULL_WIDTH = 1000
const SIDEBAR_WIDTH = 340
const HEIGHT = 700

export default function App() {
  const loadSnippets = useSnippetStore((s) => s.load)
  const loadSettings = useSettingsStore((s) => s.load)
  const theme = useSettingsStore((s) => s.theme)
  const [sidebarOnly, setSidebarOnly] = useState(false)

  useEffect(() => { loadSnippets(); loadSettings() }, [loadSnippets, loadSettings])
  useMenuEvents()

  const toggle = useCallback(() => {
    const next = !sidebarOnly
    setSidebarOnly(next)
    windowService.resize(next ? SIDEBAR_WIDTH : FULL_WIDTH, HEIGHT, next)
  }, [sidebarOnly])

  return (
    <div className={`app ${sidebarOnly ? 'sidebar-only' : ''}`} data-theme={theme}>
      <Sidebar sidebarOnly={sidebarOnly} onToggle={toggle} />
      {!sidebarOnly && <Editor theme={theme} />}
    </div>
  )
}
