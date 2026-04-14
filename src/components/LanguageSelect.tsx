import { LANGUAGE_NAMES } from '../languages'

interface Props {
  value: string
  onChange: (lang: string) => void
}

export default function LanguageSelect({ value, onChange }: Props) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {LANGUAGE_NAMES.map((l) => <option key={l}>{l}</option>)}
    </select>
  )
}
