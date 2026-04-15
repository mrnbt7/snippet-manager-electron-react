import { useState, useRef, type DragEvent } from 'react'
import { useSnippetStore } from '../store/snippetStore'
import { windowService } from '../services/bridge'
import { LAYOUT } from '../constants'
import { Icon, FolderIcon, CodeIcon, SearchIcon, ICON_PATHS } from './icons'
import AddSnippetForm from './AddSnippetForm'
import CodeTooltip from './CodeTooltip'

interface Props {
  sidebarOnly: boolean
  docked: boolean
  dockExpanded: boolean
  onDockExpand: (expanded: boolean) => void
  onToggle: () => void
  onDock: () => void
  onClose: () => void
  width: number
}

export default function Sidebar({ sidebarOnly, docked, dockExpanded, onDockExpand, onToggle, onDock, onClose, width }: Props) {
  const snippets = useSnippetStore((s) => s.snippets)
  const folders = useSnippetStore((s) => s.folders)
  const selectedId = useSnippetStore((s) => s.selectedId)
  const search = useSnippetStore((s) => s.search)
  const select = useSnippetStore((s) => s.select)
  const setSearch = useSnippetStore((s) => s.setSearch)
  const add = useSnippetStore((s) => s.add)
  const remove = useSnippetStore((s) => s.remove)
  const reorder = useSnippetStore((s) => s.reorder)
  const addFolder = useSnippetStore((s) => s.addFolder)
  const renameFolder = useSnippetStore((s) => s.renameFolder)
  const removeFolder = useSnippetStore((s) => s.removeFolder)
  const update = useSnippetStore((s) => s.update)

  const [adding, setAdding] = useState(false)
  const [addingFolder, setAddingFolder] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set())
  const [tooltipData, setTooltipData] = useState<{ id: string; x: number; y: number } | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragSrcId = useRef<string | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  // ─── Docked collapsed ───
  if (docked && !dockExpanded) {
    return (
      <aside className="sidebar sidebar--dock-collapsed" ref={sidebarRef}>
        <button className="dock-strip-btn" onClick={onDock} title="Undock"><Icon d={ICON_PATHS.dock} size={18} /></button>
        <button className="dock-strip-btn" onClick={() => { onDockExpand(true); windowService.dockResize(LAYOUT.DOCK_EXPANDED) }} title="Expand"><Icon d={ICON_PATHS.expand} size={18} /></button>
        <button className="dock-strip-btn dock-strip-close" onClick={onClose} title="Close"><Icon d={ICON_PATHS.close} size={18} /></button>
      </aside>
    )
  }

  // ─── Shared logic ───
  const lowerSearch = search.toLowerCase()
  const filtered = snippets.filter(
    (s) => s.title.toLowerCase().includes(lowerSearch) || s.language.toLowerCase().includes(lowerSearch),
  )
  const tooltipSnippet = tooltipData ? snippets.find((s) => s.id === tooltipData.id) : null

  const handleMouseEnter = (e: React.MouseEvent, id: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    if (sidebarOnly || docked) {
      setTooltipData({ id, x: rect.left - 310, y: rect.top })
    } else {
      const sidebarRect = sidebarRef.current?.getBoundingClientRect()
      setTooltipData({ id, x: sidebarRect ? sidebarRect.right + 8 : rect.right + 8, y: rect.top })
    }
  }

  const handleReorderDragStart = (e: DragEvent, id: string) => {
    dragSrcId.current = id
    e.dataTransfer.effectAllowed = 'copyMove'
    e.dataTransfer.setData('application/x-snippet-reorder', id)
    const snippet = snippets.find((s) => s.id === id)
    if (snippet) e.dataTransfer.setData('text/plain', snippet.code)
  }
  const handleReorderDragOver = (e: DragEvent, id: string) => {
    if (!e.dataTransfer.types.includes('application/x-snippet-reorder')) return
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverId(id)
  }
  const handleReorderDrop = (e: DragEvent, toId: string) => {
    e.preventDefault(); setDragOverId(null)
    if (dragSrcId.current && dragSrcId.current !== toId) reorder(dragSrcId.current, toId)
    dragSrcId.current = null
  }
  const handleDragLeave = () => setDragOverId(null)
  const handleDragEnd = () => { dragSrcId.current = null; setDragOverId(null) }
  const handleFolderDrop = (e: DragEvent, folderId: string) => {
    e.preventDefault(); setDragOverId(null)
    if (dragSrcId.current) { update(dragSrcId.current, { folderId }); dragSrcId.current = null }
  }

  const toggleFolder = (id: string) => {
    setCollapsedFolders((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const handleAdd = (title: string, language: string, folderId: string | null) => { add(title, language, folderId); setAdding(false) }
  const handleAddFolder = () => { if (folderName.trim()) addFolder(folderName.trim()); setFolderName(''); setAddingFolder(false) }
  const handleFinishRename = () => { if (editingFolderId && editingName.trim()) renameFolder(editingFolderId, editingName.trim()); setEditingFolderId(null); setEditingName('') }

  const renderSnippetItem = (s: typeof snippets[0]) => (
    <li key={s.id}
      className={`snippet-item ${s.id === selectedId ? 'active' : ''} ${dragOverId === s.id ? 'drag-over' : ''}`}
      onClick={() => select(s.id)} draggable
      onDragStart={(e) => handleReorderDragStart(e, s.id)}
      onDragOver={(e) => handleReorderDragOver(e, s.id)}
      onDrop={(e) => handleReorderDrop(e, s.id)}
      onDragLeave={handleDragLeave} onDragEnd={handleDragEnd}
      onMouseEnter={(e) => handleMouseEnter(e, s.id)}
      onMouseLeave={() => setTooltipData(null)}
    >
      <span className="snippet-icon"><CodeIcon /></span>
      <span className="snippet-title">{s.title}</span>
      <span className="snippet-lang">{s.language}</span>
      <button className="item-btn item-btn--danger" onClick={(e) => { e.stopPropagation(); remove(s.id) }} title="Delete">
        <Icon d={ICON_PATHS.close} size={12} />
      </button>
    </li>
  )

  const unfolderedSnippets = filtered.filter((s) => !s.folderId)
  const sortedFolders = [...folders].sort((a, b) => a.order - b.order)

  const renderFolders = () => sortedFolders.map((folder) => {
    const folderSnippets = filtered.filter((s) => s.folderId === folder.id)
    const isCollapsed = collapsedFolders.has(folder.id)
    return (
      <li key={folder.id} className="folder-group">
        <div className={`folder-header ${dragOverId === `folder-${folder.id}` ? 'drag-over' : ''}`}
          onClick={() => toggleFolder(folder.id)}
          onDragOver={(e) => { e.preventDefault(); setDragOverId(`folder-${folder.id}`) }}
          onDragLeave={handleDragLeave} onDrop={(e) => handleFolderDrop(e, folder.id)}
        >
          <span className="folder-icon"><FolderIcon open={!isCollapsed} /></span>
          {editingFolderId === folder.id ? (
            <input className="folder-rename" value={editingName} onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleFinishRename} onKeyDown={(e) => e.key === 'Enter' && handleFinishRename()}
              autoFocus onClick={(e) => e.stopPropagation()} />
          ) : (
            <span className="folder-name">{folder.name}</span>
          )}
          <span className="folder-count">{folderSnippets.length}</span>
          <button className="item-btn" onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); setEditingName(folder.name) }} title="Rename">
            <Icon d={ICON_PATHS.edit} size={12} />
          </button>
          <button className="item-btn item-btn--danger" onClick={(e) => { e.stopPropagation(); removeFolder(folder.id) }} title="Delete">
            <Icon d={ICON_PATHS.trash} size={12} />
          </button>
        </div>
        {!isCollapsed && <ul className="folder-snippets">{folderSnippets.map(renderSnippetItem)}</ul>}
      </li>
    )
  })

  const renderSearch = () => (
    <div className="sidebar-header">
      <div className="search-box">
        <SearchIcon />
        <input placeholder="Search snippets..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
    </div>
  )

  const renderActions = (isDockExpanded: boolean) => (
    <div className="sidebar-actions">
      <button onClick={() => { setAdding(!adding); setAddingFolder(false) }} title="New snippet">
        <Icon d={ICON_PATHS.plus} /> {!isDockExpanded && <span>Snippet</span>}
      </button>
      <button onClick={() => { setAddingFolder(!addingFolder); setAdding(false) }} title="New folder">
        <FolderIcon /> {!isDockExpanded && <span>Folder</span>}
      </button>
      {isDockExpanded ? (
        <>
          <button onClick={() => { onDockExpand(false); windowService.dockResize(LAYOUT.DOCK_COLLAPSED) }} title="Collapse"><Icon d={ICON_PATHS.collapse} /></button>
          <button onClick={onDock} title="Undock"><Icon d={ICON_PATHS.dock} /></button>
        </>
      ) : (
        <>
          <button onClick={onToggle} title={sidebarOnly ? 'Expand' : 'Collapse'}>
            <Icon d={sidebarOnly ? ICON_PATHS.expand : ICON_PATHS.collapse} />
            <span>{sidebarOnly ? 'Expand' : 'Collapse'}</span>
          </button>
          <button onClick={onDock} title="Dock"><Icon d={ICON_PATHS.dock} /> <span>Dock</span></button>
        </>
      )}
    </div>
  )

  const renderForms = () => (
    <>
      {adding && <AddSnippetForm folders={folders} onAdd={handleAdd} onCancel={() => setAdding(false)} />}
      {addingFolder && (
        <div className="add-form">
          <input placeholder="Folder name..." value={folderName} onChange={(e) => setFolderName(e.target.value)} autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()} />
          <div className="add-form-actions">
            <button className="add-confirm" onClick={handleAddFolder}>Add</button>
            <button className="add-cancel" onClick={() => setAddingFolder(false)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  )

  const renderList = () => (
    <ul className="snippet-list">{renderFolders()}{unfolderedSnippets.map(renderSnippetItem)}</ul>
  )

  const renderTooltip = () => tooltipSnippet && tooltipData
    ? <CodeTooltip code={tooltipSnippet.code} x={tooltipData.x} y={tooltipData.y} /> : null

  const className = docked && dockExpanded ? 'sidebar sidebar--dock-expanded'
    : sidebarOnly ? 'sidebar sidebar--full'
    : 'sidebar'

  const style = (!sidebarOnly && !docked) ? { width, minWidth: width } : undefined

  return (
    <aside className={className} ref={sidebarRef} style={style}>
      {renderSearch()}
      {renderActions(docked && dockExpanded)}
      {renderForms()}
      {renderList()}
      {renderTooltip()}
    </aside>
  )
}
