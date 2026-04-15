const { ipcMain, BrowserWindow, dialog } = require('electron')
const { getAllSnippets, saveSnippet, saveAllSnippets, removeSnippet, getAllFolders, saveAllFolders, getSettings, saveSettings, getStoragePath } = require('./store.cjs')

function registerIpcHandlers(app, getMainWindow) {
  let wasMaximized = false
  let preDockBounds = null

  ipcMain.handle('window:resize', (_e, width, height, hideMenu) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return
    win.setMenuBarVisibility(!hideMenu)
    win.setAutoHideMenuBar(hideMenu)
    if (hideMenu) {
      wasMaximized = win.isMaximized()
      if (wasMaximized) win.unmaximize()
      win.setMaximizable(false)
      win.setSize(width, height, true)
      win.center()
    } else {
      win.setMaximizable(true)
      if (wasMaximized) {
        win.maximize()
        wasMaximized = false
      } else {
        win.setSize(width, height, true)
        win.center()
      }
    }
  })

  ipcMain.handle('window:dock', (_e) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return
    preDockBounds = win.getBounds()
    wasMaximized = win.isMaximized()
    if (wasMaximized) win.unmaximize()
    const { screen } = require('electron')
    const display = screen.getDisplayMatching(win.getBounds())
    const { width: sw, height: sh, x: sx, y: sy } = display.workArea
    const dockWidth = 120
    win.setMenuBarVisibility(false)
    win.setAutoHideMenuBar(true)
    win.setMaximizable(false)
    win.setMinimizable(false)
    win.setResizable(false)
    win.setBounds({ x: sx + sw - dockWidth, y: sy, width: dockWidth, height: sh }, true)
    win.setAlwaysOnTop(true)
  })

  ipcMain.handle('window:dockResize', (_e, dockWidth) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return
    const { screen } = require('electron')
    const display = screen.getDisplayMatching(win.getBounds())
    const { width: sw, x: sx, y: sy, height: sh } = display.workArea
    win.setResizable(true)
    win.setBounds({ x: sx + sw - dockWidth, y: sy, width: dockWidth, height: sh }, true)
    win.setResizable(dockWidth > 120)
  })

  ipcMain.handle('window:undock', (_e) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return
    win.setAlwaysOnTop(false)
    win.setMaximizable(true)
    win.setMinimizable(true)
    win.setResizable(true)
    win.setMenuBarVisibility(true)
    win.setAutoHideMenuBar(false)
    if (preDockBounds) {
      win.setBounds(preDockBounds, true)
      preDockBounds = null
    }
    if (wasMaximized) {
      win.maximize()
      wasMaximized = false
    }
  })

  ipcMain.handle('snippets:getAll', () => getAllSnippets())
  ipcMain.handle('snippets:save', (_e, snippet) => saveSnippet(snippet))
  ipcMain.handle('snippets:saveAll', (_e, snippets) => saveAllSnippets(snippets))
  ipcMain.handle('snippets:remove', (_e, id) => removeSnippet(id))

  ipcMain.handle('folders:getAll', () => getAllFolders())
  ipcMain.handle('folders:saveAll', (_e, folders) => saveAllFolders(folders))

  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:save', (_e, settings) => saveSettings(settings))
  ipcMain.handle('settings:chooseFolder', async () => {
    const result = await dialog.showOpenDialog(getMainWindow(), { properties: ['openDirectory'] })
    return result.canceled ? null : result.filePaths[0]
  })
  ipcMain.handle('settings:getStoragePath', () => getStoragePath(app))
}

module.exports = { registerIpcHandlers }
