const Store = require('electron-store').default
const defaults = require('../src/data/defaults.json')

const settingsStore = new Store({ name: 'settings', defaults: { theme: 'dark', storagePath: '' } })

function getSnippetStore() {
  const custom = settingsStore.get('storagePath')
  const opts = { name: 'snippets' }
  if (custom) opts.cwd = custom
  return new Store(opts)
}

function seedDefaults(store) {
  if (store.get('snippets', []).length) return
  const now = Date.now()
  store.set('snippets', defaults.map((s) => ({ ...s, createdAt: now, updatedAt: now })))
}

function getAllSnippets() { return getSnippetStore().get('snippets', []) }

function saveSnippet(snippet) {
  const store = getSnippetStore()
  const snippets = store.get('snippets', [])
  const idx = snippets.findIndex((s) => s.id === snippet.id)
  if (idx >= 0) snippets[idx] = snippet; else snippets.push(snippet)
  store.set('snippets', snippets)
}

function saveAllSnippets(snippets) { getSnippetStore().set('snippets', snippets) }

function removeSnippet(id) {
  const store = getSnippetStore()
  store.set('snippets', store.get('snippets', []).filter((s) => s.id !== id))
}

function getAllFolders() { return getSnippetStore().get('folders', []) }
function saveAllFolders(folders) { getSnippetStore().set('folders', folders) }

function getSettings() { return settingsStore.store }
function saveSettings(settings) { settingsStore.set(settings) }
function getStoragePath(app) { return settingsStore.get('storagePath') || app.getPath('userData') }

module.exports = { seedDefaults, getSnippetStore, getAllSnippets, saveSnippet, saveAllSnippets, removeSnippet, getAllFolders, saveAllFolders, getSettings, saveSettings, getStoragePath }
