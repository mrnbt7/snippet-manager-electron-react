# Architecture & Design Patterns — Snippet Manager

## Design Principles Applied

### SOLID

#### Single Responsibility (SRP)
Every module has one reason to change:

| Module | Responsibility |
|--------|---------------|
| `snippetStore.ts` | Snippet state only |
| `settingsStore.ts` | Settings state only |
| `bridge.ts` | Environment adaptation only |
| `migration.ts` | Data migration only |
| `highlighter.ts` | Text preview only |
| `useMenuEvents.ts` | Menu event wiring only |
| `electron/store.cjs` | Persistence only |
| `electron/menu.cjs` | Menu definition only |
| `electron/ipc.cjs` | IPC registration only |
| `electron/main.cjs` | App lifecycle only |

#### Open/Closed (OCP)
- Adding a new language requires adding one line to `languages.ts` — no existing code changes
- Adding a new IPC channel requires adding a handler in `ipc.cjs` and a method in `bridge.ts` — existing handlers untouched

#### Interface Segregation (ISP)
Instead of one monolithic API:
```typescript
// ❌ Before: one fat interface
interface SnippetAPI {
  getAll, save, remove, resizeWindow, getSettings, saveSettings, chooseFolder, getStoragePath
}

// ✅ After: focused interfaces
interface SnippetRepository { getAll, save, remove }
interface SettingsRepository { get, save, chooseFolder, getStoragePath }
interface WindowService { resize }
interface MenuService { on }
```

#### Dependency Inversion (DIP)
- Components depend on abstract interfaces (`SnippetRepository`), not concrete implementations
- `bridge.ts` provides the concrete implementation at runtime
- Stores import from `services/bridge.ts`, never from `window` directly

### DRY (Don't Repeat Yourself)

| What | Before | After |
|------|--------|-------|
| Default snippets | Duplicated in `snippetStore.ts` + `electron/main.cjs` | Single `data/defaults.json` |
| Language dropdown | Inline `<select>` in Sidebar + Editor | Shared `LanguageSelect` component |
| Language factories | Repeated `extension`/`parser` pattern per language | `cached()` helper |

## Design Patterns

### Adapter Pattern — `services/bridge.ts`
Adapts two different backends (Electron IPC, localStorage) behind the same repository interfaces. The consumer doesn't know which backend is active.

```
bridge.ts
  ├── Electron detected? → Map raw IPC to SnippetRepository interface
  └── Browser mode?      → Map localStorage to SnippetRepository interface
```

### Repository Pattern — `SnippetRepository`, `SettingsRepository`
Data access is abstracted behind clean interfaces. The store layer never knows about IPC channels, localStorage keys, or electron-store internals.

### Strategy Pattern — Environment Detection
At module load, `bridge.ts` checks `window.snippetAPI` and selects the appropriate strategy:
- **Electron strategy**: IPC-based persistence
- **Browser strategy**: localStorage-based persistence

### Facade Pattern — `electron/main.cjs`
The main process entry point is a thin orchestrator that delegates to focused modules:
```
main.cjs
  ├── store.cjs   → seedDefaults(), getSnippetStore()
  ├── menu.cjs    → buildAppMenu()
  └── ipc.cjs     → registerIpcHandlers()
```

### Factory Pattern — `languages.ts`
The `cached()` helper is a factory that lazily creates and caches `LanguageSupport` instances:
```typescript
function cached(factory: () => LanguageSupport): LangDef {
  let instance: LanguageSupport | null = null
  const get = () => { if (!instance) instance = factory(); return instance }
  return { extension: () => get(), parser: () => get().language.parser }
}
```

### Observer Pattern — Menu Events
Electron menu clicks send events via `webContents.send()`. The renderer subscribes via `useMenuEvents` hook, which registers listeners through the `MenuService` interface.

## State Management

```
┌─────────────┐     ┌──────────────┐
│ snippetStore │     │ settingsStore │
│              │     │               │
│ snippets[]   │     │ theme         │
│ selectedId   │     │ storagePath   │
│ search       │     │               │
│              │     │ toggleTheme() │
│ load()       │     │ load()        │
│ add()        │     └──────────────┘
│ update()     │
│ remove()     │
│ select()     │
│ setSearch()  │
└─────────────┘
```

Both stores are independent Zustand stores. Components subscribe to individual slices via granular selectors to minimize re-renders.

## Performance Optimizations

1. **Cached language instances** — `LanguageSupport` created once per language, reused across renders
2. **Granular Zustand selectors** — Components subscribe to specific slices, not the whole store
3. **`key` prop on CodeMirror** — Clean mount/unmount when switching snippets instead of expensive reconfiguration
4. **`useMemo` for extensions** — CodeMirror extensions only recreated when language changes
5. **`useCallback` for handlers** — Stable function references prevent child re-renders
6. **Truncated tooltip preview** — Only first 500 chars parsed for tooltip
