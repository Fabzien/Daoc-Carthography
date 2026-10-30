import { useMapStore } from './store'
import { fetchMobs } from './api/mobs'
import type { Mob } from './data/types'

vi.mock('./api/mobs', () => ({ fetchMobs: vi.fn() }))

const mob: Mob = { _id: '1', Name: 'Wolf', loc: { coordinates: [-80, 90] }, attributes: { type: 'beast' } }

describe('map store', () => {
  beforeEach(() => {
    useMapStore.setState({ region: 'Albion-Classic', userInput: '', mobs: [] })
  })

  it('searches mobs for the current input and region', async () => {
    vi.mocked(fetchMobs).mockResolvedValue([mob])
    useMapStore.getState().setUserInput('Wolf')
    await useMapStore.getState().search()
    expect(fetchMobs).toHaveBeenCalledWith('Wolf', 'Albion-Classic')
    expect(useMapStore.getState().mobs).toEqual([mob])
  })

  it('clears mob results when the region changes', () => {
    useMapStore.setState({ mobs: [mob] })
    useMapStore.getState().setRegion('Midgard-SI')
    expect(useMapStore.getState().mobs).toEqual([])
  })

  it('drops results that arrive after a region change', async () => {
    let resolve: (mobs: Mob[]) => void = () => {}
    vi.mocked(fetchMobs).mockReturnValue(new Promise((r) => (resolve = r)))
    const pending = useMapStore.getState().search()
    useMapStore.getState().setRegion('Hibernian-SI')
    resolve([mob])
    await pending
    expect(useMapStore.getState().mobs).toEqual([])
  })
})
