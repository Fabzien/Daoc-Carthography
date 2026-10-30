// Builds map tiles for the regions of src/data/regions.ts that list `drawnZones`
// or a `plan`, from the maps of DAoC Cartographe 2.52 (freeware by Tixu, 2006).
//
//   npm run import-cartographe                   # zone positions from the latest db-public release
//   npm run import-cartographe -- --release 85
//
// The original download link is dead; the archive comes from the Wayback
// Machine and is cached in .cache/daoc-cartographe/. Each zone map is placed at
// its DOL zone offset, so the tiles share the coordinates of the DOL data;
// floor plans are used whole (their calibration is in regions.ts).
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { unzipSync } from 'fflate'
import { PNG } from 'pngjs'
import { REGIONS, type Region } from '../src/data/regions.ts'
import { blit, clearBackground, createRaster, extractTile, halve, readBmp8, type Raster } from './cartographe/raster.ts'
import { downloadTables, latestRelease, ROOT } from './dol/dbPublic.ts'
import type { DolZone } from './dol/transform.ts'

const ARCHIVE_URL = 'https://web.archive.org/web/20060504191756id_/http://camelot.jeuxonline.info:80/admin/daocfull252.zip'
const ARCHIVE_SHA256 = '2ee3df68f71243c779ef97cfac36066b8336df6fcd640187d703e9925c647333'
const ARCHIVE_PATH = path.join(ROOT, '.cache', 'daoc-cartographe', 'daocfull252.zip')
// Background of the zone maps, around the drawn terrain.
const BACKGROUND = [122, 122, 122] as const
const ZONE_UNIT_TO_MAP = 4
const TILE = 256

async function loadArchive(): Promise<Uint8Array> {
  if (!existsSync(ARCHIVE_PATH)) {
    console.log('Downloading DAoC Cartographe 2.52 from the Wayback Machine...')
    const response = await fetch(ARCHIVE_URL)
    if (!response.ok) throw new Error(`${ARCHIVE_URL}: HTTP ${response.status}`)
    await mkdir(path.dirname(ARCHIVE_PATH), { recursive: true })
    await writeFile(ARCHIVE_PATH, Buffer.from(await response.arrayBuffer()))
  }
  const archive = await readFile(ARCHIVE_PATH)
  const hash = createHash('sha256').update(archive).digest('hex')
  if (hash !== ARCHIVE_SHA256) throw new Error(`Unexpected archive content (sha256 ${hash}); delete ${ARCHIVE_PATH} to download it again`)
  return archive
}

// Zone maps by file stem, lowercased: "73", "0b", "d_alb_01"...
function readMaps(archive: Uint8Array): Map<string, Uint8Array> {
  const files = unzipSync(archive, { filter: (f) => /\/maps\/[^/]+\.bmp$/i.test(f.name) })
  return new Map(Object.entries(files).map(([name, bytes]) => [path.basename(name, path.extname(name)).toLowerCase(), bytes]))
}

// Assembles the region's drawn zones at their DOL offsets, at its native zoom.
function assemble(region: Region, zones: DolZone[], maps: Map<string, Uint8Array>): Raster {
  const dol = region.dol!
  const pixelsPerUnit = 2 ** region.maxNativeZoom
  const placed = region.drawnZones!.map((name) => {
    const zone = zones.find((z) => z.RegionID === dol.region && z.Name === name)
    if (!zone) throw new Error(`${region.name}: no DOL zone named ${name}`)
    // Some files carry a "b" suffix (revised maps).
    const bmp = maps.get(String(zone.ZoneID)) ?? maps.get(`${zone.ZoneID}b`)
    if (!bmp) throw new Error(`${region.name}: no map for zone ${zone.ZoneID} (${name})`)
    const image = readBmp8(bmp)
    const expected = zone.Width * ZONE_UNIT_TO_MAP * pixelsPerUnit
    if (image.width !== expected) throw new Error(`${region.name}: ${name} map is ${image.width}px, expected ${expected}px at zoom ${region.maxNativeZoom}`)
    clearBackground(image, BACKGROUND)
    const x = (zone.OffsetX * ZONE_UNIT_TO_MAP + dol.offset[0]) * pixelsPerUnit
    const y = (zone.OffsetY * ZONE_UNIT_TO_MAP + dol.offset[1]) * pixelsPerUnit
    if (x < 0 || y < 0) throw new Error(`${region.name}: ${name} lies left of or above the map origin`)
    return { image, x, y }
  })
  const roundUp = (v: number) => Math.ceil(v / TILE) * TILE
  const canvas = createRaster(roundUp(Math.max(...placed.map((p) => p.x + p.image.width))), roundUp(Math.max(...placed.map((p) => p.y + p.image.height))))
  for (const { image, x, y } of placed) blit(canvas, image, x, y)
  return canvas
}

// A floor plan is the whole map: one image, 256 map units wide at its native zoom.
function readPlan(region: Region, maps: Map<string, Uint8Array>): Raster {
  const bmp = maps.get(region.plan!.toLowerCase())
  if (!bmp) throw new Error(`${region.name}: no plan named ${region.plan}`)
  const image = readBmp8(bmp)
  const expected = TILE * 2 ** region.maxNativeZoom
  if (image.width !== expected || image.height !== expected) throw new Error(`${region.name}: plan is ${image.width}x${image.height}px, expected ${expected}px`)
  // Plans use different background grays: take the corner pixel's.
  clearBackground(image, [image.data[0], image.data[1], image.data[2]])
  return image
}

async function writeTiles(region: Region, canvas: Raster): Promise<number> {
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

async function main() {
  const { values } = parseArgs({ options: { release: { type: 'string' } } })
  const maps = readMaps(await loadArchive())
  const release = values.release ?? (await latestRelease())
  const dir = await downloadTables(release, (name) => name === 'Zones.json')
  const zones: DolZone[] = JSON.parse(await readFile(path.join(dir, 'Zones.json'), 'utf8'))

  // Regions sharing tiles (the three Atlantis) are built once.
  const built = new Set<string>()
  for (const region of REGIONS) {
    if (!(region.drawnZones || region.plan) || built.has(region.tiles)) continue
    built.add(region.tiles)
    const count = await writeTiles(region, region.plan ? readPlan(region, maps) : assemble(region, zones, maps))
    console.log(`${region.tiles.padEnd(60)} ${count} tiles`)
  }
}

await main()
