import { publicUrl } from './publicUrl'

describe('publicUrl', () => {
  it('serves public files under the base path', () => {
    // Vitest runs with the default base '/'.
    expect(publicUrl('/maps/a/tiles/{z}/{x}/{y}.png')).toBe('/maps/a/tiles/{z}/{x}/{y}.png')
    expect(publicUrl('data/Albion.json')).toBe('/data/Albion.json')
  })
})
