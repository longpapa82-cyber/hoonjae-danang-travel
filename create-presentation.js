const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/hoonjaepark/.claude/plugins/marketplaces/anthropic-agent-skills/skills/pptx/scripts/html2pptx.js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createGradientBackgrounds() {
  // Gradient 1: Teal gradient for cover
  const gradient1 = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="562.5">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#277884"/>
        <stop offset="100%" style="stop-color:#5EA8A7"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g1)"/>
  </svg>`;

  // Gradient 2: Reverse teal gradient for closing
  const gradient2 = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="562.5">
    <defs>
      <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#5EA8A7"/>
        <stop offset="100%" style="stop-color:#277884"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g2)"/>
  </svg>`;

  await sharp(Buffer.from(gradient1)).png().toFile('slides/gradient1.png');
  await sharp(Buffer.from(gradient2)).png().toFile('slides/gradient2.png');
  console.log('✓ Gradient backgrounds created');
}

async function updateHtmlWithGradients() {
  // Update slide 1
  let slide1 = fs.readFileSync('slides/slide1-cover.html', 'utf8');
  slide1 = slide1.replace(
    'background: linear-gradient(135deg, #277884 0%, #5EA8A7 100%);',
    "background-image: url('gradient1.png'); background-size: cover;"
  );
  fs.writeFileSync('slides/slide1-cover.html', slide1);

  // Update slide 10
  let slide10 = fs.readFileSync('slides/slide10-closing.html', 'utf8');
  slide10 = slide10.replace(
    'background: linear-gradient(135deg, #5EA8A7 0%, #277884 100%);',
    "background-image: url('gradient2.png'); background-size: cover;"
  );
  fs.writeFileSync('slides/slide10-closing.html', slide10);
  console.log('✓ HTML files updated with gradient images');
}

async function createPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Travel Plan Team';
  pptx.title = '다낭 여행 플래너 화면설계서';

  const slides = [
    'slides/slide1-cover.html',
    'slides/slide2-overview.html',
    'slides/slide3-tech.html',
    'slides/slide4-structure.html',
    'slides/slide5-home.html',
    'slides/slide6-map.html',
    'slides/slide7-schedule.html',
    'slides/slide8-settings.html',
    'slides/slide9-features.html',
    'slides/slide10-closing.html'
  ];

  for (let i = 0; i < slides.length; i++) {
    console.log(`Processing slide ${i + 1}/${slides.length}: ${path.basename(slides[i])}`);
    await html2pptx(slides[i], pptx);
  }

  await pptx.writeFile({ fileName: 'travelPlan-screen-design.pptx' });
  console.log('✓ Presentation created: travelPlan-screen-design.pptx');
}

async function main() {
  console.log('Creating Travel Plan Screen Design Presentation...\n');

  await createGradientBackgrounds();
  await updateHtmlWithGradients();
  await createPresentation();

  console.log('\n✓ All done!');
}

main().catch(console.error);
