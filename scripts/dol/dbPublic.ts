// Downloads and caches the Dawn of Light public database
// (https://github.com/Eve-of-Darkness/db-public, MIT).
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const REPO = 'Eve-of-Darkness/db-public'
export const ROOT = path.resolve(import.meta.dirname, '..', '..')

async function github<T>(url: string): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const response = await fetch(`https://api.github.com/repos/${REPO}/${url}`, { headers })
  if (!response.ok) throw new Error(`GitHub API ${url}: HTTP ${response.status}`)
  return response.json() as Promise<T>
}

export async function latestRelease(): Promise<string> {
  return (await github<{ tag_name: string }>('releases/latest')).tag_name
}

// Downloads the tables matching `wanted` (file names) of a release into
// .cache/db-public/<release>/, skipping cached ones, and returns that folder.
export async function downloadTables(release: string, wanted: (file: string) => boolean): Promise<string> {
  const dir = path.join(ROOT, '.cache', 'db-public', release)
  await mkdir(dir, { recursive: true })
  const listing = await github<{ name: string }[]>(`contents/data?ref=${release}`)
  for (const file of listing.map((f) => f.name).filter(wanted)) {
    const target = path.join(dir, file)
    if (existsSync(target)) continue
    console.log(`Downloading ${file}...`)
    const response = await fetch(`https://raw.githubusercontent.com/${REPO}/${release}/data/${file}`)
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
    await writeFile(target, Buffer.from(await response.arrayBuffer()))
  }
  return dir
}
