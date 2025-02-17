import { type ImageDataLike } from './index';
import { PNG } from 'pngjs';

export function concatBuffers(buffers: Uint8Array[]) {
  let totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
  let result = new Uint8Array(totalLength);
  let offset = 0;
  for (let buf of buffers) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

export async function readBufferToImageData(fileBuffer: ArrayBuffer): Promise<ImageDataLike> {
  const buffer = Buffer.from(fileBuffer)
  const decoded = PNG.sync.read(buffer)
  return {
    data: new Uint8ClampedArray(decoded.data),
    width: decoded.width,
    height: decoded.height
  };
}
