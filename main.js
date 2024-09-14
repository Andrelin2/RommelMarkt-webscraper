const { app, BrowserWindow } = require('electron');
const path = require('path');
const { shell } = require('electron');

function createWindow() {
    // Create the browser window
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // Enable Node.js integration in the renderer process
            nodeIntegration: true,
            contextIsolation: false,  // Required to allow nodeIntegration
        },
    });

    // Listen for new-window events on mainWindow
    win.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
    // Load the index.html file
    win.loadFile('index.html');
}



// Electron lifecycle events
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
