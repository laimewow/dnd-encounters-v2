import type { EncounterParticipant, MonsterResource } from '../domain/types'
import { genId } from './random'

export const generateMonsterFromResource = (monster: MonsterResource): EncounterParticipant => ({
    id: genId(),
    name: monster.name,
    icon: monster.iconUrl,
    actionUsed: false,
    bonusActionUsed: false,
    delayedActionUsed: false,
    health: monster.baseHealth,
    maxHealth: monster.baseHealth,
    friendly: false,
    currentTurn: false,
    initiative: 0,
    states: [],
    masterTooltip: monster.masterTooltip,
    monsterResourceId: monster.id,
})
