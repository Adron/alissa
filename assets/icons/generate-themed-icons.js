const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG templates for each theme
const themeSvgs = {
    'hot-spastic-sassy': `
        <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="128" height="128" fill="#FF69B4" opacity="0.1"/>
            
            <!-- Animated girl silhouette -->
            <g transform="translate(64, 64)">
                <!-- Hair -->
                <path fill="#FF1493" d="M-20,-40 C-20,-60 20,-60 20,-40 C20,-20 -20,-20 -20,-40 Z"/>
                
                <!-- Body -->
                <path fill="#FF69B4" d="M-15,0 C-15,30 15,30 15,0 C15,-20 -15,-20 -15,0 Z"/>
                
                <!-- Legs -->
                <path fill="#FF69B4" d="M-15,30 L-25,60 M15,30 L25,60"/>
                
                <!-- Arms -->
                <path fill="#FF69B4" d="M-15,10 L-35,0 M15,10 L35,0"/>
                
                <!-- Heart animation -->
                <g class="heart">
                    <path fill="#FF1493" d="M-20,20 C-20,10 0,0 0,0 C0,0 20,10 20,20 C20,30 0,40 0,40 C0,40 -20,30 -20,20 Z"/>
                </g>
            </g>
        </svg>
    `,
    'blue-wave': `
        <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="128" height="128" fill="#1E90FF" opacity="0.1"/>
            
            <!-- Candle -->
            <g transform="translate(64, 64)">
                <!-- Candle base -->
                <rect x="-10" y="20" width="20" height="40" fill="#F5F5F5"/>
                
                <!-- Flame -->
                <path fill="#1E90FF" d="M0,-20 C-5,-30 5,-30 0,-40 C5,-30 -5,-30 0,-20 Z"/>
                
                <!-- Glow effect -->
                <circle cx="0" cy="-30" r="15" fill="#1E90FF" opacity="0.3"/>
                
                <!-- Waves -->
                <path fill="none" stroke="#1E90FF" stroke-width="2" d="M-30,30 Q0,20 30,30"/>
                <path fill="none" stroke="#1E90FF" stroke-width="2" d="M-30,40 Q0,30 30,40"/>
            </g>
        </svg>
    `,
    'maddening-darkness': `
        <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="128" height="128" fill="#2C3E50" opacity="0.1"/>
            
            <!-- Werewolf -->
            <g transform="translate(64, 64)">
                <!-- Head -->
                <path fill="#2C3E50" d="M-20,-20 C-20,-40 20,-40 20,-20 C20,0 -20,0 -20,-20 Z"/>
                
                <!-- Ears -->
                <path fill="#2C3E50" d="M-25,-30 L-35,-40 M25,-30 L35,-40"/>
                
                <!-- Eyes -->
                <circle cx="-10" cy="-25" r="3" fill="#FF0000"/>
                <circle cx="10" cy="-25" r="3" fill="#FF0000"/>
                
                <!-- Snout -->
                <path fill="#2C3E50" d="M-10,0 C-10,-10 10,-10 10,0 C10,10 -10,10 -10,0 Z"/>
                
                <!-- Claws -->
                <path fill="#2C3E50" d="M-15,20 L-25,30 M15,20 L25,30"/>
            </g>
        </svg>
    `,
    'system': `
        <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
            <!-- Background -->
            <rect width="128" height="128" fill="#808080" opacity="0.1"/>
            
            <!-- Laptop -->
            <g transform="translate(64, 64)">
                <!-- Screen -->
                <rect x="-30" y="-25" width="60" height="40" fill="#FFFFFF" stroke="#808080" stroke-width="2"/>
                
                <!-- Screen content -->
                <rect x="-25" y="-20" width="50" height="30" fill="#808080" opacity="0.2"/>
                
                <!-- Keyboard -->
                <rect x="-35" y="20" width="70" height="10" fill="#808080" rx="2"/>
                
                <!-- Keys -->
                <rect x="-30" y="25" width="10" height="5" fill="#FFFFFF" rx="1"/>
                <rect x="-15" y="25" width="10" height="5" fill="#FFFFFF" rx="1"/>
                <rect x="0" y="25" width="10" height="5" fill="#FFFFFF" rx="1"/>
                <rect x="15" y="25" width="10" height="5" fill="#FFFFFF" rx="1"/>
            </g>
        </svg>
    `
};

// Generate themed icons
async function generateThemedIcons() {
    try {
        const outputDir = path.join(__dirname, 'themes');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        for (const [theme, svg] of Object.entries(themeSvgs)) {
            await sharp(Buffer.from(svg))
                .png()
                .toFile(path.join(outputDir, `${theme}-icon.png`));
        }

        console.log('Themed icons generated successfully!');
    } catch (error) {
        console.error('Error generating themed icons:', error);
    }
}

generateThemedIcons(); 