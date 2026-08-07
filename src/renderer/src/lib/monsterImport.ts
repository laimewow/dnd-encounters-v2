import { genId } from './random'
import type { MonsterAttack, MonsterResource } from '../domain/types'

/** Loose shape of a ttg.club-style bestiary export — only the fields we actually read. */
interface TtgNamedValue {
    name: string
    value?: number
}
interface TtgEntry {
    name: string
    value?: string
}
interface TtgMonsterRaw {
    name?: { rus?: string; eng?: string }
    size?: { rus?: string }
    type?: { name?: string }
    alignment?: string
    challengeRating?: string
    experience?: number
    armorClass?: number
    hits?: { average?: number }
    speed?: { name?: string; value?: number }[]
    savingThrows?: TtgNamedValue[]
    skills?: TtgNamedValue[]
    damageVulnerabilities?: string[]
    damageResistances?: string[]
    damageImmunities?: string[]
    conditionImmunities?: string[]
    senses?: { passivePerception?: string; senses?: TtgNamedValue[] }
    languages?: string[]
    feats?: TtgEntry[]
    actions?: TtgEntry[]
    reactions?: TtgEntry[]
    legendary?: { list?: TtgEntry[] }
}

/** Converts HTML (as used in the source's rich-text fields) to readable plain text. */
function stripHtml(html: string): string {
    const withBreaks = html.replace(/<\/(p|li|h[1-6]|tr|div)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
    const el = document.createElement('div')
    el.innerHTML = withBreaks
    const text = el.textContent ?? ''
    return text
        .replace(/ /g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

interface ParsedActionRoll {
    attackBonus: number | null
    damageRoll: string | null
    damageBonus: number
}

/** Looks for the source's <dice-roller> tags to pull out a to-hit bonus and primary damage. */
function parseActionRoll(html: string): ParsedActionRoll {
    const el = document.createElement('div')
    el.innerHTML = html

    let attackBonus: number | null = null
    const attackEl = el.querySelector('dice-roller[label="Атака"]')
    if (attackEl) {
        const n = Number((attackEl.textContent ?? '').trim())
        if (!Number.isNaN(n)) attackBonus = n
    }

    let damageRoll: string | null = null
    let damageBonus = 0
    const damageEl = el.querySelector('dice-roller[label="Урон"]')
    if (damageEl) {
        const formula = damageEl.getAttribute('formula') ?? ''
        const match = formula.match(/^(\d+)\s*[кКdD]\s*(\d+)(?:\s*([+-])\s*(\d+))?\s*$/)
        if (match) {
            damageRoll = `${match[1]}d${match[2]}`
            if (match[3] && match[4]) damageBonus = match[3] === '-' ? -Number(match[4]) : Number(match[4])
        }
    }

    return { attackBonus, damageRoll, damageBonus }
}

function formatSpeed(speed?: { name?: string; value?: number }[]): string {
    if (!speed?.length) return ''
    return speed.map((s) => (s.name ? `${s.name} ${s.value} фт.` : `${s.value} фт.`)).join(', ')
}

function formatSenses(senses?: TtgMonsterRaw['senses']): string {
    if (!senses) return ''
    const parts = (senses.senses ?? []).map((s) => `${s.name} ${s.value} фт.`)
    if (senses.passivePerception) parts.push(`пассивная Внимательность ${senses.passivePerception}`)
    return parts.join(', ')
}

function formatNamedValues(list?: TtgNamedValue[]): string {
    if (!list?.length) return ''
    return list.map((x) => `${x.name} +${x.value}`).join(', ')
}

function formatEntries(list?: TtgEntry[]): string {
    if (!list?.length) return ''
    return list.map((e) => `${e.name}${e.value ? `: ${stripHtml(e.value)}` : ''}`).join('\n')
}

function buildNotes(raw: TtgMonsterRaw, unstructuredActions: string[]): string {
    const lines: string[] = []

    if (raw.challengeRating) {
        lines.push(`ПО: ${raw.challengeRating}${raw.experience ? ` (${raw.experience} опыта)` : ''}`)
    }
    const typeLine = [raw.size?.rus, raw.type?.name].filter(Boolean).join(' ')
    if (typeLine || raw.alignment) lines.push([typeLine, raw.alignment].filter(Boolean).join(', '))

    const speed = formatSpeed(raw.speed)
    if (speed) lines.push(`Скорость: ${speed}`)

    const saves = formatNamedValues(raw.savingThrows)
    if (saves) lines.push(`Спасброски: ${saves}`)

    const skills = formatNamedValues(raw.skills)
    if (skills) lines.push(`Навыки: ${skills}`)

    if (raw.damageVulnerabilities?.length) lines.push(`Уязвимость к урону: ${raw.damageVulnerabilities.join(', ')}`)
    if (raw.damageResistances?.length) lines.push(`Сопротивление урону: ${raw.damageResistances.join(', ')}`)
    if (raw.damageImmunities?.length) lines.push(`Иммунитет к урону: ${raw.damageImmunities.join(', ')}`)
    if (raw.conditionImmunities?.length) lines.push(`Иммунитет к состояниям: ${raw.conditionImmunities.join(', ')}`)

    const senses = formatSenses(raw.senses)
    if (senses) lines.push(`Чувства: ${senses}`)
    if (raw.languages?.length) lines.push(`Языки: ${raw.languages.join(', ')}`)

    const feats = formatEntries(raw.feats)
    if (feats) lines.push(`\nЧерты:\n${feats}`)

    if (unstructuredActions.length > 0) lines.push(`\nПрочие действия:\n${unstructuredActions.join('\n')}`)

    const reactions = formatEntries(raw.reactions)
    if (reactions) lines.push(`\nРеакции:\n${reactions}`)

    const legendary = formatEntries(raw.legendary?.list)
    if (legendary) lines.push(`\nЛегендарные действия:\n${legendary}`)

    return lines.join('\n')
}

/**
 * Maps one ttg.club-style bestiary JSON entry to our MonsterResource shape.
 * Only actions with both a to-hit roll and a damage roll become structured
 * MonsterAttack entries (matching what that field is meant to model); everything
 * else (multiattack blurbs, breath weapons, save-based abilities, traits,
 * reactions, legendary actions) is folded into readable text in `notes` instead
 * of being dropped. Pure narrative/lore text (`description`, tag lore) is
 * deliberately skipped — this app is a combat-running tool, not a bestiary reader.
 */
export function parseTtgMonster(raw: unknown, iconDataUrl: string | null): Omit<MonsterResource, 'id'> | null {
    const m = raw as TtgMonsterRaw
    const name = m?.name?.rus || m?.name?.eng
    if (!name) return null

    const attacks: MonsterAttack[] = []
    const unstructuredActions: string[] = []

    for (const action of m.actions ?? []) {
        if (!action?.name) continue
        const roll = action.value ? parseActionRoll(action.value) : { attackBonus: null, damageRoll: null, damageBonus: 0 }
        if (roll.attackBonus !== null && roll.damageRoll) {
            attacks.push({
                id: genId(),
                name: action.name,
                attackBonus: roll.attackBonus,
                damageRoll: roll.damageRoll,
                damageBonus: roll.damageBonus,
                notes: action.value ? stripHtml(action.value) : '',
            })
        } else {
            unstructuredActions.push(`${action.name}${action.value ? `: ${stripHtml(action.value)}` : ''}`)
        }
    }

    return {
        name,
        iconUrl: iconDataUrl ?? '',
        baseHealth: Math.max(1, Math.round(Number(m.hits?.average) || 1)),
        armorClass: Math.round(Number(m.armorClass) || 10),
        attacks,
        notes: buildNotes(m, unstructuredActions),
    }
}
