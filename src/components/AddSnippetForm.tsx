import { useState } from 'react'
import LanguageSelect from './LanguageSelect'
import type { Folder } from '../types/snippet'

interface Props {
  folders: Folder[]
  onAdd: (title: string, language: string, folderId: string | null) => void
  onCancel: () => void
}

export default function AddSnippetForm({ folders, onAdd, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [lang, setLang] = useState('JavaScript')
  const [folderId, setFolderId] = useState<string | null>(null)

  const handleSubmit = () => {
    onAdd(title.trim() || 'Untitled', lang, folderId)
    setTitle('')
    setLang('JavaScript')
    setFolderId(null)
  }

  return (
    <div className="add-form">
      <input placeholder="Snippet title…" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <LanguageSelect value={lang} onChange={setLang} />
      {folders.length > 0 && (
        <select value={folderId ?? ''} onChange={(e) => setFolderId(e.target.value || null)}>
          <option value="">No folder</option>
          {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      )}
      <div className="add-form-actions">
        <button className="add-confirm" onClick={handleSubmit}>Add</button>
        <button className="add-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
