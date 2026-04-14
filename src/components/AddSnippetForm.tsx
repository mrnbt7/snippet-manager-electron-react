import { useState } from 'react'
import LanguageSelect from './LanguageSelect'

interface Props {
  onAdd: (title: string, language: string) => void
  onCancel: () => void
}

export default function AddSnippetForm({ onAdd, onCancel }: Props) {
  const [title, setTitle] = useState('')
  const [lang, setLang] = useState('JavaScript')

  const handleSubmit = () => {
    onAdd(title.trim() || 'Untitled', lang)
    setTitle('')
    setLang('JavaScript')
  }

  return (
    <div className="add-form">
      <input placeholder="Snippet title…" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <LanguageSelect value={lang} onChange={setLang} />
      <div className="add-form-actions">
        <button className="add-confirm" onClick={handleSubmit}>Add</button>
        <button className="add-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
