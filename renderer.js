const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// DOM Elements
const themeSelect = document.getElementById('theme-select');
const rootDirectoryInput = document.getElementById('root-directory');
const browseButton = document.getElementById('browse-directory');
const exitButton = document.getElementById('exit-button');
const viewButtons = document.querySelectorAll('.view-button');

// Track current settings state
let currentSettings = {
    theme: '',
    rootDirectory: ''
};

// Apply theme to the document
function applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove(
        'theme-system',
        'theme-maddening-darkness',
        'theme-hot-spastic-sassy',
        'theme-blue-wave'
    );
    
    // Add the selected theme class
    document.body.classList.add(`theme-${theme}`);
}

// Save settings to file
function saveSettings() {
    try {
        const settings = {
            theme: themeSelect.value || 'system',
            rootDirectory: rootDirectoryInput.value,
            selectedView: '' // Will be updated when a view is selected
        };
        const settingsPath = path.join(__dirname, 'alissa-settings.json');
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        
        // Update current settings state
        currentSettings = {
            theme: settings.theme,
            rootDirectory: settings.rootDirectory
        };
        
        // Apply the theme
        applyTheme(settings.theme);
        
        validateAndUpdateViewButtons();
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Load settings from file
function loadSettings() {
    try {
        const settingsPath = path.join(__dirname, 'alissa-settings.json');
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            themeSelect.value = settings.theme || 'system';
            rootDirectoryInput.value = settings.rootDirectory || '';
            
            // Store current settings state
            currentSettings = {
                theme: themeSelect.value,
                rootDirectory: rootDirectoryInput.value
            };
            
            // Apply the theme
            applyTheme(themeSelect.value);
            
            validateAndUpdateViewButtons();
        } else {
            // Set default theme if no settings file exists
            themeSelect.value = 'system';
            currentSettings = {
                theme: 'system',
                rootDirectory: ''
            };
            saveSettings(); // Save initial settings
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        themeSelect.value = 'system';
        currentSettings = {
            theme: 'system',
            rootDirectory: ''
        };
        saveSettings(); // Save default settings
    }
}

// Validate settings and update view buttons
function validateAndUpdateViewButtons() {
    const rootDir = rootDirectoryInput.value;
    const theme = themeSelect.value;
    
    // Check if root directory exists and is valid
    const isRootDirValid = rootDir && fs.existsSync(rootDir);
    
    // Check if theme is selected
    const isThemeValid = theme && theme !== '';
    
    // Enable/disable view buttons based on validation
    viewButtons.forEach(button => {
        button.disabled = !(isRootDirValid && isThemeValid);
    });
}

// Handle directory selection
function selectDirectory() {
    ipcRenderer.send('select-directory');
}

// Handle view selection
function handleViewSelection(viewName) {
    try {
        const settingsPath = path.join(__dirname, 'alissa-settings.json');
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        settings.selectedView = viewName;
        settings.theme = themeSelect.value || 'system';
        settings.rootDirectory = rootDirectoryInput.value;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        
        // Map view names to their corresponding HTML files
        const viewFileMap = {
            'tree-images': 'tree-images-view.html',
            'tree-view-preview': 'tree-view-preview.html'
        };
        
        ipcRenderer.send('select-view', viewFileMap[viewName] || viewName);
    } catch (error) {
        console.error('Error updating settings with view selection:', error);
    }
}

// Event Listeners
viewButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const viewName = e.target.dataset.view;
        handleViewSelection(viewName);
    });
});

browseButton.addEventListener('click', selectDirectory);
exitButton.addEventListener('click', () => {
    ipcRenderer.send('exit-app');
});

// Add event listeners for theme and root directory changes
themeSelect.addEventListener('change', () => {
    validateAndUpdateViewButtons();
    saveSettings();
});

rootDirectoryInput.addEventListener('input', () => {
    validateAndUpdateViewButtons();
    saveSettings();
});

// IPC Listeners
ipcRenderer.on('selected-directory', (event, directory) => {
    if (directory) {
        rootDirectoryInput.value = directory;
        validateAndUpdateViewButtons();
        saveSettings();
    }
});

// Load settings when the page loads
document.addEventListener('DOMContentLoaded', loadSettings); 