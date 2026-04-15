# Architecture & Design Patterns — Snippet Manager

## Design Principles

### SOLID

#### Single Responsibility (SRP)

```mermaid
graph TD
    subgraph "Each module = one job"
        A[snippetStore] -->|State only| A1[Snippet CRUD + reorder]
        B[settingsStore] -->|State only| B1[Theme + storage path]
        C[bridge.ts] -->|Adaptation only| C1[Electron vs localStorage]
        D[migration.ts] -->|Migration only| D1[Language name fixes]
        E[highlighter.ts] -->|Preview only| E1[Tooltip text]
        F[icons/] -->|Icons only| F1[SVG components]
        G[constants.ts] -->|Config only| G1[Layout dimensions]
    end
```

#### Interface Segregation (ISP)

```mermaid
graph LR
    subgraph "Focused interfaces"
        SR[SnippetRepository<br/>getAll, save, saveAll, remove]
        FR[FolderRepository<br/>getAll, saveAll]
        STR[SettingsRepository<br/>get, save, chooseFolder, getStoragePath]
        WS[WindowService<br/>resize, dock, undock, dockResize]
        MS[MenuService<br/>on]
    end
```

#### Dependency Inversion (DIP)

```mermaid
graph TB
    C[Components] -->|depend on| I[Interfaces]
    S[Stores] -->|depend on| I
    I -->|implemented by| B[bridge.ts]
    B -->|selects| E[Electron IPC]
    B -->|selects| L[localStorage]
```

### DRY

| What | Solution |
|------|----------|
| Default snippets | Single `data/defaults.json` consumed by both Electron and renderer |
| Language dropdown | Shared `LanguageSelect` component |
| Language factories | `cached()` helper in languages.ts |
| SVG icons | Shared `icons/index.tsx` with `ICON_PATHS` constants |
| Layout dimensions | Shared `constants.ts` |
| localStorage helpers | `localJsonStore()` factory in bridge.ts |

## Design Patterns

### Adapter Pattern — bridge.ts

```mermaid
graph LR
    A[React App] --> B[bridge.ts]
    B --> C{window.snippetAPI?}
    C -->|Yes| D[Electron IPC]
    C -->|No| E[localStorage]
    D --> F[electron-store on disk]
    E --> G[Browser localStorage]
```

### Repository Pattern

```mermaid
classDiagram
    class SnippetRepository {
        +getAll() Promise~Snippet[]~
        +save(snippet) Promise~void~
        +saveAll(snippets) Promise~void~
        +remove(id) Promise~void~
    }
    class FolderRepository {
        +getAll() Promise~Folder[]~
        +saveAll(folders) Promise~void~
    }
    class SettingsRepository {
        +get() Promise~Settings~
        +save(settings) Promise~void~
        +chooseFolder() Promise~string?~
        +getStoragePath() Promise~string~
    }
```

### Facade Pattern — Electron Main Process

```mermaid
graph TD
    M[main.cjs<br/>Orchestrator] --> S[store.cjs<br/>Persistence]
    M --> MN[menu.cjs<br/>Menu definition]
    M --> I[ipc.cjs<br/>IPC handlers]
    M --> P[preload.cjs<br/>Context bridge]
```

### Factory Pattern — languages.ts

```mermaid
graph LR
    A[cached factory] --> B{Instance exists?}
    B -->|No| C[Create LanguageSupport]
    C --> D[Cache it]
    B -->|Yes| E[Return cached]
    D --> E
```

## State Management

```mermaid
graph TD
    subgraph snippetStore
        S1[snippets: Snippet[]]
        S2[folders: Folder[]]
        S3[selectedId: string?]
        S4[search: string]
    end
    subgraph settingsStore
        T1[theme: dark/light]
        T2[storagePath: string]
    end
    subgraph "Granular Selectors"
        C1[Sidebar] -->|s.snippets| S1
        C1 -->|s.folders| S2
        C1 -->|s.selectedId| S3
        C1 -->|s.search| S4
        C2[Editor] -->|s.selectedId| S3
        C2 -->|s.snippets.find| S1
        C3[App] -->|s.theme| T1
    end
```

## Performance Optimizations

| Optimization | Technique |
|-------------|-----------|
| Cached language instances | `cached()` creates LanguageSupport once per language |
| Granular Zustand selectors | Components subscribe to individual slices |
| `key` prop on CodeMirror | Clean mount/unmount when switching snippets |
| `useMemo` for extensions | Only recreated when language changes |
| `useCallback` for handlers | Stable references prevent child re-renders |
| Truncated tooltip preview | Only first 500 chars rendered |

## Project Structure

```
src/
├── components/
│   ├── icons/
│   │   └── index.tsx          ← Shared SVG icon components
│   ├── AddSnippetForm.tsx     ← New snippet form
│   ├── CodeTooltip.tsx        ← Hover preview
│   ├── Editor.tsx             ← CodeMirror editor
│   ├── LanguageSelect.tsx     ← Language dropdown
│   └── Sidebar.tsx            ← Snippet list, folders, dock modes
├── data/
│   ├── defaults.json          ← Default snippets (single source of truth)
│   └── defaults.ts            ← Factory function
├── hooks/
│   └── useMenuEvents.ts       ← Menu event subscriptions
├── services/
│   ├── bridge.ts              ← Adapter: Electron/browser
│   ├── highlighter.ts         ← Tooltip text preview
│   └── migration.ts           ← Data migration
├── store/
│   ├── settingsStore.ts       ← Theme + storage path
│   └── snippetStore.ts        ← Snippet + folder CRUD
├── types/
│   └── snippet.ts             ← All interfaces
├── constants.ts               ← Layout dimensions
├── languages.ts               ← Language registry (10 languages)
├── App.tsx                    ← Root component
├── App.css                    ← Styles (CSS variables)
├── index.css                  ← Global reset
└── main.tsx                   ← Entry point

electron/
├── main.cjs                   ← App lifecycle
├── store.cjs                  ← Persistence
├── menu.cjs                   ← Menu definition
├── ipc.cjs                    ← IPC handlers
└── preload.cjs                ← Context bridge
```
