const { ipcRenderer } = require('electron');
const sharp = require('sharp');

let originalImagePath = '';
let isFullResolution = false;
let originalMetadata = null;

// DOM Elements
const viewerImage = document.getElementById('viewer-image');
const enlargeButton = document.getElementById('enlarge-button');

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
            const buffer = await sharp(imagePath).toBuffer();
            const blob = new Blob([buffer], { type: `image/${metadata.format}` });
            viewerImage.src = URL.createObjectURL(blob);

            // Tell main process to resize window for full resolution
            ipcRenderer.send('resize-image-viewer', {
                width: metadata.width,
                height: metadata.height
            });

            // Update button text
            enlargeButton.innerHTML = `
                <svg class="enlarge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
                Original Size (${metadata.width} x ${metadata.height})
            `;
        }
    } catch (error) {
        console.error('Error loading image:', error);
    }
});

// Handle enlarge button click
enlargeButton.addEventListener('click', () => {
    if (!isFullResolution && originalMetadata) {
        isFullResolution = true;
        // Trigger reload of image at full resolution
        ipcRenderer.send('reload-image', { 
            imagePath: originalImagePath,
            width: originalMetadata.width,
            height: originalMetadata.height
        });
    }
}); 