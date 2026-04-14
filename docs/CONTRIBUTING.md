# Contributing to Snippet Manager

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Run in dev mode: `npm run electron:dev`

## Development Workflow

### Running

```bash
# Browser mode (fast, no Electron)
npm run dev

# Electron mode (full features)
npm run electron:dev
```

### Linting

```bash
npm run lint
```

Fix all lint errors before submitting a PR.

### Building

```bash
npm run build          # Web build
npm run electron:build # Desktop distributable
```

## Code Guidelines

### Architecture Rules

- **Components** go in `src/components/` — UI only, no business logic
- **Services** go in `src/services/` — business logic, no UI
- **Stores** go in `src/store/` — state management via Zustand
- **Hooks** go in `src/hooks/` — reusable React hooks
- **Types** go in `src/types/` — interfaces and type definitions
- **Electron modules** go in `electron/` — CJS format, focused responsibilities

### Coding Standards

- Use granular Zustand selectors: `useStore((s) => s.field)` not `useStore()`
- Use `useMemo`/`useCallback` for expensive computations and stable references
- Keep components small — extract when a component exceeds ~80 lines
- Prefer composition over inheritance
- No `any` types — use proper TypeScript interfaces

### Adding a Language

1. `npm install @codemirror/lang-<name>`
2. Import in `src/languages.ts`
3. Add entry: `LangName: cached(langFactory),`

### Adding an IPC Channel

1. Add handler in `electron/ipc.cjs`
2. Expose in `electron/preload.cjs`
3. Add to appropriate interface in `src/types/snippet.ts`
4. Map in `src/services/bridge.ts`

## Pull Request Process

1. Ensure `npm run lint` passes
2. Ensure `npm run build` succeeds
3. Update documentation if adding features
4. Write a clear PR description explaining what and why
5. Keep PRs focused — one feature or fix per PR

## Reporting Issues

- Use GitHub Issues
- Include: steps to reproduce, expected behavior, actual behavior
- Include: OS, Node.js version, Electron version
