// Generates public/data/<region>.json from the Dawn of Light public database
// (https://github.com/Eve-of-Darkness/db-public, MIT).
//
//   npm run import-dol                     # latest db-public release
//   npm run import-dol -- --release 85     # a given release
//   npm run import-dol -- --data <dir>     # a local folder of db-public JSON tables
//
// Downloads are cached in .cache/db-public/<release>/.
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { REGIONS } from '../src/data/regions.ts'
import { buildRegionData, type DolTables } from './dol/transform.ts'

const REPO = 'Eve-of-Darkness/db-public'
const ROOT = path.resolve(import.meta.dirname, '..')
const OUT_DIR = path.join(ROOT, 'public', 'data')
const TABLES = ['NpcTemplate', 'Zones', 'PathPoints', 'ZonePoint', 'Regions', 'BindPoint']

async function github<T>(url: string): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const response = await fetch(`https://api.github.com/repos/${REPO}/${url}`, { headers })
  if (!response.ok) throw new Error(`GitHub API ${url}: HTTP ${response.status}`)
  return response.json() as Promise<T>
}

// Downloads the needed tables of a release into the cache and returns its folder.
async function download(release: string): Promise<string> {
  const dir = path.join(ROOT, '.cache', 'db-public', release)
  await mkdir(dir, { recursive: true })
  const listing = await github<{ name: string }[]>(`contents/data?ref=${release}`)
  // The Mob table is split into Mob.0.json, Mob.1.json, ...
  const files = listing.map((f) => f.name).filter((name) => /^Mob\.\d+\.json$/.test(name) || TABLES.includes(name.replace(/\.json$/, '')))
  for (const file of files) {
    const target = path.join(dir, file)
    if (existsSync(target)) continue
    console.log(`Downloading ${file}...`)
    const response = await fetch(`https://raw.githubusercontent.com/${REPO}/${release}/data/${file}`)
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
    await writeFile(target, Buffer.from(await response.arrayBuffer()))
  }
  return dir
}

async function readTables(dir: string): Promise<DolTables> {
  const read = async (file: string) => JSON.parse(await readFile(path.join(dir, file), 'utf8'))
  const mobFiles = (await readdir(dir)).filter((name) => /^Mob\.\d+\.json$/.test(name))
  if (mobFiles.length === 0) throw new Error(`No Mob.<n>.json file in ${dir}`)
  return {
    mobs: (await Promise.all(mobFiles.map(read))).flat(),
    templates: await read('NpcTemplate.json'),
    zones: await read('Zones.json'),
    pathPoints: await read('PathPoints.json'),
    zonePoints: await read('ZonePoint.json'),
    regions: await read('Regions.json'),
    bindPoints: await read('BindPoint.json'),
  }
}

async function main() {
  const { values } = parseArgs({ options: { release: { type: 'string' }, data: { type: 'string' } } })
  let dir = values.data
  let source = 'local db-public data'
  if (!dir) {
    const release = values.release ?? (await github<{ tag_name: string }>('releases/latest')).tag_name
    dir = await download(release)
    source = `${REPO} release ${release}`
  }

  const tables = await readTables(dir)
  await mkdir(OUT_DIR, { recursive: true })
  for (const region of REGIONS) {
    const data = buildRegionData(region, tables, source)
    await writeFile(path.join(OUT_DIR, `${region.name}.json`), JSON.stringify(data))
    console.log(
      `${region.name.padEnd(18)} zones ${data.zones.length}, mobs ${data.mobs.length}, npcs ${data.npcs.length}, ` +
        `routes ${data.routes.length}, entrances ${data.entrances.length}, bind points ${data.bindPoints.length}`,
    )
  }
  console.log(`Wrote ${OUT_DIR} from ${source}`)
}

await main()
