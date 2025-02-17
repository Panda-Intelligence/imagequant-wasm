use imagequant::{Attributes, RGBA};
use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct QuantResult {
    palette: Vec<u8>,
    indices: Vec<u8>,
}

#[wasm_bindgen]
impl QuantResult {
    pub fn palette_ptr(&self) -> *const u8 {
        self.palette.as_ptr()
    }

    pub fn indices_ptr(&self) -> *const u8 {
        self.indices.as_ptr()
    }

    pub fn palette_len(&self) -> usize {
        self.palette.len()
    }

    pub fn indices_len(&self) -> usize {
        self.indices.len()
    }
}

#[wasm_bindgen]
pub fn quantize_image(
    pixels: &[u8],
    width: u32,
    height: u32,
    max_colors: u32,
) -> Result<JsValue, JsError> {
    let mut attr = Attributes::new();
    attr.set_max_colors(max_colors)?;
    attr.set_quality(70, 100)?;

    // Configure the library
    let mut liq = imagequant::new();
    liq.set_speed(5).unwrap();
    liq.set_quality(70, 99).unwrap();

    // Describe the bitmap
    let rgba_pixels: Vec<RGBA> = pixels
        .chunks(4)
        .map(|p| RGBA::new(p[0], p[1], p[2], p[3]))
        .collect();

    let mut img = liq
        .new_image(rgba_pixels.as_slice(), width as usize, height as usize, 0.0)
        .unwrap();

    // The magic happens in quantize()
    let mut res = match liq.quantize(&mut img) {
        Ok(res) => res,
        Err(err) => panic!("Quantization failed, because: {err:?}"),
    };

    // Enable dithering for subsequent remappings
    res.set_dithering_level(1.0).unwrap();

    // You can reuse the result to generate several images with the same palette
    let (palette, pixels) = res.remapped(&mut img).unwrap();
    // Should simply be:
    let indices = pixels;

    println!(
        "Done! Got palette {palette:?} and {} pixels with {}% quality",
        indices.len(),
        res.quantization_quality().unwrap()
    );

    // let mut image = Image::new(attr, width as usize, height as usize, pixels)?;

    // let mut res = image.quantize()?;
    // let (palette, indices) = res.remapped(&mut image)?;

    // With flattened palette:
    let flat_palette: Vec<u8> = palette
        .iter()
        .flat_map(|rgba| [rgba.r, rgba.g, rgba.b, rgba.a])
        .collect();

    let result = js_sys::Object::new();
    let _ = js_sys::Reflect::set(
        &result,
        &"palette".into(),
        &Uint8Array::from(&flat_palette[..]).into(),
    );
    let _ = js_sys::Reflect::set(
        &result,
        &"indices".into(),
        &Uint8Array::from(&indices[..]).into(),
    );

    Ok(result.into())
}
