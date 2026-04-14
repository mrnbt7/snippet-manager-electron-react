# Changelog

All notable changes to Snippet Manager are documented here.

## [0.1.0] — 2025-07-15

### Added
- Initial release
- Snippet CRUD (create, read, update, delete)
- CodeMirror editor with syntax highlighting
- 10 language support: C#, TypeScript, JavaScript, Java, Python, C++, SQL, Go, Rust, PHP
- Drag & drop snippets to external editors (VS Code, Visual Studio, Notepad++, etc.)
- Sidebar-only compact mode with window resize
- Code preview tooltip on hover
- Dark and light theme with persistence
- Custom storage location picker
- Search/filter by title or language
- Default snippets seeded on first launch
- Electron menu: File (New Snippet, Quit), Settings (Toggle Theme, Change Storage)
- Keyboard shortcuts: Ctrl+N (new), Ctrl+T (toggle theme)
- Browser fallback mode (localStorage) for development without Electron

### Architecture
- Adapter pattern for Electron/browser environment abstraction
- Repository pattern for data access
- Interface segregation (SnippetRepository, SettingsRepository, WindowService, MenuService)
- Zustand stores with granular selectors
- Cached language instances for performance
- Single source of truth for default snippets (defaults.json)
- Modular Electron main process (main, store, menu, ipc)
