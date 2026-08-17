import { rename, stat } from "node:fs/promises";
import sharp from "sharp";

const desktopSource = "public/images/hero-source-v2.png";
const mobileSource = "public/images/hero-mobile-source-v2.png";

await sharp(desktopSource)
  .resize(1440, 900, { fit: "cover", position: "centre", withoutEnlargement: false })
  .webp({ quality: 72, effort: 6 })
  .toFile("public/images/hero-bg-v2.webp");

await sharp(mobileSource)
  .resize(640, 1100, { fit: "cover", position: "centre", withoutEnlargement: false })
  .webp({ quality: 70, effort: 6 })
  .toFile("public/images/hero-mobile-v2.webp");

await sharp(desktopSource)
  .resize(1200, 630, { fit: "cover", position: "centre", withoutEnlargement: false })
  .jpeg({ quality: 80, progressive: true, mozjpeg: true })
  .toFile("public/images/og-bike-manager-v2.jpg");

await sharp("public/favicon.png")
  .resize(96, 96, { fit: "cover" })
  .png({ compressionLevel: 9, palette: true, quality: 86 })
  .toFile("public/favicon.optimized.png");

await rename("public/favicon.optimized.png", "public/favicon.png");

const files = [
  "public/images/hero-bg-v2.webp",
  "public/images/hero-mobile-v2.webp",
  "public/images/og-bike-manager-v2.jpg",
  "public/favicon.png",
];

for (const file of files) {
  const fileStat = await stat(file);
  console.log(`${file}: ${Math.round(fileStat.size / 1024)}KB`);
}
