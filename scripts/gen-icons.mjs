import sharp from "sharp";
import { writeFileSync } from "fs";

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#1B4FD8"/>
  <text x="50" y="68" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="#FFFFFF" text-anchor="middle">A</text>
</svg>`;

const targets = [
  { size: 192, out: "public/icon-192.png" },
  { size: 512, out: "public/icon-512.png" },
  { size: 180, out: "public/apple-touch-icon.png" },
];

for (const { size, out } of targets) {
  const buf = await sharp(Buffer.from(svg(size))).resize(size, size).png().toBuffer();
  writeFileSync(out, buf);
  console.log("wrote", out, buf.length, "bytes");
}
