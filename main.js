const { app, BrowserWindow, globalShortcut, ipcMain, shell } = require('electron');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

let mainWindow;
let localServer;

function startLocalServer() {
  localServer = http.createServer((request, response) => {
    const requestedPath = request.url === '/' ? '/index.html' : request.url;
    const filePath = path.resolve(__dirname, `.${requestedPath}`);

    if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    const extension = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8'
    };
    response.writeHead(200, {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve, reject) => {
    localServer.once('error', reject);
    localServer.listen(0, '127.0.0.1', () => {
      const address = localServer.address();
      resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

async function createWindow() {
  const localOrigin = await startLocalServer();
  mainWindow = new BrowserWindow({
    width: 405,
    height: 720,
    minWidth: 240,
    minHeight: 426,
    frame: false,
    resizable: true,
    transparent: false,
    alwaysOnTop: true,
    backgroundColor: '#000000',
    title: 'Subway Surfers gameplay',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setAspectRatio(9 / 16);
  mainWindow.setMenuBarVisibility(false);
  globalShortcut.unregister('CommandOrControl+Shift+S');
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('toggle-settings');
    }
  });
  await mainWindow.loadURL(`${localOrigin}/`);
}

app.whenReady().then(() => {
  ipcMain.handle('set-always-on-top', (_event, enabled) => {
    if (!mainWindow) return false;
    mainWindow.setAlwaysOnTop(Boolean(enabled));
    return mainWindow.isAlwaysOnTop();
  });

  ipcMain.handle('set-opacity', (_event, opacity) => {
    if (!mainWindow) return 1;
    const value = Math.min(1, Math.max(0.2, Number(opacity) || 1));
    mainWindow.setOpacity(value);
    return value;
  });

  ipcMain.handle('open-external', (_event, url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return false;
      shell.openExternal(parsed.toString());
      return true;
    } catch {
      return false;
    }
  });

  createWindow().catch((error) => {
    console.error('Could not start the local player:', error);
    app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (localServer) localServer.close();
  if (process.platform !== 'darwin') app.quit();
});
