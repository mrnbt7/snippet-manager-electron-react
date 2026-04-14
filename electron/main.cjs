const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { seedDefaults, getSnippetStore } = require('./store.cjs')
const { buildAppMenu } = require('./menu.cjs')
const { registerIpcHandlers } = require('./ipc.cjs')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  Menu.setApplicationMenu(buildAppMenu(mainWindow))

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

seedDefaults(getSnippetStore())
registerIpcHandlers(app, () => mainWindow)

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
