# Changelog

All notable changes to Snippet Manager are documented here.

## [0.2.0] — 2025-07-15

### Added
- Folder support: create, rename, delete, collapse/expand folders
- Drag snippets onto folder headers to organize
- Reorder snippets via drag within the sidebar
- Dock mode: pin app to right edge of screen as always-on-top strip
- Dock collapsed/expanded sub-states with icon buttons
- Resizable sidebar via drag handle
- SVG icons throughout the sidebar (folders, snippets, actions)
- Search box with magnifying glass icon
- Snippet items show code icon and language badge
- Folder headers show open/closed folder icon with count badge
- Action buttons show on hover only (rename, delete)
- Active snippet highlighted with accent border
- Window state management: maximize/restore across collapse/dock transitions

### Changed
- Sidebar redesigned with polished UI, CSS variables for theming
- Layout constants extracted to shared `constants.ts`
- Icons extracted to shared `components/icons/`
- `SnippetRepository` split into `SnippetRepository` + `FolderRepository` (ISP)
- Bridge service uses `localJsonStore()` factory to reduce duplication (DRY)
- Sidebar renders via shared `renderSearch/renderActions/renderForms/renderList` helpers (DRY)

### Architecture
- Interface Segregation: separate FolderRepository
- Extracted SVG icons to `components/icons/index.tsx`
- Extracted layout constants to `constants.ts`
- `localJsonStore()` helper eliminates repeated localStorage read/write patterns

## [0.1.0] — 2025-07-15

### Added
- Initial release
- Snippet CRUD (create, read, update, delete)
- CodeMirror editor with syntax highlighting
- 10 language support: C#, TypeScript, JavaScript, Java, Python, C++, SQL, Go, Rust, PHP
- Drag & drop snippets to external editors
- Sidebar-only compact mode with window resize
- Code preview tooltip on hover
- Dark and light theme with persistence
- Custom storage location picker
- Search/filter by title or language
- Default snippets seeded on first launch
- Electron menu: File (New Snippet, Quit), Settings (Toggle Theme, Change Storage)
- Keyboard shortcuts: Ctrl+N (new), Ctrl+T (toggle theme)
- Browser fallback mode (localStorage)
- GitHub Actions CI/CD for Windows, macOS, Linux builds

### Architecture
- Adapter pattern for Electron/browser abstraction
- Repository pattern for data access
- Zustand stores with granular selectors
- Cached language instances for performance
- Single source of truth for default snippets
- Modular Electron main process
