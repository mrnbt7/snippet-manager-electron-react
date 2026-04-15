import type { Extension } from '@codemirror/state'
import type { LanguageSupport } from '@codemirror/language'
import type { Parser } from '@lezer/common'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { sql } from '@codemirror/lang-sql'
import { go } from '@codemirror/lang-go'
import { rust } from '@codemirror/lang-rust'
import { php } from '@codemirror/lang-php'
import { StreamLanguage } from '@codemirror/language'
import { csharp } from '@codemirror/legacy-modes/mode/clike'

export interface LangDef {
  extension: () => Extension
  parser: () => Parser
}

function cached(factory: () => LanguageSupport): LangDef {
  let instance: LanguageSupport | null = null
  const get = () => { if (!instance) instance = factory(); return instance }
  return {
    extension: () => get(),
    parser: () => get().language.parser,
  }
}

const csInstance = StreamLanguage.define(csharp)

export const LANGUAGES: Record<string, LangDef> = {
  'C#':         { extension: () => csInstance, parser: () => (csInstance as unknown as LanguageSupport).language.parser },
  TypeScript:   cached(() => javascript({ typescript: true })),
  JavaScript:   cached(javascript),
  Java:         cached(java),
  Python:       cached(python),
  'C++':        cached(cpp),
  SQL:          cached(sql),
  Go:           cached(go),
  Rust:         cached(rust),
  PHP:          cached(php),
}

export const LANGUAGE_NAMES = Object.keys(LANGUAGES)
