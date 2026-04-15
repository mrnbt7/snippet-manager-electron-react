import { useEffect, useState, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import { useSnippetStore } from './store/snippetStore'
import { useSettingsStore } from './store/settingsStore'
import { useMenuEvents } from './hooks/useMenuEvents'
import { windowService } from './services/bridge'
import { LAYOUT } from './constants'
import './App.css'

export default function App() {
  const loadSnippets = useSnippetStore((s) => s.load)
  const loadSettings = useSettingsStore((s) => s.load)
  const theme = useSettingsStore((s) => s.theme)
  const [sidebarOnly, setSidebarOnly] = useState(false)
  const [docked, setDocked] = useState(false)
  const [dockExpanded, setDockExpanded] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState<number>(LAYOUT.DEFAULT_SIDEBAR)
  const dragging = useRef(false)
  const preDockSidebarOnly = useRef(false)

  useEffect(() => { loadSnippets(); loadSettings() }, [loadSnippets, loadSettings])
  useMenuEvents()

  const toggle = useCallback(() => {
    const next = !sidebarOnly
    setSidebarOnly(next)
    windowService.resize(next ? LAYOUT.SIDEBAR_WIDTH : LAYOUT.FULL_WIDTH, LAYOUT.HEIGHT, next)
  }, [sidebarOnly])

  const toggleDock = useCallback(() => {
    if (docked) {
      setDocked(false)
      setDockExpanded(false)
      setSidebarOnly(preDockSidebarOnly.current)
      windowService.undock()
    } else {
      preDockSidebarOnly.current = sidebarOnly
      setDocked(true)
      setDockExpanded(false)
      setSidebarOnly(true)
      windowService.dock()
    }
  }, [docked, sidebarOnly])

  const handleClose = useCallback(() => { window.close() }, [])

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    const startX = e.clientX
    const startW = sidebarWidth
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      setSidebarWidth(Math.min(LAYOUT.MAX_SIDEBAR, Math.max(LAYOUT.MIN_SIDEBAR, startW + (ev.clientX - startX))))
    }
    const onUp = () => { dragging.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [sidebarWidth])

  return (
    <div className={`app ${sidebarOnly ? 'sidebar-only' : ''} ${docked ? 'app--docked' : ''}`} data-theme={theme}>
      <Sidebar
        sidebarOnly={sidebarOnly} docked={docked} dockExpanded={dockExpanded}
        onDockExpand={setDockExpanded} onToggle={toggle} onDock={toggleDock}
        onClose={handleClose} width={sidebarWidth}
      />
      {!sidebarOnly && (
        <>
          <div className="resize-handle" onMouseDown={onResizeStart} />
          <Editor theme={theme} />
        </>
      )}
    </div>
  )
}
