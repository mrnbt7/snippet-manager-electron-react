# High-Level Design (HLD) — Snippet Manager

## 1. Overview

Snippet Manager is a cross-platform desktop application for developers to store, organize, search, and drag-drop code snippets into external editors. Built with Electron, React, TypeScript, and CodeMirror.

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Electron Shell                     │
│  ┌──────────────┐    IPC     ┌────────────────────┐ │
│  │  Main Process │◄────────►│  Renderer Process    │ │
│  │              │           │                      │ │
│  │  main.cjs    │           │  React App (Vite)    │ │
│  │  store.cjs   │           │  ┌────────────────┐  │ │
│  │  menu.cjs    │           │  │  Components    │  │ │
│  │  ipc.cjs     │           │  │  Stores        │  │ │
│  │              │           │  │  Services      │  │ │
│  └──────┬───────┘           │  │  Hooks         │  │ │
│         │                   │  └────────────────┘  │ │
│         ▼                   └──────────────────────┘ │
│  ┌──────────────┐                                    │
│  │ electron-store│ (JSON on disk)                    │
│  └──────────────┘                                    │
└─────────────────────────────────────────────────────┘
```

## 3. Component Architecture

```
App
├── Sidebar
│   ├── AddSnippetForm
│   │   └── LanguageSelect
│   ├── SnippetList (inline)
│   └── CodeTooltip
└── Editor
    ├── LanguageSelect
    └── CodeMirror
```

## 4. Data Flow

```
User Action → Component → Zustand Store → Bridge Service → IPC → Electron Main → electron-store (disk)
                                              │
                                              └─► localStorage (browser fallback)
```

## 5. Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|---------------|
| Types | `src/types/` | Interfaces and contracts (Snippet, Settings, Repository, Service) |
| Data | `src/data/` | Static default snippets (single source of truth) |
| Services | `src/services/` | Bridge (Adapter pattern), Migration, Highlighter |
| Store | `src/store/` | State management — snippetStore, settingsStore |
| Hooks | `src/hooks/` | React hooks — useMenuEvents |
| Components | `src/components/` | UI — Sidebar, Editor, AddSnippetForm, CodeTooltip, LanguageSelect |
| Electron | `electron/` | Main process — main, store, menu, ipc, preload |

## 6. Key Design Decisions

### 6.1 Adapter Pattern (Bridge Service)
The renderer never accesses `window.snippetAPI` directly. `services/bridge.ts` detects the environment and provides either Electron IPC or localStorage implementations behind the same interface. This enables:
- Browser-mode development without Electron
- Testability (mock the repository interface)
- Swappable backends

### 6.2 Interface Segregation
Instead of one monolithic API, we have focused interfaces:
- `SnippetRepository` — CRUD for snippets
- `SettingsRepository` — Theme and storage path
- `WindowService` — Window resize
- `MenuService` — Menu event subscriptions

### 6.3 Cached Language Instances
CodeMirror language extensions are expensive to create. `languages.ts` uses a `cached()` helper that lazily creates and reuses `LanguageSupport` instances.

### 6.4 Sidebar-Only Mode
The app supports collapsing to a narrow sidebar-only window. The Electron main process resizes the `BrowserWindow` and hides the menu bar via IPC.

### 6.5 Drag & Drop
Snippet list items use the HTML Drag and Drop API with `text/plain` data transfer, enabling drag-drop into VS Code, Visual Studio, Notepad++, and any text editor.

## 7. Technology Stack

| Concern | Technology |
|---------|-----------|
| Desktop Shell | Electron 41 |
| UI Framework | React 19 |
| Language | TypeScript 6 |
| Bundler | Vite 8 |
| State Management | Zustand 5 |
| Code Editor | CodeMirror 6 (via @uiw/react-codemirror) |
| Persistence | electron-store (Electron), localStorage (browser) |
| IDs | uuid |

## 8. Supported Languages

C#, TypeScript, JavaScript, Java, Python, C++, SQL, Go, Rust, PHP

## 9. Data Model

```typescript
interface Snippet {
  id: string        // UUID
  title: string
  language: string  // Must match a key in LANGUAGES
  code: string
  createdAt: number // Unix timestamp
  updatedAt: number
}

interface Settings {
  theme: 'dark' | 'light'
  storagePath: string  // Custom storage directory (empty = default)
}
```

## 10. Security

- `contextIsolation: true` — Renderer cannot access Node.js APIs directly
- `nodeIntegration: false` — No Node.js in renderer
- Preload script exposes only specific IPC channels via `contextBridge`
- No remote code execution, no eval, no dynamic requires
