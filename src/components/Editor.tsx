import { useMemo, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { useSnippetStore } from '../store/snippetStore'
import { LANGUAGES } from '../languages'
import LanguageSelect from './LanguageSelect'
import type { Theme } from '../types/snippet'

export default function Editor({ theme }: { theme: Theme }) {
  const selectedId = useSnippetStore((s) => s.selectedId)
  const snippet = useSnippetStore((s) => s.snippets.find((x) => x.id === s.selectedId))
  const update = useSnippetStore((s) => s.update)

  const extensions = useMemo(() => {
    if (!snippet) return []
    const lang = LANGUAGES[snippet.language]
    return lang ? [lang.extension()] : []
  }, [snippet?.language])

  const onCodeChange = useCallback((val: string) => {
    if (selectedId) update(selectedId, { code: val })
  }, [selectedId, update])

  if (!snippet) return <div className="editor-empty">Select or create a snippet</div>

  return (
    <div className="editor">
      <div className="editor-header">
        <input
          className="title-input"
          value={snippet.title}
          onChange={(e) => update(snippet.id, { title: e.target.value })}
        />
        <LanguageSelect value={snippet.language} onChange={(l) => update(snippet.id, { language: l })} />
      </div>
      <CodeMirror
        key={snippet.id}
        value={snippet.code}
        height="100%"
        theme={theme}
        extensions={extensions}
        onChange={onCodeChange}
      />
    </div>
  )
}
