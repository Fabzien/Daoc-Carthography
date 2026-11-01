import { NPC_KINDS } from './kinds'
import { npcBadgeHtml } from './npcIcons'

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
