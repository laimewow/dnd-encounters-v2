export interface MasterTooltip {
    abilities: string[]
    ac: number
    actions: string[]
    damage: string
    danger: string
    description: string
    exp: number
    languages: string[]
    other: Record<string, string>
    passives: string[]
    perception: string[]
    race: string
}

export interface ParticipantState {
    id: string
    icon: string
    name: string
}

export interface EncounterParticipant {
    id: string
    name: string
    icon: string
    actionUsed: boolean
    bonusActionUsed: boolean
    delayedActionUsed: boolean
    health: number
    maxHealth: number
    friendly: boolean
    currentTurn: boolean
    initiative: number
    states: ParticipantState[]
    masterTooltip?: MasterTooltip
    /** Set only for participants generated from a monster resource — links back to it for AC/attacks/the card window. */
    monsterResourceId?: string
}

export type EncounterStage = 0 | 1 | 2

export interface EncounterData {
    stage: EncounterStage
    participants: EncounterParticipant[]
    selectedParticipantId: string | null
}

export interface PartyMember {
    id: string
    gameId: string
    name: string
    icon: string
    maxHealth: number
    currentHealth: number
    classKey?: string
}

export interface MonsterAttack {
    id: string
    name: string
    attackBonus: number
    /** e.g. "1d6" */
    damageRoll: string
    damageBonus: number
    /** Multi-line notes about this attack. */
    notes: string
}

export interface MonsterResource {
    id: string
    name: string
    iconUrl: string
    baseHealth: number
    armorClass: number
    attacks: MonsterAttack[]
    notes: string
    masterTooltip?: MasterTooltip
}

/** monsters is keyed by MonsterResource.id, not name. */
export interface EncounterTemplate {
    id: string
    name: string
    monsters: Record<string, number>
}

export interface UnitClassOption {
    value: string
    label: string
    iconUrl: string
}

export interface WorldClockData {
    date: Date
    weather: string
    brightness: string
    lastRest: Date
}

export interface Game {
    id: string
    name: string
    description: string
    createdAt: string
}

export type PrimitiveShape = 'square' | 'circle' | 'star' | 'triangle' | 'arrow'

export type PrimitiveAction =
    | { type: 'none' }
    | { type: 'openMasterCard'; cardId: string }
    | { type: 'startEncounter'; planId: string }
    | { type: 'switchScene'; sceneId: string }

export interface CanvasPrimitive {
    id: string
    shape: PrimitiveShape
    x: number
    y: number
    /** Degrees, 0-359. */
    rotation: number
    fillColor: string
    textColor: string
    label: string
    action: PrimitiveAction
}

export interface Scene {
    id: string
    gameId: string
    name: string
    description: string
    plannedEncounters: EncounterTemplate[]
    primitives: CanvasPrimitive[]
    /** References into MasterCard.id — cards relevant to this scene, shown alongside it. */
    masterCardIds: string[]
}

export interface MasterCard {
    id: string
    gameId: string
    title: string
    text: string
}
