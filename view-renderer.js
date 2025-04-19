const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Check settings validity on view load
document.addEventListener('DOMContentLoaded', () => {
    const settingsButton = document.getElementById('open-settings');
    
    settingsButton.addEventListener('click', () => {
        ipcRenderer.send('open-modal');
    });

    // Check if settings are valid
    try {
        const settingsPath = path.join(__dirname, 'alissa-settings.json');
        if (!fs.existsSync(settingsPath)) {
            ipcRenderer.send('open-modal');
            return;
        }

        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        if (!settings.theme || !settings.rootDirectory || !settings.selectedView || !fs.existsSync(settings.rootDirectory)) {
            ipcRenderer.send('open-modal');
        }
    } catch (error) {
        console.error('Error checking settings:', error);
        ipcRenderer.send('open-modal');
    }
}); 