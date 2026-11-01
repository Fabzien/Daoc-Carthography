import { Anvil, createElement, DoorOpen, GraduationCap, HandCoins, HeartPulse, Shield, Ship, Sparkles, User, Vault, type IconNode } from 'lucide'
import type { NpcKind } from '../data/types'
import { NPC_KINDS, RESULT_KINDS } from './kinds'

// Round badges with a white pictogram, used as map icons (Leaflet div icons)
// and in the legend. Pictograms are Lucide icons (ISC license), or an image
// for the stable master since Lucide has no horse.
type Pictogram = IconNode | string

const NPC_PICTOGRAMS: Record<NpcKind, Pictogram> = {
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

const glyphs = new Map<Pictogram, string>()

// White pictogram markup, built once per pictogram.
function glyph(pictogram: Pictogram): string {
  let html = glyphs.get(pictogram)
  if (!html) {
    html =
      typeof pictogram === 'string'
        ? `<img src="${pictogram}" alt="" />`
        : createElement(pictogram, { width: '100%', height: '100%', stroke: 'currentColor', 'stroke-width': 2.5 }).outerHTML
    glyphs.set(pictogram, html)
  }
  return html
}

// The markup only comes from the constants of this module, so it is safe to
// insert as HTML.
function badgeHtml(color: string, pictogram: Pictogram, className = ''): string {
  return `<span class="badge ${className}" style="background:${color}">${glyph(pictogram)}</span>`
}

export function npcBadgeHtml(kind: NpcKind): string {
  return badgeHtml(NPC_KINDS[kind].color, NPC_PICTOGRAMS[kind])
}

// Entrances to places without a map can't be entered: their badge is faded.
export function entranceBadgeHtml(leadsToMap: boolean): string {
  return badgeHtml(RESULT_KINDS.entrance.color, DoorOpen, leadsToMap ? 'badge-entrance' : 'badge-entrance badge-faded')
}
