const MAX_PREVIEW_CHARS = 500

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function highlightSnippet(code: string): string {
  const preview = code.length > MAX_PREVIEW_CHARS ? code.slice(0, MAX_PREVIEW_CHARS) + '…' : code
  return escapeHtml(preview || '(empty)')
}
