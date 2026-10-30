// Generates public/data/<region>.json from the Dawn of Light public database
// (https://github.com/Eve-of-Darkness/db-public, MIT).
//
//   npm run import-dol                     # latest db-public release
//   npm run import-dol -- --release 85     # a given release
//   npm run import-dol -- --data <dir>     # a local folder of db-public JSON tables
//
// Downloads are cached in .cache/db-public/<release>/.
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { REGIONS } from '../src/data/regions.ts'
import { downloadTables, latestRelease, REPO, ROOT } from './dol/dbPublic.ts'
import { buildRegionData, type DolTables } from './dol/transform.ts'

const OUT_DIR = path.join(ROOT, 'public', 'data')
const TABLES = ['NpcTemplate', 'Zones', 'PathPoints', 'ZonePoint', 'Regions', 'BindPoint']
// The Mob table is split into Mob.0.json, Mob.1.json, ...
const isMobFile = (name: string) => /^Mob\.\d+\.json$/.test(name)

async function readTables(dir: string): Promise<DolTables> {
  const read = async (file: string) => JSON.parse(await readFile(path.join(dir, file), 'utf8'))
  const mobFiles = (await readdir(dir)).filter(isMobFile)
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
    const release = values.release ?? (await latestRelease())
    dir = await downloadTables(release, (name) => isMobFile(name) || TABLES.includes(name.replace(/\.json$/, '')))
    source = `${REPO} release ${release}`
  }

  const tables = await readTables(dir)
  await mkdir(OUT_DIR, { recursive: true })
  for (const region of REGIONS) {
    const data = buildRegionData(region, tables, source)
    await writeFile(path.join(OUT_DIR, `${region.name}.json`), JSON.stringify(data))
    console.log(
      `${region.name.padEnd(26)} zones ${data.zones.length}, mobs ${data.mobs.length}, npcs ${data.npcs.length}, ` +
        `routes ${data.routes.length}, entrances ${data.entrances.length}, bind points ${data.bindPoints.length}`,
    )
  }
  console.log(`Wrote ${OUT_DIR} from ${source}`)
}

await main()
