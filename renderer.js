const { ipcRenderer } = require('electron');
const path = require('path');

// Set platform-specific shortcuts
const isMac = process.platform === 'darwin';
const exitShortcut = document.getElementById('exit-shortcut');
exitShortcut.textContent = isMac ? '⌘Q' : 'Alt+F4';

// View menu state management
let viewMenuState = {
    folderNavigation: false,
    imagePreview: false,
    floatingImage: false
};

// Folder Navigation
let currentRootPath = null;
let isResizing = false;
let startX = 0;
let startWidth = 0;

// Function to create folder icon based on platform
function getFolderIcon() {
    const platform = process.platform;
    switch (platform) {
        case 'darwin':
            return '📁'; // macOS folder
        case 'win32':
            return '📁'; // Windows folder
        case 'linux':
            return '📁'; // Linux folder
        default:
            return '📁';
    }
}

// Function to create folder tree item
function createFolderItem(folder) {
    const item = document.createElement('div');
    item.className = 'folder-item';
    item.dataset.path = folder.path;

    const toggle = document.createElement('span');
    toggle.className = 'folder-toggle';
    toggle.textContent = '▶';

    const icon = document.createElement('span');
    icon.className = 'folder-icon';
    icon.textContent = getFolderIcon();

    const name = document.createElement('span');
    name.className = 'folder-name';
    name.textContent = folder.name;

    item.appendChild(toggle);
    item.appendChild(icon);
    item.appendChild(name);

    return item;
}

// Function to load folder contents
async function loadFolderContents(folderPath, parentElement) {
    try {
        const folders = await ipcRenderer.invoke('get-folder-contents', folderPath);
        const ul = document.createElement('ul');
        ul.className = 'folder-tree';
        
        for (const folder of folders) {
            const li = document.createElement('li');
            const item = createFolderItem(folder);
            li.appendChild(item);
            ul.appendChild(li);
            
            item.addEventListener('click', async (e) => {
                e.stopPropagation();
                const toggle = item.querySelector('.folder-toggle');
                const subList = li.querySelector('ul');
                
                if (subList) {
                    subList.remove();
                    toggle.textContent = '▶';
                } else {
                    const newSubList = document.createElement('ul');
                    newSubList.className = 'folder-tree';
                    li.appendChild(newSubList);
                    await loadFolderContents(folder.path, newSubList);
                    toggle.textContent = '▼';
                }
            });
        }
        
        parentElement.appendChild(ul);
    } catch (error) {
        console.error('Error loading folder contents:', error);
    }
}

// Function to initialize folder navigation
async function initializeFolderNavigation() {
    const container = document.getElementById('folder-tree-container');
    container.innerHTML = '';
    
    // Get the root path from settings or use default
    const settings = await ipcRenderer.invoke('get-settings');
    currentRootPath = settings.startingFolder || await ipcRenderer.invoke('get-default-pictures-folder');
    
    const rootUl = document.createElement('ul');
    rootUl.className = 'folder-tree';
    const rootLi = document.createElement('li');
    const rootItem = createFolderItem({
        name: path.basename(currentRootPath),
        path: currentRootPath
    });
    
    rootLi.appendChild(rootItem);
    rootUl.appendChild(rootLi);
    container.appendChild(rootUl);
    
    // Add click handler for root item
    rootItem.addEventListener('click', async (e) => {
        e.stopPropagation();
        const toggle = rootItem.querySelector('.folder-toggle');
        const subList = rootLi.querySelector('ul');
        
        if (subList) {
            subList.remove();
            toggle.textContent = '▶';
        } else {
            const newSubList = document.createElement('ul');
            newSubList.className = 'folder-tree';
            rootLi.appendChild(newSubList);
            await loadFolderContents(currentRootPath, newSubList);
            toggle.textContent = '▼';
        }
    });
}

// Update folder navigation visibility
function updateFolderNavigationVisibility(visible) {
    const panel = document.getElementById('folder-navigation-panel');
    if (visible) {
        panel.classList.add('visible');
        if (!currentRootPath) {
            initializeFolderNavigation();
        }
    } else {
        panel.classList.remove('visible');
    }
}

// Resize handle functionality
const resizeHandle = document.getElementById('resize-handle');
const folderPanel = document.getElementById('folder-navigation-panel');

resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = folderPanel.offsetWidth;
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const width = startWidth + (e.clientX - startX);
    if (width >= 200 && width <= window.innerWidth * 0.5) {
        folderPanel.style.width = `${width}px`;
    }
});

document.addEventListener('mouseup', () => {
    isResizing = false;
});

// Function to update checkmark visibility
function updateCheckmark(id, visible) {
    const checkmark = document.querySelector(`#${id} .checkmark`);
    if (checkmark) {
        checkmark.classList.toggle('visible', visible);
    }
}

// Function to save view menu state
function saveViewMenuState() {
    ipcRenderer.send('save-settings', { viewMenuState });
}

// Function to apply view menu state
function applyViewMenuState() {
    Object.entries(viewMenuState).forEach(([key, value]) => {
        updateCheckmark(key, value);
        if (key === 'folderNavigation') {
            updateFolderNavigationVisibility(value);
        }
    });
}

// Load initial view menu state
async function loadInitialState() {
    const settings = await ipcRenderer.invoke('get-settings');
    if (settings.viewMenuState) {
        viewMenuState = settings.viewMenuState;
        applyViewMenuState();
    }
}

// Call loadInitialState when the application starts
loadInitialState();

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
    viewMenuState.imagePreview = !viewMenuState.imagePreview;
    updateCheckmark('image-preview', viewMenuState.imagePreview);
    saveViewMenuState();
    console.log('Image Preview clicked');
});

document.getElementById('floating-image').addEventListener('click', () => {
    viewMenuState.floatingImage = !viewMenuState.floatingImage;
    updateCheckmark('floating-image', viewMenuState.floatingImage);
    saveViewMenuState();
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

// Update menu item click handlers
document.getElementById('folder-navigation').addEventListener('click', () => {
    viewMenuState.folderNavigation = !viewMenuState.folderNavigation;
    updateCheckmark('folder-navigation', viewMenuState.folderNavigation);
    updateFolderNavigationVisibility(viewMenuState.folderNavigation);
    saveViewMenuState();
});

document.getElementById('image-preview').addEventListener('click', () => {
    viewMenuState.imagePreview = !viewMenuState.imagePreview;
    updateCheckmark('image-preview', viewMenuState.imagePreview);
    saveViewMenuState();
});

document.getElementById('floating-image').addEventListener('click', () => {
    viewMenuState.floatingImage = !viewMenuState.floatingImage;
    updateCheckmark('floating-image', viewMenuState.floatingImage);
    saveViewMenuState();
}); 