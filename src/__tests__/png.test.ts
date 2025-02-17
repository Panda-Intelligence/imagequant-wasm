import { describe, it } from "bun:test";
import WasmImageQuant from "../index";
import { PNGEncoder } from "../PNGEncoder";
import { readBufferToImageData } from "../utils";
import path from "path";

describe('Test PNG compress', () => {
  it('should compress png file', async () => {
    const iq = await WasmImageQuant.create();
    const filePath = path.resolve(__dirname, './boat.png')
    const file = Bun.file(filePath);
    const arrayBuffer = await file.arrayBuffer();
    const imageData = await readBufferToImageData(arrayBuffer);

    const { palette, indices } = iq.quantize(imageData);

    // Generate PNG
    const pngData = PNGEncoder.encode(
      palette,
      indices,
      imageData.width,
      imageData.height,
    );

    const blob = new Blob([pngData], { type: 'image/png' });
    const outpath = path.resolve(__dirname, './output.png')
    await Bun.write(outpath, blob);
  })
})