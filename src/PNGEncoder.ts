import pako from 'pako';
import * as CRC32 from 'crc-32';
import { concatBuffers } from './utils';

export class PNGEncoder {
  static encode(palette: Uint8Array, indices: Uint8Array, width: number, height: number) {
    // validate
    if (palette.length % 4 !== 0) {
      throw new Error(`'palette' should be in RGBA format ('length' is 4 times)!`);
    }
    if (indices.length !== width * height) {
      throw new Error(`'indices' mismatch with 'width*height'!`);
    }

    // prepare PNG chunks
    const chunks = [
      this.#createIHDR(width, height, palette.length / 4),
      this.#createPLTE(palette),
      this.#createtRNS(palette),
      this.#createIDAT(indices, width, height),
      this.#createIEND()
    ];

    // merge all chunks
    const pngData = concatBuffers([
      new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
      ...chunks.filter(c => !!c)
    ])

    return pngData.buffer;
  }

  // create `IHDR` chunk (Image header)
  static #createIHDR(width: number, height: number, colorCount: number) {
    const data = new Uint8Array(13);
    const view = new DataView(data.buffer);

    view.setUint32(0, width, false);   // big-endian
    view.setUint32(4, height, false);
    data[8] = colorCount <= 16 ? 4 : 8; // bit depth
    data[9] = 3;    // color type: index
    data[10] = 0;   // compress: deflate
    data[11] = 0;   // filter: none
    data[12] = 0;   // Non-interlaced

    return this.#buildChunk('IHDR', data);
  }

  // `PLTE` chunk（Palette）
  static #createPLTE(palette: Uint8Array) {
    const rgbData = new Uint8Array(palette.length / 4 * 3);
    for (let i = 0; i < palette.length; i += 4) {
      rgbData[i / 4 * 3] = palette[i];
      rgbData[i / 4 * 3 + 1] = palette[i + 1];
      rgbData[i / 4 * 3 + 2] = palette[i + 2];
    }
    return this.#buildChunk('PLTE', rgbData);
  }

  // `tRNS`（Alpha）
  static #createtRNS(palette: Uint8Array) {
    const alphas = new Uint8Array(palette.length / 4);
    let hasAlpha = false;

    for (let i = 3; i < palette.length; i += 4) {
      alphas[i / 4] = palette[i];
      if (palette[i] !== 255) hasAlpha = true;
    }

    return hasAlpha ? this.#buildChunk('tRNS', alphas) : null;
  }

  // `IDAT` （Image Data）
  static #createIDAT(indices: Uint8Array, width: number, height: number) {
    // Add filter bytes（Append 0x00 each line）
    const filtered = new Uint8Array(indices.length + height);
    for (let y = 0; y < height; y++) {
      filtered[y * (width + 1)] = 0; // 过滤类型：无
      filtered.set(
        indices.subarray(y * width, (y + 1) * width),
        y * (width + 1) + 1
      );
    }

    // use `pako` for zlib compress
    const compressed = pako.deflate(filtered, { level: 9, memLevel: 9 });
    return this.#buildChunk('IDAT', compressed);
  }

  // `IEND`（end chunk）
  static #createIEND() {
    return this.#buildChunk('IEND', new Uint8Array());
  }

  static #buildChunk(type: string, data: Uint8Array) {
    const chunk = new Uint8Array(data.length + 12);
    const view = new DataView(chunk.buffer);

    // set length（4bytes big-endian）
    view.setUint32(0, data.length, false);

    // chunk type
    chunk.set([...type].map(c => c.charCodeAt(0)), 4);

    // fill data
    chunk.set(data, 8);

    // calculate CRC（type+data）
    const crcData = new Uint8Array([...chunk.subarray(4, 8 + data.length)]);
    const crc = CRC32.buf(crcData);
    view.setUint32(8 + data.length, crc >>> 0, false); // force convert to unsigned number
    return chunk;
  }
}
