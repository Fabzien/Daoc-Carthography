import { Anvil, createElement, GraduationCap, HandCoins, HeartPulse, Shield, Ship, Sparkles, User, Vault, type IconNode } from 'lucide'
import type { NpcKind } from '../data/types'
import { NPC_KINDS } from './kinds'

// Pictogram of each NPC kind: a Lucide icon (ISC license), or an image for the
// stable master since Lucide has no horse.
const ICONS: Record<NpcKind, IconNode | string> = {
  merchant: HandCoins,
  trainer: GraduationCap,
  healer: HeartPulse,
  stable: '/images/horse.png',
  boat: Ship,
  teleporter: Sparkles,
  guard: Shield,
  crafting: Anvil,
  vault: Vault,
  other: User,
}

const glyphs = new Map<NpcKind, string>()

// White pictogram markup, built once per kind. The markup only comes from the
// constants above, so it is safe to insert as HTML.
function glyph(kind: NpcKind): string {
  let html = glyphs.get(kind)
  if (!html) {
    const icon = ICONS[kind]
    html =
      typeof icon === 'string'
        ? `<img src="${icon}" alt="" />`
        : createElement(icon, { width: '100%', height: '100%', stroke: 'currentColor', 'stroke-width': 2.5 }).outerHTML
    glyphs.set(kind, html)
  }
  return html
}

// Round badge in the kind's color with its pictogram, as an HTML string for
// Leaflet div icons and the legend.
export function npcBadgeHtml(kind: NpcKind): string {
  return `<span class="npc-badge" style="background:${NPC_KINDS[kind].color}">${glyph(kind)}</span>`
}
