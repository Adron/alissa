const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Alissa Fox Logo SVG - A cute, smiling fox face
const alissaFoxSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <!-- Face shape - rounded triangle -->
    <path fill="#FF7043" d="M256 40
        C 360 40, 472 180, 472 320
        C 472 420, 376 472, 256 472
        C 136 472, 40 420, 40 320
        C 40 180, 152 40, 256 40 Z"/>
    
    <!-- Inner face marking -->
    <path fill="#FFCCBC" d="M256 100
        C 340 100, 420 200, 420 320
        C 420 400, 340 420, 256 420
        C 172 420, 92 400, 92 320
        C 92 200, 172 100, 256 100 Z"/>
    
    <!-- Eyes -->
    <g transform="translate(0,0)">
        <!-- Left eye -->
        <ellipse cx="180" cy="260" rx="30" ry="40" fill="#4A4A4A"/>
        <circle cx="190" cy="250" r="10" fill="#FFFFFF"/>
        <!-- Right eye -->
        <ellipse cx="332" cy="260" rx="30" ry="40" fill="#4A4A4A"/>
        <circle cx="342" cy="250" r="10" fill="#FFFFFF"/>
    </g>
    
    <!-- Nose -->
    <path fill="#4A4A4A" d="M256 300
        C 270 300, 280 310, 280 325
        C 280 340, 270 350, 256 350
        C 242 350, 232 340, 232 325
        C 232 310, 242 300, 256 300 Z"/>
    
    <!-- Smile -->
    <path fill="none" stroke="#4A4A4A" stroke-width="12" stroke-linecap="round"
        d="M180 340
        C 220 380, 292 380, 332 340"/>
    
    <!-- Ears -->
    <g transform="translate(0,0)">
        <!-- Left ear -->
        <path fill="#FF7043" d="M100 140
            L 60 20
            L 180 100 Z"/>
        <path fill="#FFCCBC" d="M100 140
            L 80 60
            L 160 110 Z"/>
        
        <!-- Right ear -->
        <path fill="#FF7043" d="M412 140
            L 452 20
            L 332 100 Z"/>
        <path fill="#FFCCBC" d="M412 140
            L 432 60
            L 352 110 Z"/>
    </g>
</svg>
`;

// Generate different sizes for various purposes
async function generateAppIcons() {
    try {
        const sizes = {
            favicon: [16, 32, 48],  // Common favicon sizes
            logo: [64, 128, 256],   // Various logo sizes
            avatar: [512]           // Full size avatar
        };

        // Create the output directory if it doesn't exist
        const outputDir = path.join(__dirname, 'app');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Generate favicon.ico (multi-size icon file)
        const faviconBuffer = await sharp(Buffer.from(alissaFoxSvg))
            .resize(48, 48)
            .png()
            .toBuffer();

        await sharp(faviconBuffer)
            .toFile(path.join(outputDir, 'favicon.ico'));

        // Generate PNG versions
        for (const [type, typeSizes] of Object.entries(sizes)) {
            for (const size of typeSizes) {
                await sharp(Buffer.from(alissaFoxSvg))
                    .resize(size, size)
                    .png()
                    .toFile(path.join(outputDir, `alissa-${type}-${size}.png`));
            }
        }

        console.log('Application icons generated successfully!');
    } catch (error) {
        console.error('Error generating application icons:', error);
    }
}

generateAppIcons(); 