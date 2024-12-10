// DOM Elements
const imageCanvas = document.getElementById('imageCanvas');
const imageUpload = document.getElementById('imageUpload');
const colorPreview = document.getElementById('colorPreview');
const colorHex = document.getElementById('colorHex');
const colorRgb = document.getElementById('colorRgb');
const colorHsl = document.getElementById('colorHsl');
const colorHistory = document.querySelector('.color-history');

// Utility Functions
const rgbToHex = (r, g, b) =>
    `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

// Color Details Update
const updateColorDetails = (r, g, b) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    colorPreview.style.backgroundColor = hex;
    colorHex.textContent = `HEX: ${hex}`;
    colorRgb.textContent = `RGB: rgb(${r}, ${g}, ${b})`;
    colorHsl.textContent = `HSL: ${hsl}`;

    const colorBlock = document.createElement('div');
    colorBlock.classList.add('color-block');
    colorBlock.style.backgroundColor = hex;
    colorBlock.title = hex;
    colorBlock.addEventListener('click', () => {
        updateColorDetails(r, g, b); // Update the details when clicked from history
        navigator.clipboard.writeText(hex);
    });
    colorHistory.appendChild(colorBlock);
};

// Image Upload Handler
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const ctx = imageCanvas.getContext('2d');
                
                // Dynamically resizing the canvas to fit the image without stretching
                const aspectRatio = img.width / img.height;
                const canvasWidth = window.innerWidth * 0.8; // 80% of window width
                const canvasHeight = canvasWidth / aspectRatio;

                imageCanvas.width = canvasWidth;
                imageCanvas.height = canvasHeight;
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
});

// Color Picking
imageCanvas.addEventListener('click', (e) => {
    const rect = imageCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (imageCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (imageCanvas.height / rect.height);

    const ctx = imageCanvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;

    updateColorDetails(pixel[0], pixel[1], pixel[2]);
});

// Resize canvas to fit screen without scrolling
const resizeCanvas = () => {
    const canvasContainer = document.querySelector('.canvas-container');
    const maxWidth = window.innerWidth * 0.8; // Adjust for padding/margin
    const maxHeight = window.innerHeight - 150; // Adjust for header and footer

    const aspectRatio = 1.5; // Maintain aspect ratio
    imageCanvas.width = maxWidth;
    imageCanvas.height = maxWidth / aspectRatio;
};

window.addEventListener('resize', resizeCanvas); // Adjust the canvas on window resize
resizeCanvas(); // Initial resize
