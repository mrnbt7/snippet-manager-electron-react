const { Menu } = require('electron')

function buildAppMenu(win) {
  return Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'New Snippet', accelerator: 'CmdOrCtrl+N', click: () => win.webContents.send('menu:new-snippet') },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Settings',
      submenu: [
        { label: 'Toggle Theme', accelerator: 'CmdOrCtrl+T', click: () => win.webContents.send('menu:toggle-theme') },
        { label: 'Change Storage Location…', click: () => win.webContents.send('menu:change-storage') },
      ],
    },
  ])
}

module.exports = { buildAppMenu }
