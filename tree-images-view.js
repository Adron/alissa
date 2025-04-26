const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const { nativeImage } = require('electron');
const os = require('os');

// DOM Elements
const directoryTree = document.getElementById('directory-tree');
const filesGrid = document.getElementById('files-grid');
const currentPathDisplay = document.getElementById('current-path');

// State
let rootDirectory = '';
let currentDirectory = '';

// Platform detection
const platform = os.platform();
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

// File type icons mapping
const fileTypeIcons = {
    // Images
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️',
    'bmp': '🖼️',
    'webp': '🖼️',
    'svg': '🖼️',
    // Documents
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'txt': '📝',
    'rtf': '📝',
    'md': '📝',
    // Spreadsheets
    'xls': '📊',
    'xlsx': '📊',
    'csv': '📊',
    // Presentations
    'ppt': '📑',
    'pptx': '📑',
    // Archives
    'zip': '🗜️',
    'rar': '🗜️',
    '7z': '🗜️',
    'tar': '🗜️',
    'gz': '🗜️',
    // Code
    'js': '📜',
    'html': '📜',
    'css': '📜',
    'json': '📜',
    'xml': '📜',
    'py': '📜',
    'java': '📜',
    'cpp': '📜',
    'c': '📜',
    'php': '📜',
    'rb': '📜',
    'sh': '📜',
    // Audio
    'mp3': '🎵',
    'wav': '🎵',
    'ogg': '🎵',
    'flac': '🎵',
    // Video
    'mp4': '🎬',
    'avi': '🎬',
    'mov': '🎬',
    'mkv': '🎬',
    // Default
    'default': '📄'
};

// Image file extensions
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];

// Get file type icon
function getFileIcon(fileName) {
    const extension = path.extname(fileName).toLowerCase().slice(1);
    return fileTypeIcons[extension] || fileTypeIcons.default;
}

// Check if file is an image
function isImageFile(fileName) {
    const extension = path.extname(fileName).toLowerCase().slice(1);
    return imageExtensions.includes(extension);
}

// Create thumbnail for image files
function createImageThumbnail(filePath, fileName) {
    const container = document.createElement('div');
    container.className = 'thumbnail-container';
    
    const img = document.createElement('img');
    img.alt = fileName;
    img.className = 'file-thumbnail';
    
    // Use native image loading
    try {
        const image = nativeImage.createFromPath(filePath);
        if (!image.isEmpty()) {
            const size = image.getSize();
            const maxWidth = 150;
            const maxHeight = 100;
            
            // Calculate aspect ratio
            const aspectRatio = size.width / size.height;
            
            // Calculate new dimensions while maintaining aspect ratio
            let newWidth, newHeight;
            if (aspectRatio > 1) {
                // Landscape image
                newWidth = maxWidth;
                newHeight = maxWidth / aspectRatio;
            } else {
                // Portrait image
                newHeight = maxHeight;
                newWidth = maxHeight * aspectRatio;
            }
            
            // Resize the image while maintaining aspect ratio
            const resizedImage = image.resize({
                width: Math.round(newWidth),
                height: Math.round(newHeight),
                quality: 'good'
            });
            
            img.src = resizedImage.toDataURL();
            img.style.width = `${newWidth}px`;
            img.style.height = `${newHeight}px`;
        } else {
            throw new Error('Image is empty');
        }
    } catch (error) {
        console.error('Error loading image thumbnail:', error);
        // Fallback to file icon
        img.className = 'file-icon';
        img.textContent = getFileIcon(fileName);
    }
    
    container.appendChild(img);
    return container;
}

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

// Load settings and initialize view
function initializeView() {
    try {
        const settingsPath = path.join(__dirname, 'alissa-settings.json');
        console.log('Loading settings from:', settingsPath);
        
        if (fs.existsSync(settingsPath)) {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            console.log('Loaded settings:', settings);
            
            // Apply the theme
            if (settings.theme) {
                console.log('Applying theme:', settings.theme);
                applyTheme(settings.theme);
            }
            
            rootDirectory = settings.rootDirectory;
            console.log('Root directory:', rootDirectory);
            
            if (rootDirectory && fs.existsSync(rootDirectory)) {
                console.log('Root directory exists and is valid');
                currentDirectory = rootDirectory;
                console.log('Building directory tree for:', rootDirectory);
                buildDirectoryTree(rootDirectory);
                displayCurrentDirectoryContents();
            } else {
                console.error('Invalid root directory:', rootDirectory);
                showError('Invalid root directory. Please select a valid directory in settings.');
            }
        } else {
            console.error('Settings file not found:', settingsPath);
            showError('Settings file not found. Please configure the application first.');
        }
    } catch (error) {
        console.error('Error initializing view:', error);
        showError('Error loading settings. Please try again.');
    }
}

// Initialize the view when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing view...');
    initializeView();
});

// Get system-specific folder icon
function getFolderIcon(isOpen = false) {
    const iconBasePath = path.join(__dirname, 'assets', 'icons');
    let iconName;
    
    if (isWindows) {
        iconName = isOpen ? 'windows-folder-open.png' : 'windows-folder.png';
    } else if (isMac) {
        iconName = isOpen ? 'mac-folder-open.png' : 'mac-folder.png';
    } else if (isLinux) {
        iconName = isOpen ? 'linux-folder-open.png' : 'linux-folder.png';
    } else {
        // Fallback to generic icons
        iconName = isOpen ? 'folder-open.png' : 'folder.png';
    }
    
    const iconPath = path.join(iconBasePath, iconName);
    
    try {
        if (fs.existsSync(iconPath)) {
            const icon = nativeImage.createFromPath(iconPath);
            return icon.toDataURL();
        }
    } catch (error) {
        console.error('Error loading folder icon:', error);
    }
    
    // Fallback to system emoji if icon file not found
    return isOpen ? '📂' : '📁';
}

// Update the logEvent function to use ipcRenderer directly
function logEvent(type, data) {
    console.log(`[Renderer] ${type}:`, data); // Debug log
    ipcRenderer.send('console-event', type, data);
}

// Modify buildDirectoryTree to ensure events are sent
function buildDirectoryTree(directory) {
    console.log('Starting to build directory tree for:', directory); // Debug log
    logEvent('tree', { action: 'building', directory });
    directoryTree.innerHTML = '';
    
    function buildTree(dir, parentElement, level = 0) {
        try {
            console.log(`Reading directory at level ${level}:`, dir); // Debug log
            const items = fs.readdirSync(dir, { withFileTypes: true });
            const folders = items.filter(item => item.isDirectory());
            
            // Log the directory contents
            logEvent('tree', { 
                action: 'reading', 
                directory: dir, 
                level, 
                foldersFound: folders.length,
                totalItems: items.length,
                folders: folders.map(f => f.name)
            });
            
            if (folders.length === 0) {
                logEvent('tree', { action: 'no-folders', directory: dir });
                return;
            }
            
            folders.forEach(folder => {
                const li = document.createElement('li');
                const folderPath = path.join(dir, folder.name);
                li.dataset.path = folderPath;
                
                // Log each folder creation
                logEvent('tree', {
                    action: 'folder-added',
                    folder: folder.name,
                    path: folderPath,
                    level: level
                });
                
                const itemContent = document.createElement('div');
                
                // Create expand/collapse indicator
                const expandIcon = document.createElement('span');
                expandIcon.className = 'expand-icon';
                expandIcon.innerHTML = '▶';
                
                // Create folder icon
                const folderIcon = document.createElement('img');
                folderIcon.className = 'folder-icon';
                folderIcon.src = getFolderIcon(false);
                folderIcon.alt = 'Folder';
                
                const folderName = document.createElement('span');
                folderName.className = 'folder-name';
                folderName.textContent = folder.name;
                
                itemContent.appendChild(expandIcon);
                itemContent.appendChild(folderIcon);
                itemContent.appendChild(folderName);
                li.appendChild(itemContent);
                
                // Recursively build tree for subdirectories
                const subUl = document.createElement('ul');
                subUl.style.display = 'none';
                li.appendChild(subUl);
                
                // Add click handler for selection
                itemContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.log('Folder clicked:', folder.name); // Debug log
                    
                    // Log selection before any changes
                    logEvent('navigation', { 
                        type: 'folder',
                        action: 'selected',
                        folder: folder.name,
                        path: folderPath,
                        level: level
                    });
                    
                    // Remove selected class from all items
                    document.querySelectorAll('.directory-tree li').forEach(item => {
                        if (item.classList.contains('selected')) {
                            logEvent('navigation', {
                                type: 'folder',
                                action: 'deselected',
                                path: item.dataset.path
                            });
                        }
                        item.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked item
                    li.classList.add('selected');
                    
                    // Update current directory and display contents
                    const previousDirectory = currentDirectory;
                    currentDirectory = folderPath;
                    
                    // Log directory change
                    logEvent('navigation', {
                        type: 'directory',
                        action: 'changed',
                        from: previousDirectory,
                        to: folderPath
                    });
                    
                    displayCurrentDirectoryContents();
                    
                    // Toggle expand/collapse
                    const isHidden = subUl.style.display === 'none';
                    logEvent('tree', { 
                        action: 'toggle-expand', 
                        folder: folder.name,
                        expanded: isHidden,
                        path: folderPath
                    });
                    
                    subUl.style.display = isHidden ? 'block' : 'none';
                    expandIcon.innerHTML = isHidden ? '▼' : '▶';
                    folderIcon.src = getFolderIcon(isHidden);
                    
                    if (isHidden && subUl.children.length === 0) {
                        logEvent('tree', {
                            action: 'expanding-subtree',
                            folder: folder.name,
                            path: folderPath
                        });
                        buildTree(path.join(dir, folder.name), subUl, level + 1);
                    }
                });
                
                parentElement.appendChild(li);
            });
        } catch (error) {
            console.error('Error in buildTree:', error); // Debug log
            logEvent('error', { 
                type: 'directory-read', 
                directory: dir, 
                error: error.message,
                stack: error.stack
            });
        }
    }
    
    // Start with the root directory
    const rootLi = document.createElement('li');
    rootLi.dataset.path = directory;
    
    const rootContent = document.createElement('div');
    
    const expandIcon = document.createElement('span');
    expandIcon.className = 'expand-icon';
    expandIcon.innerHTML = '▼'; // Root is expanded by default
    
    const rootIcon = document.createElement('img');
    rootIcon.className = 'folder-icon';
    rootIcon.src = getFolderIcon(true); // Root is expanded by default
    rootIcon.alt = 'Root Folder';
    
    const rootName = document.createElement('span');
    rootName.className = 'folder-name';
    rootName.textContent = path.basename(directory);
    
    rootContent.appendChild(expandIcon);
    rootContent.appendChild(rootIcon);
    rootContent.appendChild(rootName);
    rootLi.appendChild(rootContent);
    
    // Create sub-ul for root directory
    const rootSubUl = document.createElement('ul');
    rootSubUl.style.display = 'block'; // Show root level by default
    rootLi.appendChild(rootSubUl);
    
    directoryTree.appendChild(rootLi);
    
    // Build the tree starting from root
    buildTree(directory, rootSubUl);
}

// Modify displayCurrentDirectoryContents to ensure events are sent
function displayCurrentDirectoryContents() {
    console.log('Displaying contents for:', currentDirectory); // Debug log
    logEvent('files', { 
        action: 'displaying', 
        directory: currentDirectory 
    });
    
    filesGrid.innerHTML = '';
    currentPathDisplay.textContent = currentDirectory;
    
    try {
        const items = fs.readdirSync(currentDirectory, { withFileTypes: true });
        const files = items
            .filter(item => !item.isDirectory())
            .sort((a, b) => a.name.localeCompare(b.name));
            
        // Log the file list
        logEvent('files', { 
            action: 'read', 
            directory: currentDirectory,
            totalItems: items.length,
            filesFound: files.length,
            files: files.map(f => ({
                name: f.name,
                isImage: isImageFile(f.name)
            }))
        });
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.path = path.join(currentDirectory, file.name);
            
            let iconElement;
            if (isImageFile(file.name)) {
                iconElement = createImageThumbnail(
                    path.join(currentDirectory, file.name),
                    file.name
                );
                logEvent('files', {
                    action: 'thumbnail-created',
                    file: file.name,
                    path: fileItem.dataset.path
                });
            } else {
                iconElement = document.createElement('div');
                iconElement.className = 'file-icon';
                iconElement.textContent = getFileIcon(file.name);
            }
            
            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = file.name;
            
            fileItem.appendChild(iconElement);
            fileItem.appendChild(fileName);
            
            // Add click handler for file selection
            fileItem.addEventListener('click', () => {
                logEvent('selection', {
                    type: 'file',
                    action: 'selected',
                    file: file.name,
                    path: fileItem.dataset.path,
                    isImage: isImageFile(file.name)
                });
                
                // Remove selected class from all items
                document.querySelectorAll('.file-item').forEach(item => {
                    if (item.classList.contains('selected')) {
                        logEvent('selection', {
                            type: 'file',
                            action: 'deselected',
                            file: item.querySelector('.file-name').textContent,
                            path: item.dataset.path
                        });
                    }
                    item.classList.remove('selected');
                });
                
                // Add selected class to clicked item
                fileItem.classList.add('selected');
            });
            
            filesGrid.appendChild(fileItem);
        });
    } catch (error) {
        console.error('Error in displayCurrentDirectoryContents:', error); // Debug log
        logEvent('error', { 
            type: 'directory-read', 
            directory: currentDirectory, 
            error: error.message,
            stack: error.stack
        });
        showError('Error reading directory contents.');
    }
}

// Show error message
function showError(message) {
    filesGrid.innerHTML = `<div class="error-message">${message}</div>`;
} 