import { NPC_KINDS } from './kinds'
import { entranceBadgeHtml, npcBadgeHtml } from './badges'

describe('npcBadgeHtml', () => {
  it('draws a Lucide pictogram on the kind color', () => {
    const html = npcBadgeHtml('merchant')
    expect(html).toContain(`background:${NPC_KINDS.merchant.color}`)
    expect(html).toContain('<svg')
  })

  it('uses the horse image for stable masters', () => {
    expect(npcBadgeHtml('stable')).toContain('<img src="/images/horse.png"')
  })
})

describe('entranceBadgeHtml', () => {
  it('fades entrances that lead to no map', () => {
    expect(entranceBadgeHtml(true)).not.toContain('badge-faded')
    expect(entranceBadgeHtml(false)).toContain('badge-faded')
  })
})
