const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const https = require('https');
const path = require('path');

const fontUrl = 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_pqTbtbK-F2qO0g.ttf';
const fontPath = path.join(__dirname, 'Playfair.ttf');

function downloadFont() {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(fontPath);
        https.get(fontUrl, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', err => {
            fs.unlink(fontPath, () => { });
            reject(err);
        });
    });
}

async function createIcon(isApple, size, filename) {
    try {
        if (!fs.existsSync(fontPath)) {
            await downloadFont();
        }

        registerFont(fontPath, { family: 'Playfair Display', weight: 500, style: 'italic' });

        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        if (isApple) {
            ctx.fillStyle = '#F6F2EC';
            ctx.fillRect(0, 0, size, size);
        } else {
            ctx.clearRect(0, 0, size, size);
        }

        ctx.fillStyle = '#5E6B3C';
        ctx.font = `italic 500 ${size * 0.45}px "Playfair Display"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // P&O Text
        ctx.fillText('P&O', size / 2, size / 2 + (size * 0.05));

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(__dirname, 'public', filename), buffer);
        console.log(`Created ${filename}`);

    } catch (e) {
        console.error(e);
    }
}

async function createOgImage() {
    try {
        if (!fs.existsSync(fontPath)) {
            await downloadFont();
        }

        registerFont(fontPath, { family: 'Playfair Display', weight: 500, style: 'italic' });

        const width = 1200;
        const height = 630;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#F6F2EC';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#5E6B3C';
        ctx.font = `italic 500 350px "Playfair Display"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P&O', width / 2, height / 2 - 50);

        ctx.fillStyle = '#C4714A';
        ctx.font = `italic 500 60px "Playfair Display"`;
        ctx.fillText('19 de Septiembre de 2026', width / 2, height / 2 + 180);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(__dirname, 'public', 'opengraph-image.png'), buffer);
        console.log(`Created opengraph-image.png`);

    } catch (e) {
        console.error(e);
    }
}

async function main() {
    await createIcon(false, 512, 'favicon.png');
    await createIcon(true, 512, 'apple-touch-icon.png');
    await createOgImage();

    if (fs.existsSync(fontPath)) {
        fs.unlinkSync(fontPath);
    }
}

main();
