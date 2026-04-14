const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('snippetAPI', {
  getAll: () => ipcRenderer.invoke('snippets:getAll'),
  save: (snippet) => ipcRenderer.invoke('snippets:save', snippet),
  remove: (id) => ipcRenderer.invoke('snippets:remove', id),
  resizeWindow: (w, h, hideMenu) => ipcRenderer.invoke('window:resize', w, h, hideMenu),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  chooseFolder: () => ipcRenderer.invoke('settings:chooseFolder'),
  getStoragePath: () => ipcRenderer.invoke('settings:getStoragePath'),
  onMenuEvent: (channel, callback) => {
    ipcRenderer.on(channel, callback)
    return () => ipcRenderer.removeListener(channel, callback)
  },
})
