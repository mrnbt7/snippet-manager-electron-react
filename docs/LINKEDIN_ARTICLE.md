# I Built a Code Snippet Manager Desktop App — Here's What I Learned About Clean Architecture in Electron + React

## The Problem

Every developer has code snippets scattered across Gist, Notion, random text files, and browser bookmarks. I wanted one thing: a lightweight desktop app where I can store snippets and **drag them directly into my editor**.

So I built **Snippet Manager** — an Electron + React + TypeScript desktop app. But this article isn't about the features. It's about the architecture decisions that made the codebase maintainable.

## The Stack

- **Electron 41** — Desktop shell
- **React 19** — UI
- **TypeScript 6** — Type safety
- **Vite 8** — Bundler (fast HMR)
- **Zustand 5** — State management
- **CodeMirror 6** — Code editor with syntax highlighting
- **electron-store** — JSON persistence to disk

## The Architecture Challenge

Electron apps have a unique problem: you're building **two applications** that talk to each other.

- The **Main Process** (Node.js) handles the window, menus, file system, and persistence
- The **Renderer Process** (browser) runs your React app

The naive approach is to scatter `ipcRenderer.invoke()` calls throughout your React components. That creates tight coupling and makes the app impossible to test or run without Electron.

## The Solution: Adapter Pattern

I created a **Bridge Service** that abstracts the environment:

```typescript
// services/bridge.ts
export const snippetRepo: SnippetRepository = electronAvailable
  ? { getAll: raw.getAll, save: raw.save, remove: raw.remove }
  : createLocalStorageFallback()
```

The React app never knows if it's running in Electron or a browser. During development, I run `npm run dev` (Vite only) and everything works with localStorage. In production, the same code uses Electron IPC.

**Key insight:** Your UI code should never import from `electron`. That's the preload script's job.

## Interface Segregation

The original API was one fat interface with 9 methods. I split it:

```typescript
interface SnippetRepository { getAll, save, remove }
interface SettingsRepository { get, save, chooseFolder, getStoragePath }
interface WindowService { resize }
interface MenuService { on }
```

Each consumer only depends on what it needs. The snippet store doesn't know about window resizing. The settings store doesn't know about snippets.

## The Performance Trap

Clicking sidebar items rapidly caused white screens. The root cause: **CodeMirror was recreating language extensions on every render**.

```tsx
// ❌ Creates new extension array every render
<CodeMirror extensions={[lang.extension()]} />

// ✅ Memoized — only recreates when language changes
const extensions = useMemo(() => lang ? [lang.extension()] : [], [snippet?.language])
<CodeMirror key={snippet.id} extensions={extensions} />
```

The `key` prop is critical — it tells React to **unmount and remount** CodeMirror when switching snippets, instead of trying to reconcile the existing instance (which causes the white screen).

## Single Source of Truth

Default snippets were duplicated in the Electron main process AND the React store. I extracted them to a single `defaults.json` file consumed by both:

```
src/data/defaults.json  ← Single source of truth
  ├── consumed by electron/store.cjs (main process seeding)
  └── consumed by src/data/defaults.ts (renderer fallback)
```

## Modular Electron Main Process

The main process started as one 100-line file. I split it into focused modules:

```
electron/
  main.cjs    → App lifecycle (30 lines)
  store.cjs   → Persistence logic
  menu.cjs    → Menu definition
  ipc.cjs     → IPC handler registration
  preload.cjs → Context bridge
```

Each module has one reason to change. Adding a new menu item? Only touch `menu.cjs`. New IPC channel? Only touch `ipc.cjs` and `bridge.ts`.

## What I'd Do Differently

1. **Use CSS Modules** instead of a single App.css — component styles would be co-located
2. **Add tests** — the Repository interfaces make mocking trivial, but I didn't write tests yet
3. **Use Electron Forge** instead of electron-builder — better DX for packaging

## Key Takeaways

1. **Adapter pattern is essential for Electron** — abstract the IPC boundary so your React code is environment-agnostic
2. **CodeMirror needs careful memoization** — extensions and values must be stable references
3. **Split your Electron main process** — it's tempting to put everything in one file, but it becomes unmaintainable fast
4. **Interface segregation pays off early** — small focused interfaces are easier to implement, test, and mock
5. **Single source of truth for data** — if the same data exists in two places, extract it

The full source code is on GitHub. If you're building Electron + React apps, I hope these patterns save you some debugging time.

---

*#electron #react #typescript #architecture #cleancode #solidprinciples #designpatterns #webdev #desktop #codemirror*
