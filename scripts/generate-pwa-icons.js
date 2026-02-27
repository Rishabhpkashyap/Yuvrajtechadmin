const fs = require('fs');
const path = require('path');

// Simple SVG to create icons
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg)" rx="${size/16}"/>
  
  <!-- Border -->
  <rect x="2" y="2" width="${size-4}" height="${size-4}" fill="none" stroke="#64748b" stroke-width="2" rx="${size/20}"/>
  
  <!-- Main Text CS -->
  <text x="${size/2}" y="${size/2 - size/16}" font-family="Arial, sans-serif" font-size="${size/6}" font-weight="bold" text-anchor="middle" fill="#f1f5f9">CS</text>
  
  <!-- Sub Text ADMIN -->
  <text x="${size/2}" y="${size/2 + size/8}" font-family="Arial, sans-serif" font-size="${size/12}" text-anchor="middle" fill="#94a3b8">ADMIN</text>
  
  <!-- Decorative elements -->
  <circle cx="${size/4}" cy="${size/4}" r="${size/32}" fill="#3b82f6" opacity="0.6"/>
  <circle cx="${size*3/4}" cy="${size/4}" r="${size/32}" fill="#10b981" opacity="0.6"/>
  <circle cx="${size/4}" cy="${size*3/4}" r="${size/32}" fill="#f59e0b" opacity="0.6"/>
  <circle cx="${size*3/4}" cy="${size*3/4}" r="${size/32}" fill="#ef4444" opacity="0.6"/>
</svg>`;

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🎨 Generating PWA icons...');

sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Created ${filename}`);
});

// Create favicon.ico placeholder
const faviconSVG = createIconSVG(32);
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconSVG);

console.log('✅ Created favicon.svg');
console.log('');
console.log('📝 Note: SVG icons created. For production, convert to PNG using:');
console.log('   - Online converter like https://convertio.co/svg-png/');
console.log('   - Or use a tool like ImageMagick');
console.log('   - Or keep SVG (modern browsers support SVG icons)');
console.log('');
console.log('🚀 PWA icons generated successfully!');