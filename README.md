# ✂️ Snippet Manager

A lightweight, cross-platform desktop app for developers to store, organize, and instantly drag-drop code snippets into any editor.

Built with **Electron** + **React** + **TypeScript** + **CodeMirror**.

![Electron](https://img.shields.io/badge/Electron-41-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

---

## ✨ Features

- **10 Languages** — C#, TypeScript, JavaScript, Java, Python, C++, SQL, Go, Rust, PHP with full syntax highlighting
- **Drag & Drop** — Drag any snippet directly into VS Code, Visual Studio, Notepad++, Sublime, or any text editor
- **Sidebar-Only Mode** — Collapse to a compact sidebar window for quick access while coding
- **Code Preview** — Hover over any snippet to see a tooltip preview of the code
- **Dark / Light Theme** — Toggle via menu or `Ctrl+T`, persisted across sessions
- **Custom Storage** — Choose where your snippets JSON file is stored
- **Search** — Filter snippets by title or language instantly
- **Offline** — Everything runs locally, no internet required

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run in Electron (full desktop app)
npm run electron:dev

# Or run in browser (development mode)
npm run dev
```

## 📦 Build for Distribution

```bash
# Local build (current platform only)
npm run electron:build
```

Outputs installers to `release/`.

## 🚢 Releases (CI/CD)

Builds for all platforms are automated via GitHub Actions.

| Platform | Artifacts |
|----------|-----------|
| Windows | `.exe` installer (NSIS) + portable `.exe` |
| macOS | `.dmg` + `.zip` |
| Linux | `.AppImage` + `.deb` |

To publish a release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will build all three platforms and attach installers to the GitHub Release automatically.

![Build Status](https://github.com/<owner>/<repo>/actions/workflows/build.yml/badge.svg)

## 🏗️ Architecture

```
Renderer (React + Zustand)  ──IPC──►  Main Process (Electron)
  ├── Components                       ├── store.cjs (electron-store)
  ├── Services (Bridge adapter)        ├── menu.cjs
  ├── Stores (snippets, settings)      ├── ipc.cjs
  └── Hooks (menu events)             └── preload.cjs
```

**Key patterns:** Adapter (Electron/browser bridge), Repository (data access), Strategy (environment detection), Cached factories (language instances)

## 📁 Project Structure

```
src/
  components/    → UI (Sidebar, Editor, AddSnippetForm, CodeTooltip, LanguageSelect)
  services/      → Business logic (bridge, migration, highlighter)
  store/         → State management (snippetStore, settingsStore)
  hooks/         → Custom hooks (useMenuEvents)
  types/         → TypeScript interfaces
  data/          → Default snippets (single source of truth)
  languages.ts   → Language registry

electron/
  main.cjs       → App lifecycle
  store.cjs      → Persistence
  menu.cjs       → Menu definition
  ipc.cjs        → IPC handlers
  preload.cjs    → Context bridge
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New snippet |
| `Ctrl+T` | Toggle dark/light theme |

## 🔧 Adding a Language

1. `npm install @codemirror/lang-<name>`
2. Add one line to `src/languages.ts`
3. Done — appears everywhere automatically

## 📖 Documentation

- [High-Level Design](docs/HLD.md)
- [Build Guide](docs/BUILD_GUIDE.md)
- [Architecture & Patterns](docs/ARCHITECTURE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Changelog](docs/CHANGELOG.md)

## 🛠️ Tech Stack

| | |
|---|---|
| Desktop | Electron 41 |
| UI | React 19 |
| Language | TypeScript 6 |
| Bundler | Vite 8 |
| State | Zustand 5 |
| Editor | CodeMirror 6 |
| Persistence | electron-store |
| CI/CD | GitHub Actions |
| Packaging | electron-builder |

## 📄 License

MIT
