import type { Mob } from '../data/types'

// Queries the external mob API (not part of this repo), react-admin/ra-core style.
export async function fetchMobs(name: string, region: string): Promise<Mob[]> {
  const endpoint = import.meta.env.VITE_API_ENDPOINT
  if (!endpoint) {
    console.warn('VITE_API_ENDPOINT is not set: mob search is disabled')
    return []
  }

  const url = new URL(endpoint)
  url.search = new URLSearchParams({
    filter: JSON.stringify({ Name: name, Region: region }),
    range: '[0, 99]',
    sort: '["Name","DESC"]',
  }).toString()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Mob search failed: HTTP ${response.status}`)
  }
  return response.json()
}
