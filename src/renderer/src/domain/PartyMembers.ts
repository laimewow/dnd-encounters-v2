import { persistedField } from '../lib/persistedField'
import { genId } from '../lib/random'
import { useActiveGameId } from './Games'
import type { PartyMember } from './types'

const _members = persistedField<PartyMember[]>('partyMembers', [])

export const usePartyMembers = () => _members((s) => s.value)
export const usePartyMembersForActiveGame = () => {
    const members = usePartyMembers()
    const activeGameId = useActiveGameId()
    return activeGameId ? members.filter((m) => m.gameId === activeGameId) : []
}

function setMembers(update: (members: PartyMember[]) => PartyMember[]) {
    _members.getState().setValue(update(_members.getState().value))
}

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v))
}

export const PartyMembers = {
    usePartyMembers,
    usePartyMembersForActiveGame,

    all(): PartyMember[] {
        return _members.getState().value
    },

    forGame(gameId: string): PartyMember[] {
        return _members.getState().value.filter((m) => m.gameId === gameId)
    },

    add(gameId: string): PartyMember {
        const member: PartyMember = {
            id: genId(),
            gameId,
            name: 'имя',
            icon: '',
            maxHealth: 10,
            currentHealth: 5,
        }
        setMembers((members) => [...members, member])
        return member
    },

    remove(id: string) {
        setMembers((members) => members.filter((m) => m.id !== id))
    },

    removeForGame(gameId: string) {
        setMembers((members) => members.filter((m) => m.gameId !== gameId))
    },

    update(id: string, patch: Partial<PartyMember>) {
        setMembers((members) => members.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    },

    heal(id: string, delta: number) {
        setMembers((members) =>
            members.map((m) => {
                if (m.id !== id) return m
                const currentHealth = delta === 0 ? m.maxHealth : clamp(m.currentHealth + delta, 0, m.maxHealth)
                return { ...m, currentHealth }
            }),
        )
    },

    healAll(gameId: string) {
        setMembers((members) => members.map((m) => (m.gameId === gameId ? { ...m, currentHealth: m.maxHealth } : m)))
    },

    syncFromEncounter(id: string, currentHealth: number, maxHealth: number) {
        setMembers((members) => members.map((m) => (m.id === id ? { ...m, currentHealth, maxHealth } : m)))
    },
}
