import { useState, useRef, type DragEvent } from 'react'
import { useSnippetStore } from '../store/snippetStore'
import AddSnippetForm from './AddSnippetForm'
import CodeTooltip from './CodeTooltip'

interface Props {
  sidebarOnly: boolean
  onToggle: () => void
}

export default function Sidebar({ sidebarOnly, onToggle }: Props) {
  const snippets = useSnippetStore((s) => s.snippets)
  const selectedId = useSnippetStore((s) => s.selectedId)
  const search = useSnippetStore((s) => s.search)
  const select = useSnippetStore((s) => s.select)
  const setSearch = useSnippetStore((s) => s.setSearch)
  const add = useSnippetStore((s) => s.add)
  const remove = useSnippetStore((s) => s.remove)
  const [adding, setAdding] = useState(false)
  const [tooltipData, setTooltipData] = useState<{ id: string; x: number; y: number } | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)

  const filtered = snippets.filter(
    (s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.language.toLowerCase().includes(search.toLowerCase()),
  )

  const tooltipSnippet = tooltipData ? snippets.find((s) => s.id === tooltipData.id) : null

  const handleAdd = (title: string, language: string) => {
    add(title, language)
    setAdding(false)
  }

  const handleDragStart = (e: DragEvent, code: string) => {
    e.dataTransfer.setData('text/plain', code)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleMouseEnter = (e: React.MouseEvent, id: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    if (sidebarOnly) {
      setTooltipData({ id, x: rect.left, y: rect.bottom + 4 })
    } else {
      const sidebarRect = sidebarRef.current?.getBoundingClientRect()
      setTooltipData({ id, x: sidebarRect ? sidebarRect.right + 8 : rect.right + 8, y: rect.top })
    }
  }

  return (
    <aside className={`sidebar ${sidebarOnly ? 'sidebar--full' : ''}`} ref={sidebarRef}>
      <div className="sidebar-header">
        <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={() => setAdding(!adding)}>+</button>
        <button onClick={onToggle} title={sidebarOnly ? 'Expand editor' : 'Sidebar only'}>
          {sidebarOnly ? '⇥' : '⇤'}
        </button>
      </div>
      {adding && <AddSnippetForm onAdd={handleAdd} onCancel={() => setAdding(false)} />}
      <ul className="snippet-list">
        {filtered.map((s) => (
          <li
            key={s.id}
            className={s.id === selectedId ? 'active' : ''}
            onClick={() => select(s.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, s.code)}
            onMouseEnter={(e) => handleMouseEnter(e, s.id)}
            onMouseLeave={() => setTooltipData(null)}
          >
            <span className="snippet-title">{s.title}</span>
            <span className="snippet-lang">{s.language}</span>
            <button className="delete-btn" onClick={(e) => { e.stopPropagation(); remove(s.id) }}>×</button>
          </li>
        ))}
      </ul>
      {tooltipSnippet && tooltipData && (
        <CodeTooltip code={tooltipSnippet.code} x={tooltipData.x} y={tooltipData.y} />
      )}
    </aside>
  )
}
