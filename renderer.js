const { ipcRenderer } = require('electron');

// Set platform-specific shortcuts
const isMac = process.platform === 'darwin';
const exitShortcut = document.getElementById('exit-shortcut');
exitShortcut.textContent = isMac ? '⌘Q' : 'Alt+F4';

// Menu event handlers
document.getElementById('settings').addEventListener('click', () => {
    ipcRenderer.send('open-settings');
});

document.getElementById('exit').addEventListener('click', () => {
    ipcRenderer.send('exit-app');
});

document.getElementById('fullscreen').addEventListener('click', () => {
    ipcRenderer.send('toggle-fullscreen');
});

document.getElementById('image-preview').addEventListener('click', () => {
    console.log('Image Preview clicked');
});

document.getElementById('floating-image').addEventListener('click', () => {
    console.log('Floating Image clicked');
});

document.getElementById('select-all').addEventListener('click', () => {
    ipcRenderer.send('select-all');
});

document.getElementById('deselect-all').addEventListener('click', () => {
    ipcRenderer.send('deselect-all');
});

document.getElementById('about').addEventListener('click', () => {
    console.log('About clicked');
});

document.getElementById('docs').addEventListener('click', () => {
    console.log('Docs clicked');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Full Screen (F11)
    if (e.key === 'F11') {
        ipcRenderer.send('toggle-fullscreen');
    }
    
    // Select All (Cmd/Ctrl + A)
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        ipcRenderer.send('select-all');
    }
    
    // Deselect All (Cmd/Ctrl + Shift + A)
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault();
        ipcRenderer.send('deselect-all');
    }
    
    // Exit (Cmd+Q on Mac, Alt+F4 on Windows)
    if (isMac) {
        if (e.metaKey && e.key === 'q') {
            e.preventDefault();
            ipcRenderer.send('exit-app');
        }
    } else {
        if (e.altKey && e.key === 'F4') {
            e.preventDefault();
            ipcRenderer.send('exit-app');
        }
    }
}); 