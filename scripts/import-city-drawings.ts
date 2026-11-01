// Draws capitals missing from the classic maps' tiles (`drawnCities` in
// src/data/regions.ts), from the game's zone maps as published by
// https://camelotinsider.github.io (zones library). Each zone map covers its
// whole zone, so it fills the city's zone square exactly.
//
//   npm run import-city-drawings
//
// Downloads are cached in .cache/camelotinsider/. Camelot and Tir na Nog are
// already drawn on the original Albion and Hibernia tiles.
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import jpeg from 'jpeg-js'
import { PNG } from 'pngjs'
import { REGIONS } from '../src/data/regions.ts'
import { createRaster, drawScaled, type Raster } from './cartographe/raster.ts'
import { ROOT } from './dol/dbPublic.ts'

// DOL region of the capital -> its zone map on camelotinsider.github.io.
const DRAWINGS: Record<number, string> = {
  101: 'https://camelotinsider.github.io/assets/zones/zone120.jpg', // Jordheim
}
const TILE = 256
const ZONE_MAP_UNITS = 32

async function loadZoneMap(url: string): Promise<Raster> {
  const cached = path.join(ROOT, '.cache', 'camelotinsider', path.basename(url))
  if (!existsSync(cached)) {
    console.log(`Downloading ${url}...`)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
    await mkdir(path.dirname(cached), { recursive: true })
    await writeFile(cached, Buffer.from(await response.arrayBuffer()))
  }
  const { width, height, data } = jpeg.decode(await readFile(cached), { useTArray: true })
  return { width, height, data }
}

async function readTile(file: string): Promise<Raster> {
  if (!existsSync(file)) return createRaster(TILE, TILE)
  const png = PNG.sync.read(await readFile(file))
  return { width: png.width, height: png.height, data: new Uint8Array(png.data) }
}

async function main() {
  for (const region of REGIONS) {
    for (const city of region.drawnCities ?? []) {
      const url = DRAWINGS[city.region]
      if (!url) continue
      const zoneMap = await loadZoneMap(url)
      const dir = path.join(ROOT, 'public', region.tiles.replace('/{z}/{x}/{y}.png', ''))
      // Top-left corner of the city's square in map units (lat is negative downwards).
      const [[top, left]] = city.bounds
      let count = 0
      for (let zoom = 0; zoom <= region.maxNativeZoom; zoom++) {
        const scale = 2 ** zoom
        const x = left * scale
        const y = -top * scale
        const size = ZONE_MAP_UNITS * scale
        for (let tx = Math.floor(x / TILE); tx * TILE < x + size; tx++) {
          for (let ty = Math.floor(y / TILE); ty * TILE < y + size; ty++) {
            const file = path.join(dir, String(zoom), String(tx), `${ty}.png`)
            const tile = await readTile(file)
            drawScaled(tile, zoneMap, x - tx * TILE, y - ty * TILE, size, size)
            const png = new PNG({ width: tile.width, height: tile.height })
            png.data = Buffer.from(tile.data)
            await mkdir(path.dirname(file), { recursive: true })
            await writeFile(file, PNG.sync.write(png))
            count++
          }
        }
      }
      console.log(`${region.name}: drew region ${city.region} (${count} tiles)`)
    }
  }
}

await main()
