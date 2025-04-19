const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

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

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Check if we should skip the modal
    if (areSettingsValid()) {
        const settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'alissa-settings.json'), 'utf8'));
        // Map view names to their corresponding HTML files
        const viewFileMap = {
            'tree-images': 'tree-images-view.html',
            'tree-view-preview': 'tree-view-preview.html'
        };
        const viewFile = viewFileMap[settings.selectedView] || settings.selectedView;
        mainWindow.loadFile(viewFile);
    } else {
        mainWindow.loadFile('index.html');
    }
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
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        event.reply('selected-directory', result.filePaths[0]);
    }
});

// Handle exit command
ipcMain.on('exit-app', () => {
    app.quit();
});

// Handle open modal command
ipcMain.on('open-modal', () => {
    openModal();
}); 