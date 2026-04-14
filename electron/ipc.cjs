const { ipcMain, BrowserWindow, dialog } = require('electron')
const { getAllSnippets, saveSnippet, removeSnippet, getSettings, saveSettings, getStoragePath } = require('./store.cjs')

function registerIpcHandlers(app, getMainWindow) {
  ipcMain.handle('window:resize', (_e, width, height, hideMenu) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return
    win.setMenuBarVisibility(!hideMenu)
    win.setAutoHideMenuBar(hideMenu)
    win.setSize(width, height, true)
  })

  ipcMain.handle('snippets:getAll', () => getAllSnippets())
  ipcMain.handle('snippets:save', (_e, snippet) => saveSnippet(snippet))
  ipcMain.handle('snippets:remove', (_e, id) => removeSnippet(id))

  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:save', (_e, settings) => saveSettings(settings))
  ipcMain.handle('settings:chooseFolder', async () => {
    const result = await dialog.showOpenDialog(getMainWindow(), { properties: ['openDirectory'] })
    return result.canceled ? null : result.filePaths[0]
  })
  ipcMain.handle('settings:getStoragePath', () => getStoragePath(app))
}

module.exports = { registerIpcHandlers }
