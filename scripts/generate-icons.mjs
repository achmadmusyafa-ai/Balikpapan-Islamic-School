import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createPNG(width, height, r, g, b) {
  // A clean minimal raw RGBA PNG writer
  const rowBytes = width * 4 + 1; // filter byte
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // create a nice gradient
      const factor = (x + y) / (width + height);
      rawData[pixelOffset] = Math.min(255, Math.floor(r * (1 - factor * 0.3) + 79 * factor));     // R
      rawData[pixelOffset + 1] = Math.min(255, Math.floor(g * (1 - factor * 0.3) + 70 * factor)); // G
      rawData[pixelOffset + 2] = Math.min(255, Math.floor(b * (1 - factor * 0.3) + 229 * factor)); // B
      rawData[pixelOffset + 3] = 255; // A
    }
  }

  const deflated = zlib.deflateSync(rawData);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // Color type 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const chunks = [
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat(chunks);
}

const pubDir = path.resolve('public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPNG(192, 192, 99, 102, 241));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPNG(512, 512, 79, 70, 229));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 67, 56, 202));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPNG(180, 180, 99, 102, 241));
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), createPNG(32, 32, 99, 102, 241));

console.log('PNG icons created successfully.');
