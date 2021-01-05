const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { menu } = require("./menu")
const { autoUpdater } = require("electron-updater")
const isWindows = process.platform === "win32";
app.whenReady().then(() => {
    const myWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
            enableRemoteModule: true,
            nativeWindowOpen: true
        },
        frame: isWindows ? false : true,
        minWidth: 320,
        minHeight: 240,
        icon: "./icon.ico"
    });
    myWindow.webContents.executeJavaScript(`var cachedText = ""`)
    myWindow.loadFile("index.html")
    ipcMain.on(`display-app-menu`, function(e, args) {
        if (isWindows && myWindow) {
            menu.popup({
                window: myWindow,
                x: args.x,
                y: args.y
            });
        }
    });
    myWindow.once("ready-to-show", () => {
        autoUpdater.checkForUpdatesAndNotify();
    })
})
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});
ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });