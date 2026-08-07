import { persistedField } from '../lib/persistedField'
import { random } from '../lib/random'
import { generateParticipantState } from '../lib/conditionCollection'
import { PartyMembers } from './PartyMembers'
import { WorldClock } from './WorldClock'
import { Games } from './Games'
import type { EncounterData, EncounterParticipant } from './types'

const _encounter = persistedField<EncounterData | null>('encounter', null)

export const useEncounter = () => _encounter((s) => s.value)

export const useSelectedParticipant = () => {
    const encounter = useEncounter()
    if (!encounter?.selectedParticipantId) return null
    return encounter.participants.find((p) => p.id === encounter.selectedParticipantId) ?? null
}

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v))
}

function incrementName(name: string, existing: string[]): string {
    if (!existing.includes(name)) return name
    let i = 1
    while (existing.includes(`${name} (${i})`)) i++
    return `${name} (${i})`
}

function setEncounter(update: (encounter: EncounterData) => EncounterData) {
    const current = _encounter.getState().value
    if (!current) return
    _encounter.getState().setValue(update(current))
}

function syncPartyMember(id: string) {
    const participant = _encounter.getState().value?.participants.find((p) => p.id === id)
    if (participant?.friendly) {
        PartyMembers.syncFromEncounter(id, participant.health, participant.maxHealth)
    }
}

function start() {
    const gameId = Games.activeId()
    const members = gameId ? PartyMembers.forGame(gameId) : []
    const participants: EncounterParticipant[] = members.map((m) => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
        actionUsed: false,
        bonusActionUsed: false,
        delayedActionUsed: false,
        health: m.maxHealth,
        maxHealth: m.maxHealth,
        friendly: true,
        currentTurn: false,
        initiative: 0,
        states: [],
    }))
    _encounter.getState().setValue({ stage: 0, participants, selectedParticipantId: null })
}

function finish() {
    _encounter.getState().setValue(null)
}

function addParticipant(participant: EncounterParticipant) {
    setEncounter((encounter) => {
        const names = encounter.participants.map((p) => p.name)
        const name = incrementName(participant.name, names)
        return { ...encounter, participants: [...encounter.participants, { ...participant, name }] }
    })
}

function selectOne(id: string | null) {
    setEncounter((encounter) => ({ ...encounter, selectedParticipantId: id }))
}

function selectPrev() {
    setEncounter((encounter) => {
        const { participants, selectedParticipantId } = encounter
        if (participants.length === 0) return encounter
        const idx = participants.findIndex((p) => p.id === selectedParticipantId)
        const nextIdx = idx <= 0 ? participants.length - 1 : idx - 1
        return { ...encounter, selectedParticipantId: participants[nextIdx].id }
    })
}

function selectNext() {
    setEncounter((encounter) => {
        const { participants, selectedParticipantId } = encounter
        if (participants.length === 0) return encounter
        const idx = participants.findIndex((p) => p.id === selectedParticipantId)
        const nextIdx = idx === -1 || idx === participants.length - 1 ? 0 : idx + 1
        return { ...encounter, selectedParticipantId: participants[nextIdx].id }
    })
}

/** stage 0 -> 1 requires at least one enemy; stage 1 is a no-op (advance via nextTurn); stage 2 -> finish. Returns false if blocked. */
function advancePhase(): boolean {
    const encounter = _encounter.getState().value
    if (!encounter) return false

    if (encounter.stage === 0) {
        const hasEnemy = encounter.participants.some((p) => !p.friendly)
        if (!hasEnemy) return false
        const sorted = [...encounter.participants].sort((a, b) => b.initiative - a.initiative)
        const participants = sorted.map((p, i) => ({ ...p, currentTurn: i === 0 }))
        _encounter.getState().setValue({ ...encounter, stage: 1, participants })
        return true
    }

    if (encounter.stage === 2) {
        finish()
        return true
    }

    return false
}

function nextTurn() {
    const encounter = _encounter.getState().value
    if (!encounter || encounter.stage !== 1 || encounter.participants.length === 0) return

    const { participants } = encounter
    const oldIndex = participants.findIndex((p) => p.currentTurn)
    let newIndex = oldIndex
    for (let step = 1; step <= participants.length; step++) {
        const candidate = (oldIndex + step) % participants.length
        if (participants[candidate].health > 0) {
            newIndex = candidate
            break
        }
    }

    const wrapped = newIndex <= oldIndex
    const updatedParticipants = participants.map((p, i) => ({
        ...p,
        currentTurn: i === newIndex,
        actionUsed: i === newIndex ? false : p.actionUsed,
        bonusActionUsed: i === newIndex ? false : p.bonusActionUsed,
        delayedActionUsed: i === newIndex ? false : p.delayedActionUsed,
    }))

    const allEnemiesDead = updatedParticipants.filter((p) => !p.friendly).every((p) => p.health <= 0)
    const stage = allEnemiesDead ? 2 : encounter.stage

    _encounter.getState().setValue({ ...encounter, stage, participants: updatedParticipants })

    if (wrapped) WorldClock.modTime(6)
}

function modHealth(id: string, delta: number) {
    setEncounter((encounter) => ({
        ...encounter,
        participants: encounter.participants.map((p) => {
            if (p.id !== id) return p
            const health = delta === 0 ? p.maxHealth : clamp(p.health + delta, 0, p.maxHealth)
            return { ...p, health }
        }),
    }))
    syncPartyMember(id)
}

function modMaxHealth(id: string, delta: number) {
    setEncounter((encounter) => ({
        ...encounter,
        participants: encounter.participants.map((p) => {
            if (p.id !== id) return p
            const maxHealth = Math.max(1, p.maxHealth + delta)
            const health = Math.min(p.health, maxHealth)
            return { ...p, maxHealth, health }
        }),
    }))
    syncPartyMember(id)
}

function setInitiative(id: string, value: number) {
    setEncounter((encounter) => ({
        ...encounter,
        participants: [...encounter.participants]
            .map((p) => (p.id === id ? { ...p, initiative: value } : p))
            .sort((a, b) => b.initiative - a.initiative),
    }))
}

function rollForNpc() {
    setEncounter((encounter) => {
        if (encounter.stage !== 0) return encounter
        const participants = encounter.participants
            .map((p) => (p.friendly ? p : { ...p, initiative: random(1, 20) }))
            .sort((a, b) => b.initiative - a.initiative)
        return { ...encounter, participants }
    })
}

function toggleFlag(id: string, key: 'actionUsed' | 'bonusActionUsed' | 'delayedActionUsed') {
    setEncounter((encounter) => ({
        ...encounter,
        participants: encounter.participants.map((p) => (p.id === id ? { ...p, [key]: !p[key] } : p)),
    }))
}

function addState(id: string, conditionName: string) {
    setEncounter((encounter) => ({
        ...encounter,
        participants: encounter.participants.map((p) =>
            p.id === id ? { ...p, states: [...p.states, generateParticipantState(conditionName)] } : p,
        ),
    }))
}

function removeState(participantId: string, stateId: string) {
    setEncounter((encounter) => ({
        ...encounter,
        participants: encounter.participants.map((p) =>
            p.id === participantId ? { ...p, states: p.states.filter((s) => s.id !== stateId) } : p,
        ),
    }))
}

export const Encounter = {
    useEncounter,
    useSelectedParticipant,

    current(): EncounterData | null {
        return _encounter.getState().value
    },

    start,
    finish,
    addParticipant,
    selectOne,
    selectPrev,
    selectNext,
    advancePhase,
    nextTurn,
    modHealth,
    modMaxHealth,
    setInitiative,
    rollForNpc,
    toggleFlag,
    addState,
    removeState,
}
