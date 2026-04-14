import { useMemo } from 'react'
import { highlightSnippet } from '../services/highlighter'

interface Props {
  code: string
  x: number
  y: number
}

export default function CodeTooltip({ code, x, y }: Props) {
  const html = useMemo(() => highlightSnippet(code), [code])
  return (
    <div className="code-tooltip" style={{ top: y, left: x }}>
      <pre dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
