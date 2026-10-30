import { blit, clearBackground, createRaster, extractTile, halve, readBmp8, type Raster } from './raster.ts'

// An uncompressed 8-bit BMP with the given palette (RGB) and rows of palette
// indexes listed top to bottom, stored bottom-up like real files.
function bmp8(palette: [number, number, number][], rows: number[][]): Uint8Array {
  const width = rows[0].length
  const stride = Math.ceil(width / 4) * 4
  const pixelOffset = 14 + 40 + palette.length * 4
  const bytes = new Uint8Array(pixelOffset + stride * rows.length)
  const view = new DataView(bytes.buffer)
  view.setUint16(0, 0x4d42, true)
  view.setUint32(10, pixelOffset, true)
  view.setUint32(14, 40, true)
  view.setInt32(18, width, true)
  view.setInt32(22, rows.length, true)
  view.setUint16(28, 8, true)
  view.setUint32(46, palette.length, true)
  palette.forEach(([r, g, b], i) => bytes.set([b, g, r, 0], 54 + i * 4))
  rows.forEach((row, y) => bytes.set(row, pixelOffset + (rows.length - 1 - y) * stride))
  return bytes
}

const pixel = (r: Raster, x: number, y: number) => [...r.data.subarray((y * r.width + x) * 4, (y * r.width + x) * 4 + 4)]

const GRAY = [122, 122, 122] as const
const GREEN = [0, 200, 0] as const

describe('readBmp8', () => {
  it('decodes palettized bottom-up rows into top-down RGBA', () => {
    const raster = readBmp8(bmp8([[255, 0, 0], [0, 0, 255]], [[0, 1, 1], [1, 0, 0]]))
    expect(raster).toMatchObject({ width: 3, height: 2 })
    expect(pixel(raster, 0, 0)).toEqual([255, 0, 0, 255])
    expect(pixel(raster, 1, 0)).toEqual([0, 0, 255, 255])
    expect(pixel(raster, 0, 1)).toEqual([0, 0, 255, 255])
  })

  it('rejects other formats', () => {
    expect(() => readBmp8(new Uint8Array(64))).toThrow('Not a BMP')
  })
})

describe('clearBackground', () => {
  it('clears the background reachable from the border, not the same color inside', () => {
    const raster = readBmp8(
      bmp8(
        [[...GRAY], [...GREEN]],
        [
          [0, 0, 0, 0, 0],
          [0, 1, 1, 1, 0],
          [0, 1, 0, 1, 0],
          [0, 1, 1, 1, 0],
          [0, 0, 0, 0, 0],
        ],
      ),
    )
    clearBackground(raster, GRAY)
    expect(pixel(raster, 0, 0)[3]).toBe(0)
    expect(pixel(raster, 1, 1)[3]).toBe(255)
    // Enclosed by green: kept.
    expect(pixel(raster, 2, 2)).toEqual([...GRAY, 255])
  })
})

describe('blit / halve / extractTile', () => {
  it('composes, downsamples with alpha weighting, and skips empty tiles', () => {
    const canvas = createRaster(4, 4)
    const square = createRaster(2, 2)
    square.data.fill(255)
    blit(canvas, square, 2, 0)

    const half = halve(canvas)
    expect(half).toMatchObject({ width: 2, height: 2 })
    expect(pixel(half, 1, 0)).toEqual([255, 255, 255, 255])
    expect(pixel(half, 0, 0)[3]).toBe(0)

    expect(extractTile(canvas, 0, 0, 2)).toBeNull()
    expect(pixel(extractTile(canvas, 1, 0, 2)!, 0, 0)).toEqual([255, 255, 255, 255])
  })
})
