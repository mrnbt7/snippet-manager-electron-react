# API Reference — Snippet Manager

## IPC Channels

All communication between the Renderer and Main process goes through these IPC channels, exposed via the preload script's `contextBridge`.

### Snippet Channels

| Channel | Direction | Params | Returns | Description |
|---------|-----------|--------|---------|-------------|
| `snippets:getAll` | Renderer → Main | — | `Snippet[]` | Get all stored snippets |
| `snippets:save` | Renderer → Main | `Snippet` | `void` | Create or update a snippet |
| `snippets:remove` | Renderer → Main | `string` (id) | `void` | Delete a snippet by ID |

### Settings Channels

| Channel | Direction | Params | Returns | Description |
|---------|-----------|--------|---------|-------------|
| `settings:get` | Renderer → Main | — | `Settings` | Get current settings |
| `settings:save` | Renderer → Main | `Settings` | `void` | Save settings |
| `settings:chooseFolder` | Renderer → Main | — | `string \| null` | Open folder picker dialog |
| `settings:getStoragePath` | Renderer → Main | — | `string` | Get current storage directory |

### Window Channels

| Channel | Direction | Params | Returns | Description |
|---------|-----------|--------|---------|-------------|
| `window:resize` | Renderer → Main | `width, height, hideMenu` | `void` | Resize window and toggle menu |

### Menu Event Channels

| Channel | Direction | Description |
|---------|-----------|-------------|
| `menu:new-snippet` | Main → Renderer | User clicked File → New Snippet |
| `menu:toggle-theme` | Main → Renderer | User clicked Settings → Toggle Theme |
| `menu:change-storage` | Main → Renderer | User clicked Settings → Change Storage |

## TypeScript Interfaces

### Snippet

```typescript
interface Snippet {
  id: string        // UUID v4
  title: string     // User-defined title
  language: string  // Must match a key in LANGUAGES (e.g. "JavaScript", "C#")
  code: string      // The snippet code content
  createdAt: number // Unix timestamp (ms)
  updatedAt: number // Unix timestamp (ms)
}
```

### Settings

```typescript
interface Settings {
  theme: 'dark' | 'light'
  storagePath: string  // Empty string = default OS path
}
```

### Repository Interfaces

```typescript
interface SnippetRepository {
  getAll: () => Promise<Snippet[]>
  save: (snippet: Snippet) => Promise<void>
  remove: (id: string) => Promise<void>
}

interface SettingsRepository {
  get: () => Promise<Settings>
  save: (settings: Settings) => Promise<void>
  chooseFolder: () => Promise<string | null>
  getStoragePath: () => Promise<string>
}
```

### Service Interfaces

```typescript
interface WindowService {
  resize: (width: number, height: number, hideMenu: boolean) => Promise<void>
}

interface MenuService {
  on: (channel: string, callback: () => void) => () => void  // Returns unsubscribe fn
}
```

## Zustand Stores

### snippetStore

| Field | Type | Description |
|-------|------|-------------|
| `snippets` | `Snippet[]` | All loaded snippets |
| `selectedId` | `string \| null` | Currently selected snippet ID |
| `search` | `string` | Current search query |

| Action | Params | Description |
|--------|--------|-------------|
| `load()` | — | Load snippets from repository, seed defaults if empty |
| `select(id)` | `string \| null` | Select a snippet |
| `setSearch(q)` | `string` | Update search filter |
| `add(title, language)` | `string, string` | Create a new snippet |
| `update(id, patch)` | `string, Partial<Snippet>` | Update snippet fields |
| `remove(id)` | `string` | Delete a snippet |

### settingsStore

| Field | Type | Description |
|-------|------|-------------|
| `theme` | `'dark' \| 'light'` | Current theme |
| `storagePath` | `string` | Current storage directory |

| Action | Params | Description |
|--------|--------|-------------|
| `load()` | — | Load settings from repository |
| `toggleTheme()` | — | Switch theme and persist |
| `setStoragePath(path)` | `string` | Update storage path and persist |
