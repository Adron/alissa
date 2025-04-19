const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Windows-style folder icon
const windowsFolderSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#0078D7" d="M14 4v9H2V3h4.5l1-1H14v2z"/>
    <path fill="#0078D7" d="M2 3v10h12V4H7.5l-1-1H2z"/>
</svg>
`;

// macOS-style folder icon
const macFolderSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#3B82F6" d="M2 3h5l1 1h6v2H2V3z"/>
    <path fill="#3B82F6" d="M2 5v8h12V5H2z"/>
</svg>
`;

// Linux-style folder icon
const linuxFolderSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4B5563" d="M2 3h5l1 1h6v2H2V3z"/>
    <path fill="#4B5563" d="M2 5v8h12V5H2z"/>
</svg>
`;

// Windows-style open folder icon
const windowsFolderOpenSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#0078D7" d="M14 4v9H2V3h4.5l1-1H14v2z"/>
    <path fill="#0078D7" d="M2 3v10h12V4H7.5l-1-1H2z"/>
    <path fill="#FFFFFF" d="M2 5h12v2H2z"/>
</svg>
`;

// macOS-style open folder icon
const macFolderOpenSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#3B82F6" d="M2 3h5l1 1h6v2H2V3z"/>
    <path fill="#3B82F6" d="M2 5v8h12V5H2z"/>
    <path fill="#FFFFFF" d="M2 5h12v2H2z"/>
</svg>
`;

// Linux-style open folder icon
const linuxFolderOpenSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4B5563" d="M2 3h5l1 1h6v2H2V3z"/>
    <path fill="#4B5563" d="M2 5v8h12V5H2z"/>
    <path fill="#FFFFFF" d="M2 5h12v2H2z"/>
</svg>
`;

// Generic folder icon
const genericFolderSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#6B7280" d="M2 3h5l1 1h6v2H2V3z"/>
    <path fill="#6B7280" d="M2 5v8h12V5H2z"/>
</svg>
`;

// Generic open folder icon
const genericFolderOpenSvg = `
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fill="#6B7280" d="M2 3h5l1 1h6v2H2V3z"/>
    <path fill="#6B7280" d="M2 5v8h12V5H2z"/>
    <path fill="#FFFFFF" d="M2 5h12v2H2z"/>
</svg>
`;

// Convert SVG to PNG and save
async function saveIcon(svg, filename) {
    await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(__dirname, filename));
}

// Generate all icons
async function generateIcons() {
    try {
        await saveIcon(windowsFolderSvg, 'windows-folder.png');
        await saveIcon(windowsFolderOpenSvg, 'windows-folder-open.png');
        await saveIcon(macFolderSvg, 'mac-folder.png');
        await saveIcon(macFolderOpenSvg, 'mac-folder-open.png');
        await saveIcon(linuxFolderSvg, 'linux-folder.png');
        await saveIcon(linuxFolderOpenSvg, 'linux-folder-open.png');
        await saveIcon(genericFolderSvg, 'folder.png');
        await saveIcon(genericFolderOpenSvg, 'folder-open.png');
        console.log('Icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons(); 