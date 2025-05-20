const { ipcRenderer } = require('electron');
const path = require('path');
const os = require('os');

// Get the default pictures folder based on OS
function getDefaultPicturesFolder() {
    const platform = process.platform;
    const homeDir = os.homedir();

    switch (platform) {
        case 'win32':
            return path.join(homeDir, 'Pictures');
        case 'darwin':
            return path.join(homeDir, 'Pictures');
        case 'linux':
            return path.join(homeDir, 'Pictures');
        default:
            return homeDir;
    }
}

// Load saved settings or use defaults
ipcRenderer.invoke('get-settings').then(settings => {
    const folderPath = settings.startingFolder || getDefaultPicturesFolder();
    document.getElementById('folder-path').value = folderPath;
});

// Handle browse button click
document.getElementById('browse-button').addEventListener('click', async () => {
    const result = await ipcRenderer.invoke('select-folder');
    if (result) {
        document.getElementById('folder-path').value = result;
    }
});

// Handle save button click
document.getElementById('save-button').addEventListener('click', () => {
    const folderPath = document.getElementById('folder-path').value;
    ipcRenderer.send('save-settings', { startingFolder: folderPath });
    window.close();
});

// Handle cancel button click
document.getElementById('cancel-button').addEventListener('click', () => {
    window.close();
}); 