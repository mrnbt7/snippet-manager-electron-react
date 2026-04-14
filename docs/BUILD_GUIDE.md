# Build Guide — Snippet Manager

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **Git**

## 1. Clone & Install

```bash
git clone <repository-url>
cd snippet-manager-electron-react
npm install
```

## 2. Development

### Browser-only mode (fast iteration, no Electron)

```bash
npm run dev
```

Opens at `http://localhost:5173`. Snippets persist in localStorage. Window resize and menu features are no-ops.

### Electron mode (full desktop app)

```bash
npm run electron:dev
```

Launches Vite dev server + Electron concurrently. Snippets persist to disk via electron-store. Full menu, window resize, and drag-drop to external editors.

## 3. Linting

```bash
npm run lint
```

Uses ESLint with TypeScript and React hooks plugins.

## 4. Production Build

### Web build only

```bash
npm run build
```

Outputs to `dist/`. Runs TypeScript type-check then Vite build.

### Electron distributable

```bash
npm run electron:build
```

Runs Vite build then electron-builder. Outputs platform-specific installers to `dist/`.

## 5. Project Structure

```
snippet-manager-electron-react/
├── electron/                  # Electron main process
│   ├── main.cjs               # App lifecycle (orchestrator)
│   ├── store.cjs              # Data persistence (electron-store)
│   ├── menu.cjs               # Application menu
│   ├── ipc.cjs                # IPC handler registration
│   └── preload.cjs            # Context bridge (renderer ↔ main)
├── src/                       # Renderer (React app)
│   ├── components/            # UI components
│   │   ├── AddSnippetForm.tsx  # New snippet form
│   │   ├── CodeTooltip.tsx     # Hover preview tooltip
│   │   ├── Editor.tsx          # CodeMirror editor panel
│   │   ├── LanguageSelect.tsx  # Shared language dropdown
│   │   └── Sidebar.tsx         # Snippet list + search
│   ├── data/                  # Static data
│   │   ├── defaults.json       # Default snippets (single source of truth)
│   │   └── defaults.ts         # Factory function
│   ├── hooks/                 # Custom React hooks
│   │   └── useMenuEvents.ts    # Menu event subscriptions
│   ├── services/              # Business logic
│   │   ├── bridge.ts           # Electron/browser adapter
│   │   ├── highlighter.ts      # Tooltip text preview
│   │   └── migration.ts        # Language name migration
│   ├── store/                 # Zustand state management
│   │   ├── settingsStore.ts    # Theme + storage path
│   │   └── snippetStore.ts     # Snippet CRUD
│   ├── types/                 # TypeScript interfaces
│   │   └── snippet.ts
│   ├── App.tsx                # Root component
│   ├── App.css                # Styles (CSS variables for theming)
│   ├── index.css              # Global reset
│   ├── languages.ts           # Language registry (10 languages)
│   └── main.tsx               # React entry point
├── docs/                      # Documentation
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## 6. Adding a New Language

1. Install the CodeMirror language package:
   ```bash
   npm install @codemirror/lang-<name>
   ```

2. Add to `src/languages.ts`:
   ```typescript
   import { newlang } from '@codemirror/lang-newlang'
   // In LANGUAGES:
   NewLang: cached(newlang),
   ```

3. That's it — the language automatically appears in all dropdowns and the editor.

## 7. Changing Default Snippets

Edit `src/data/defaults.json`. This single file is consumed by both the Electron main process and the renderer. Defaults are only seeded when the store is empty (first launch).

## 8. Configuration

### Storage Location
Settings → Change Storage Location (or via menu). Snippets JSON file moves to the selected directory.

### Theme
Settings → Toggle Theme (Ctrl+T). Persisted across restarts.

### Data Files
- **Windows**: `%APPDATA%/snippet-manager-electron-react/`
- **macOS**: `~/Library/Application Support/snippet-manager-electron-react/`
- **Linux**: `~/.config/snippet-manager-electron-react/`

Files: `snippets.json`, `settings.json`
