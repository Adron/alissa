const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let consoleWindow = null;

function areSettingsValid() {
    try {
        const settingsPath = path.join(__dirname, 'alissa-settings.json');
        if (!fs.existsSync(settingsPath)) {
            return false;
        }

        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        
        // Map view names to their corresponding HTML files
        const viewFileMap = {
            'tree-images': 'tree-images-view.html',
            'tree-view-preview': 'tree-view-preview.html'
        };
        
        const viewFile = viewFileMap[settings.selectedView] || settings.selectedView;
        const viewPath = path.join(__dirname, viewFile);
        
        // Check if all required settings are present and valid
        return settings.theme && 
               settings.rootDirectory && 
               settings.selectedView &&
               fs.existsSync(settings.rootDirectory) &&
               fs.existsSync(viewPath);
    } catch (error) {
        console.error('Error checking settings:', error);
        return false;
    }
}

function openModal() {
    if (mainWindow) {
        mainWindow.loadFile('index.html');
    }
}

function createConsoleWindow() {
    if (consoleWindow && !consoleWindow.isDestroyed()) {
        consoleWindow.focus();
        return;
    }

    consoleWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'Event Console'
    });

    consoleWindow.loadFile('console-window.html');

    // Wait for the window to be ready
    consoleWindow.webContents.on('did-finish-load', () => {
        try {
            logEvent('console', { action: 'created' });
            // Send any queued events that might have occurred while the window was loading
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-console-menu', true);
            }
        } catch (error) {
            console.error('Error in console window ready handler:', error);
        }
    });

    consoleWindow.on('closed', () => {
        try {
            logEvent('console', { action: 'closed' });
            consoleWindow = null;
            // Update menu to show "Show Console"
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-console-menu', false);
            }
        } catch (error) {
            console.error('Error in console window close handler:', error);
        }
    });
}

function closeConsoleWindow() {
    try {
        if (consoleWindow && !consoleWindow.isDestroyed()) {
            consoleWindow.close();
        }
    } catch (error) {
        console.error('Error closing console window:', error);
    }
}

// Handle console window toggle
ipcMain.on('show-console', () => {
    if (consoleWindow) {
        closeConsoleWindow();
    } else {
        createConsoleWindow();
    }
});

// Function to log events to console window
function logToConsole(type, data) {
    console.log(`[Main] ${type}:`, data); // Debug log
    try {
        if (consoleWindow && !consoleWindow.isDestroyed()) {
            consoleWindow.webContents.send('console-event', type, data);
        }
    } catch (error) {
        console.error('Error sending event to console window:', error);
    }
}

// Handle console events from renderer
ipcMain.on('console-event', (event, type, data) => {
    console.log(`Received console event from renderer: ${type}`); // Debug log
    logToConsole(type, data);
});

// Enhanced event logging function
function logEvent(type, data) {
    console.log(`[${type}]`, data);
    logToConsole(type, data);
}

// Log directory operations
function logDirectoryOperation(operation, path, details = {}) {
    logEvent('directory', {
        operation,
        path,
        ...details
    });
}

// Log file operations
function logFileOperation(operation, file, details = {}) {
    logEvent('file', {
        operation,
        file,
        ...details
    });
}

// Log UI events
function logUIEvent(event, details = {}) {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) {
            logEvent('ui', {
                event,
                ...details
            });
        }
    } catch (error) {
        console.error('Error logging UI event:', error);
    }
}

// Log IPC events
function logIPCEvent(channel, data) {
    logEvent('ipc', {
        channel,
        data
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    logEvent('window', { action: 'created', type: 'main' });

    // Check if we should skip the modal
    if (areSettingsValid()) {
        const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'alissa-settings.json'), 'utf8'));
        const viewFileMap = {
            'tree-images': 'tree-images-view.html',
            'tree-view-preview': 'tree-view-preview.html'
        };
        const viewFile = viewFileMap[settings.selectedView] || settings.selectedView;
        mainWindow.loadFile(viewFile);
        logEvent('window', { 
            action: 'loaded', 
            file: viewFile,
            settings: {
                theme: settings.theme,
                rootDirectory: settings.rootDirectory,
                selectedView: settings.selectedView
            }
        });
    } else {
        mainWindow.loadFile('index.html');
        logEvent('window', { action: 'loaded', file: 'index.html' });
    }

    // Add window event listeners with error handling
    mainWindow.on('focus', () => {
        try {
            if (!mainWindow.isDestroyed()) {
                logUIEvent('window-focus');
            }
        } catch (error) {
            console.error('Error in window focus handler:', error);
        }
    });

    mainWindow.on('blur', () => {
        try {
            if (!mainWindow.isDestroyed()) {
                logUIEvent('window-blur');
            }
        } catch (error) {
            console.error('Error in window blur handler:', error);
        }
    });

    mainWindow.on('resize', () => {
        try {
            if (!mainWindow.isDestroyed()) {
                const size = mainWindow.getSize();
                logUIEvent('window-resize', { width: size[0], height: size[1] });
            }
        } catch (error) {
            console.error('Error in window resize handler:', error);
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle view selection
ipcMain.on('select-view', (event, viewFile) => {
    try {
        const viewPath = path.join(__dirname, viewFile);
        if (fs.existsSync(viewPath)) {
            mainWindow.loadFile(viewFile);
        } else {
            console.error(`View file not found: ${viewFile}`);
            // Fallback to modal if view file doesn't exist
            openModal();
        }
    } catch (error) {
        console.error('Error loading view:', error);
        openModal();
    }
});

// Handle directory selection
ipcMain.on('select-directory', async (event) => {
    logIPCEvent('select-directory', {});
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        logDirectoryOperation('selected', result.filePaths[0]);
        event.reply('selected-directory', result.filePaths[0]);
    }
});

// Handle exit command
ipcMain.on('exit-app', () => {
    logIPCEvent('exit-app', {});
    app.quit();
});

// Handle open modal command
ipcMain.on('open-modal', () => {
    logIPCEvent('open-modal', {});
    openModal();
}); 