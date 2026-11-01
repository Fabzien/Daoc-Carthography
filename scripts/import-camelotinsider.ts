// Builds map tiles from the game's zone maps as published by Camelot Insider
// (https://camelotinsider.github.io, zones library):
// - dungeon maps: regions of src/data/regions.ts with a `zoneMap`, each image
//   resampled to the region's native zoom and cut into its own tiles;
// - capitals missing from the classic maps' tiles (`drawnCities`): the zone
//   map is drawn into the host map's existing tiles, filling the city's square.
//
//   npm run import-camelotinsider
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
import { writeTiles } from './cartographe/tiles.ts'
import { ROOT } from './dol/dbPublic.ts'

const BASE_URL = 'https://camelotinsider.github.io/assets/zones'
// DOL region of a capital missing from the classic maps -> its zone map.
const CITY_ZONE_MAPS: Record<number, string> = {
  101: 'zone120', // Jordheim
}
const TILE = 256
const ZONE_MAP_UNITS = 32

async function loadZoneMap(zone: string): Promise<Raster> {
  const cached = path.join(ROOT, '.cache', 'camelotinsider', `${zone}.jpg`)
  if (!existsSync(cached)) {
    const url = `${BASE_URL}/${zone}.jpg`
    console.log(`Downloading ${url}...`)
    const response = await fetch(url)
    // GitHub Pages answers missing files with an HTML page.
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`${url}: HTTP ${response.status}, no image`)
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

// Draws a capital's zone map into the host map's tiles, inside its square.
async function drawCity(host: (typeof REGIONS)[number], bounds: readonly [readonly [number, number], readonly [number, number]], zoneMap: Raster): Promise<number> {
  const dir = path.join(ROOT, 'public', host.tiles.replace('/{z}/{x}/{y}.png', ''))
  // Top-left corner of the city's square in map units (lat is negative downwards).
  const [[top, left]] = bounds
  let count = 0
  for (let zoom = 0; zoom <= host.maxNativeZoom; zoom++) {
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
  return count
}

async function main() {
  for (const region of REGIONS) {
    if (region.zoneMap) {
      // The whole map: 256 map units at the region's native zoom.
      const size = TILE * 2 ** region.maxNativeZoom
      const canvas = createRaster(size, size)
      drawScaled(canvas, await loadZoneMap(region.zoneMap), 0, 0, size, size)
      console.log(`${region.name.padEnd(26)} ${region.zoneMap}: ${await writeTiles(region, canvas)} tiles`)
    }
    for (const city of region.drawnCities ?? []) {
      const zone = CITY_ZONE_MAPS[city.region]
      if (!zone) continue
      console.log(`${region.name.padEnd(26)} ${zone} drawn: ${await drawCity(region, city.bounds, await loadZoneMap(zone))} tiles`)
    }
  }
}

await main()
