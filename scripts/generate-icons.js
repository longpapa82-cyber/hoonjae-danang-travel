const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 아이콘 크기 배열
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG 파일 경로
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const iconsDir = path.join(__dirname, '../public/icons');

// SVG 파일 읽기
const svgBuffer = fs.readFileSync(svgPath);

// 각 크기별로 PNG 생성
async function generateIcons() {
  console.log('🎨 아이콘 생성 시작...\n');

  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ 생성 완료: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ 생성 실패: icon-${size}x${size}.png`, error);
    }
  }

  console.log('\n🎉 모든 아이콘 생성 완료!');
}

generateIcons();
