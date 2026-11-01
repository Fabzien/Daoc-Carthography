// Minimal RGBA raster operations to turn DAoC Cartographe zone maps into map tiles.

export interface Raster {
  width: number
  height: number
  // RGBA, row by row from the top.
  data: Uint8Array
}

export type Rgb = readonly [number, number, number]

export function createRaster(width: number, height: number): Raster {
  return { width, height, data: new Uint8Array(width * height * 4) }
}

// Decodes an uncompressed 8-bit palettized BMP, the format of every DAoC Cartographe map.
export function readBmp8(bytes: Uint8Array): Raster {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (view.getUint16(0, true) !== 0x4d42) throw new Error('Not a BMP file')
  const pixelOffset = view.getUint32(10, true)
  const headerSize = view.getUint32(14, true)
  const width = view.getInt32(18, true)
  const rawHeight = view.getInt32(22, true)
  const bitsPerPixel = view.getUint16(28, true)
  const compression = view.getUint32(30, true)
  if (bitsPerPixel !== 8 || compression !== 0) throw new Error(`Unsupported BMP: ${bitsPerPixel} bpp, compression ${compression}`)
  const colors = view.getUint32(46, true) || 256
  const palette = 14 + headerSize
  // A positive height means rows are stored bottom-up.
  const height = Math.abs(rawHeight)
  const stride = Math.ceil(width / 4) * 4
  const raster = createRaster(width, height)
  for (let y = 0; y < height; y++) {
    const row = pixelOffset + (rawHeight > 0 ? height - 1 - y : y) * stride
    for (let x = 0; x < width; x++) {
      const index = bytes[row + x]
      if (index >= colors) throw new Error(`Palette index ${index} out of range`)
      const entry = palette + index * 4 // BGRA
      const out = (y * width + x) * 4
      raster.data[out] = bytes[entry + 2]
      raster.data[out + 1] = bytes[entry + 1]
      raster.data[out + 2] = bytes[entry]
      raster.data[out + 3] = 255
    }
  }
  return raster
}

// Makes the background transparent: pixels of exactly `color` reachable from
// the image border. The same color inside the drawn area is kept.
export function clearBackground(raster: Raster, color: Rgb): void {
  const { width, height, data } = raster
  const matches = (i: number) => data[i * 4 + 3] !== 0 && data[i * 4] === color[0] && data[i * 4 + 1] === color[1] && data[i * 4 + 2] === color[2]
  const stack: number[] = []
  for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x)
  for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1)
  while (stack.length > 0) {
    const i = stack.pop()!
    if (!matches(i)) continue
    data[i * 4 + 3] = 0
    const x = i % width
    if (x > 0) stack.push(i - 1)
    if (x < width - 1) stack.push(i + 1)
    if (i >= width) stack.push(i - width)
    if (i < (height - 1) * width) stack.push(i + width)
  }
}

// Copies `src` onto `dst` at (x, y), keeping `dst` where `src` is transparent.
export function blit(dst: Raster, src: Raster, x: number, y: number): void {
  for (let sy = 0; sy < src.height; sy++) {
    const dy = y + sy
    if (dy < 0 || dy >= dst.height) continue
    for (let sx = 0; sx < src.width; sx++) {
      const dx = x + sx
      const from = (sy * src.width + sx) * 4
      if (dx < 0 || dx >= dst.width || src.data[from + 3] === 0) continue
      dst.data.set(src.data.subarray(from, from + 4), (dy * dst.width + dx) * 4)
    }
  }
}

// Half-size raster for the next zoom level down: each pixel averages a 2x2
// block, weighted by alpha so transparent pixels don't darken the edges.
export function halve(raster: Raster): Raster {
  const out = createRaster(Math.ceil(raster.width / 2), Math.ceil(raster.height / 2))
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const sx = x * 2 + dx
        const sy = y * 2 + dy
        if (sx >= raster.width || sy >= raster.height) continue
        const i = (sy * raster.width + sx) * 4
        const alpha = raster.data[i + 3]
        r += raster.data[i] * alpha
        g += raster.data[i + 1] * alpha
        b += raster.data[i + 2] * alpha
        a += alpha
      }
      if (a === 0) continue
      const o = (y * out.width + x) * 4
      out.data[o] = Math.round(r / a)
      out.data[o + 1] = Math.round(g / a)
      out.data[o + 2] = Math.round(b / a)
      out.data[o + 3] = Math.round(a / 4)
    }
  }
  return out
}

// The size x size tile at tile coordinates (tx, ty), or null when it is fully transparent.
export function extractTile(raster: Raster, tx: number, ty: number, size = 256): Raster | null {
  const tile = createRaster(size, size)
  let empty = true
  for (let y = 0; y < size; y++) {
    const sy = ty * size + y
    if (sy >= raster.height) break
    const start = (sy * raster.width + tx * size) * 4
    const end = Math.min(start + size * 4, (sy + 1) * raster.width * 4)
    if (start >= end) continue
    const row = raster.data.subarray(start, end)
    tile.data.set(row, y * size * 4)
    if (empty) for (let i = 3; i < row.length; i += 4) if (row[i] !== 0) empty = false
  }
  return empty ? null : tile
}

// Draws `src` scaled into the rectangle (x, y, width, height) of `dst`, given in
// `dst` pixels and possibly fractional; pixels outside `dst` are skipped. Each
// destination pixel averages the source area it covers when shrinking, and
// interpolates bilinearly when enlarging. The result is opaque.
export function drawScaled(dst: Raster, src: Raster, x: number, y: number, width: number, height: number): void {
  const sx = src.width / width
  const sy = src.height / height
  // Summed-area table of the source, for constant-time box averages.
  const w = src.width + 1
  const sums = new Float64Array(w * (src.height + 1) * 3)
  for (let row = 1; row <= src.height; row++) {
    for (let col = 1; col <= src.width; col++) {
      const s = ((row - 1) * src.width + (col - 1)) * 4
      for (let c = 0; c < 3; c++) {
        sums[(row * w + col) * 3 + c] = src.data[s + c] + sums[((row - 1) * w + col) * 3 + c] + sums[(row * w + col - 1) * 3 + c] - sums[((row - 1) * w + col - 1) * 3 + c]
      }
    }
  }
  const box = (u0: number, v0: number, u1: number, v1: number, c: number) => {
    const area = (u1 - u0) * (v1 - v0)
    return (sums[(v1 * w + u1) * 3 + c] - sums[(v0 * w + u1) * 3 + c] - sums[(v1 * w + u0) * 3 + c] + sums[(v0 * w + u0) * 3 + c]) / area
  }
  const at = (u: number, v: number, c: number) => src.data[(v * src.width + u) * 4 + c]

  for (let dy = Math.max(0, Math.floor(y)); dy < Math.min(dst.height, Math.ceil(y + height)); dy++) {
    for (let dx = Math.max(0, Math.floor(x)); dx < Math.min(dst.width, Math.ceil(x + width)); dx++) {
      // Source footprint of this destination pixel.
      const u0 = (dx - x) * sx
      const v0 = (dy - y) * sy
      const o = (dy * dst.width + dx) * 4
      for (let c = 0; c < 3; c++) {
        if (sx > 1 || sy > 1) {
          const ua = Math.max(0, Math.floor(u0))
          const va = Math.max(0, Math.floor(v0))
          const ub = Math.min(src.width, Math.max(ua + 1, Math.round(u0 + sx)))
          const vb = Math.min(src.height, Math.max(va + 1, Math.round(v0 + sy)))
          dst.data[o + c] = Math.round(box(ua, va, ub, vb, c))
        } else {
          const u = Math.min(src.width - 1, Math.max(0, u0 + sx / 2 - 0.5))
          const v = Math.min(src.height - 1, Math.max(0, v0 + sy / 2 - 0.5))
          const ua = Math.floor(u), va = Math.floor(v)
          const ub = Math.min(src.width - 1, ua + 1), vb = Math.min(src.height - 1, va + 1)
          const fu = u - ua, fv = v - va
          const top = at(ua, va, c) * (1 - fu) + at(ub, va, c) * fu
          const bottom = at(ua, vb, c) * (1 - fu) + at(ub, vb, c) * fu
          dst.data[o + c] = Math.round(top * (1 - fv) + bottom * fv)
        }
      }
      dst.data[o + 3] = 255
    }
  }
}
