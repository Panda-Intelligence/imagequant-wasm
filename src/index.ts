import init, { quantize_image } from "../pkg/imagequant_wasm.js";
import { PNGEncoder } from './PNGEncoder.js'

export type QuantResult = {
  palette: Uint8Array
  indices: Uint8Array
}

export type ImageDataLike = {
  data: Uint8ClampedArray
  width: number
  height: number
}

class WasmImageQuant {
  static async create() {
    await init();
    return new WasmImageQuant();
  }

  quantize(imageData: ImageDataLike, maxColors = 256): QuantResult {
    const { data, width, height } = imageData;

    // @ts-ignore
    const result = quantize_image(data, width, height, maxColors);
    return result;
  }
}

export { PNGEncoder }

export default WasmImageQuant;
