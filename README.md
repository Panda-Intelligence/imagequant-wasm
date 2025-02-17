# @panda-ai/imagequant

[![License: GPL v3](https://img.shields.io/badge/License-MIT-blue.svg)](https://www.gnu.org/licenses/mit)

High-performance WebAssembly port of imagequant (libimagequant) for color quantization in browsers. Achieves 2-4x faster processing compared to JS implementations.

## Features

- 🔥 WASM accelerated color quantization
- 🎨 Alpha transparency support
- 📦 80kb gzipped WASM bundle
- 🚀 Zero-copy memory operations
- 📱 Web Worker compatible

## Installation

### npm
```bash
bun install @panda-ai/imagequant
```

## Quick Start

```javascript
  import WasmImageQuant, { PNGEncoder } from '@panda-ai/imagequant'

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

```

## API

### quantize(pixels: Uint8Array, width: number, height: number, options): QuantResult

| Option      | Default | Description                     |
|-------------|---------|---------------------------------|
| maxColors   | 256     | Maximum palette size (2-256)    |
| speed       | 6       | Speed/quality tradeoff (1-10)   |

Returns:
```typescript
interface QuantResult {
  palette: Uint8Array  // RGBA palette (maxColors × 4 bytes)
  indices: Uint8Array  // Pixel indices (width × height bytes)
}
```

## Performance Benchmarks

| Image Size | Colors | WASM Time | JS Time |
|------------|--------|-----------|---------|
| 512x512    | 128    | 68ms      | 220ms   |
| 1024x768   | 256    | 145ms     | 520ms   |
| 4096x2160  | 256    | 890ms     | 3200ms  |

Tested on Chrome 118, M1 MacBook Pro

## Browser Support

| Browser       | Minimum Version |
|---------------|-----------------|
| Chrome        | 57+             |
| Firefox       | 53+             |
| Safari        | 14.1+           |
| Edge          | 79+             |

## Advanced Usage

### Web Worker Processing
TBD

### Canvas Integration
TBD

## Limitations
TBD

## Building from Source

1. Install Rust toolchain
2. Install wasm-pack
```bash
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
```
3. Build package
```bash
wasm-pack build --target web
```

## License

MIT © Panda Intelligence. Commercial licenses available.
