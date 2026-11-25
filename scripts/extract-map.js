const fs = require('fs');
const path = require('path');

const srcPath = path.resolve('../temp_banglar_alo_repo/news1/project/resources/views/frontend/index.blade.php');
const content = fs.readFileSync(srcPath, 'utf8');
const lines = content.split('\n');

const svgStart = lines.findIndex(l => l.includes('<svg'));
const svgEnd = lines.findIndex((l, idx) => idx >= svgStart && l.includes('</svg>'));

console.log('SVG range:', svgStart, 'to', svgEnd);
const rawSvg = lines.slice(svgStart, svgEnd + 1).join('\n');

// Write raw SVG to an .svg file so we can inspect or import it
fs.writeFileSync('public/bangladesh-map-exact.svg', rawSvg);
console.log('Wrote public/bangladesh-map-exact.svg, length:', rawSvg.length);
