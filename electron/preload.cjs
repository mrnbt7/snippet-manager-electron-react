const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('snippetAPI', {
  getAll: () => ipcRenderer.invoke('snippets:getAll'),
  save: (snippet) => ipcRenderer.invoke('snippets:save', snippet),
  saveAll: (snippets) => ipcRenderer.invoke('snippets:saveAll', snippets),
  remove: (id) => ipcRenderer.invoke('snippets:remove', id),
  getFolders: () => ipcRenderer.invoke('folders:getAll'),
  saveFolders: (folders) => ipcRenderer.invoke('folders:saveAll', folders),
  resizeWindow: (w, h, hideMenu) => ipcRenderer.invoke('window:resize', w, h, hideMenu),
  dockWindow: () => ipcRenderer.invoke('window:dock'),
  undockWindow: () => ipcRenderer.invoke('window:undock'),
  dockResize: (w) => ipcRenderer.invoke('window:dockResize', w),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  chooseFolder: () => ipcRenderer.invoke('settings:chooseFolder'),
  getStoragePath: () => ipcRenderer.invoke('settings:getStoragePath'),
  onMenuEvent: (channel, callback) => {
    ipcRenderer.on(channel, callback)
    return () => ipcRenderer.removeListener(channel, callback)
  },
})
