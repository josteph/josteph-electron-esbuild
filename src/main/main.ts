import path from 'path'
import { fork } from 'child_process';
import { format } from 'url'
import { shell, app, BrowserWindow } from 'electron'
import { is } from 'electron-util'
import type { ChildProcess } from 'child_process';
import MenuBuilder from './menu';

let win: BrowserWindow | null = null;
let socket: ChildProcess | null = null;

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      {
        loadExtensionOptions: { allowFileAccess: true },
        forceDownload: false,
      }
    )
    .catch(console.log);
};

async function createWindow() {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  win = new BrowserWindow({
    show: false,
    minWidth: 400,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: false,
    },
    titleBarStyle: 'hidden',
  })

  const isDev = is.development;

  if (isDev) {
    win.loadURL('http://localhost:9080')
  } else {
    win.loadURL(
      format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      }),
    )
  }

  const menuBuilder = new MenuBuilder(win);
  menuBuilder.buildMenu();

  win.on('closed', () => {
    win = null;
    if (socket) {
      socket.unref();
    }
  });

  win.webContents.on('devtools-opened', () => {
    win!.focus();
  })

  win.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  win.on('ready-to-show', () => {
    win!.show()
    win!.focus()

    if (isDev) {
      win!.webContents.openDevTools({ mode: 'bottom' })
    }
  })
}

app.on('ready', () => {
  socket = fork(path.join(__dirname, `./socket${process.env.UNSTABLE_UWS ? '.uws' : ''}.js`), [], {
    detached: true,
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (!is.macos) {
    app.quit();

    if (socket) {
      socket.unref();
    }
  }
})

app.on('activate', () => {
  if (win === null && app.isReady()) {
    socket = fork(path.join(__dirname, `./socket${process.env.UNSTABLE_UWS ? '.uws' : ''}.js`), [], {
      detached: true,
    });

    createWindow();
  }
})
