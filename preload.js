const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlay', {
  setAlwaysOnTop: (enabled) => ipcRenderer.invoke('set-always-on-top', enabled),
  setOpacity: (opacity) => ipcRenderer.invoke('set-opacity', opacity),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onToggleSettings: (callback) => ipcRenderer.on('toggle-settings', callback)
});
