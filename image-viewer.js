const { ipcRenderer } = require('electron');
const sharp = require('sharp');

let originalImagePath = '';
let isFullResolution = false;
let originalMetadata = null;

// DOM Elements
const viewerImage = document.getElementById('viewer-image');
const maximizeButton = document.getElementById('maximize-button');

// Handle image load request from main process
ipcRenderer.on('load-image', async (event, { imagePath, fileName }) => {
    originalImagePath = imagePath;
    document.title = fileName;
    
    try {
        // Get image metadata
        const metadata = await sharp(imagePath).metadata();
        originalMetadata = metadata;
        
        if (!isFullResolution) {
            // Load half resolution version
            const halfWidth = Math.round(metadata.width / 2);
            const halfHeight = Math.round(metadata.height / 2);
            
            await sharp(imagePath)
                .resize(halfWidth, halfHeight)
                .toBuffer()
                .then(data => {
                    const blob = new Blob([data], { type: `image/${metadata.format}` });
                    viewerImage.src = URL.createObjectURL(blob);
                });

            // Tell main process to resize window for half resolution
            ipcRenderer.send('resize-image-viewer', {
                width: halfWidth,
                height: halfHeight
            });
        } else {
            // Load full resolution
            await sharp(imagePath)
                .toBuffer()
                .then(data => {
                    const blob = new Blob([data], { type: `image/${metadata.format}` });
                    viewerImage.src = URL.createObjectURL(blob);
                });

            // Tell main process to resize window for full resolution
            ipcRenderer.send('resize-image-viewer', {
                width: metadata.width,
                height: metadata.height
            });
        }
    } catch (error) {
        console.error('Error loading image:', error);
        ipcRenderer.send('image-load-error', error.message);
    }
});

// Handle maximize button click
maximizeButton.addEventListener('click', async () => {
    if (!originalImagePath || !originalMetadata) return;
    
    isFullResolution = !isFullResolution;
    maximizeButton.classList.toggle('maximized');
    
    try {
        if (isFullResolution) {
            // Load full resolution
            const buffer = await sharp(originalImagePath)
                .toBuffer();
            
            const blob = new Blob([buffer], { type: `image/${originalMetadata.format}` });
            viewerImage.src = URL.createObjectURL(blob);

            // Resize window for full resolution
            ipcRenderer.send('resize-image-viewer', {
                width: originalMetadata.width,
                height: originalMetadata.height
            });
        } else {
            // Load half resolution
            const halfWidth = Math.round(originalMetadata.width / 2);
            const halfHeight = Math.round(originalMetadata.height / 2);
            
            const buffer = await sharp(originalImagePath)
                .resize(halfWidth, halfHeight)
                .toBuffer();
            
            const blob = new Blob([buffer], { type: `image/${originalMetadata.format}` });
            viewerImage.src = URL.createObjectURL(blob);

            // Resize window for half resolution
            ipcRenderer.send('resize-image-viewer', {
                width: halfWidth,
                height: halfHeight
            });
        }
    } catch (error) {
        console.error('Error toggling image resolution:', error);
        ipcRenderer.send('image-load-error', error.message);
    }
}); 