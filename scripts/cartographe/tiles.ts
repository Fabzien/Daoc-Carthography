import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PNG } from 'pngjs'
import type { Region } from '../../src/data/regions.ts'
import { ROOT } from '../dol/dbPublic.ts'
import { extractTile, halve, type Raster } from './raster.ts'

const TILE = 256

// Replaces a region's tile folder with tiles of `canvas` (at the region's native
// zoom) for every zoom down to 0, skipping fully transparent tiles.
export async function writeTiles(region: Region, canvas: Raster): Promise<number> {
  const dir = path.join(ROOT, 'public', region.tiles.replace('/{z}/{x}/{y}.png', ''))
  await rm(dir, { recursive: true, force: true })
  let count = 0
  for (let zoom = region.maxNativeZoom; zoom >= 0; zoom--) {
    for (let tx = 0; tx * TILE < canvas.width; tx++) {
      for (let ty = 0; ty * TILE < canvas.height; ty++) {
        const tile = extractTile(canvas, tx, ty, TILE)
        if (!tile) continue
        await mkdir(path.join(dir, String(zoom), String(tx)), { recursive: true })
        const png = new PNG({ width: tile.width, height: tile.height })
        png.data = Buffer.from(tile.data)
        await writeFile(path.join(dir, String(zoom), String(tx), `${ty}.png`), PNG.sync.write(png))
        count++
      }
    }
    canvas = halve(canvas)
  }
  return count
}
