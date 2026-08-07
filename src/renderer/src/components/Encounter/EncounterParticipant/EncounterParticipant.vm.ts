import { useState } from 'react'
import { Encounter } from '../../../domain/Encounter'
import { useMonsterLibrary } from '../../../domain/MonsterLibrary'
import { WindowManager } from '../../../domain/WindowManager'
import type { EncounterParticipant as EncounterParticipantType } from '../../../domain/types'

export const useEncounterParticipantVM = (participant: EncounterParticipantType) => {
    const monsters = useMonsterLibrary()
    const monster = participant.monsterResourceId
        ? (monsters.find((m) => m.id === participant.monsterResourceId) ?? null)
        : null

    const [hpDialogOpen, setHpDialogOpen] = useState(false)
    const [hpInput, setHpInput] = useState('0')
    const [maxHpDialogOpen, setMaxHpDialogOpen] = useState(false)
    const [maxHpInput, setMaxHpInput] = useState('0')
    const [addStateAnchor, setAddStateAnchor] = useState<HTMLElement | null>(null)
    const [initiativeInput, setInitiativeInput] = useState(String(participant.initiative))

    const onSelect = () => Encounter.selectOne(participant.id)

    const openHpDialog = () => {
        setHpInput('0')
        setHpDialogOpen(true)
    }
    const closeHpDialog = () => setHpDialogOpen(false)
    const submitHp = () => {
        Encounter.modHealth(participant.id, Number(hpInput) || 0)
        setHpDialogOpen(false)
    }

    const openMaxHpDialog = () => {
        setMaxHpInput('0')
        setMaxHpDialogOpen(true)
    }
    const closeMaxHpDialog = () => setMaxHpDialogOpen(false)
    const submitMaxHp = () => {
        Encounter.modMaxHealth(participant.id, Number(maxHpInput) || 0)
        setMaxHpDialogOpen(false)
    }

    const onInitiativeChange = (value: string) => setInitiativeInput(value)
    const onInitiativeBlur = () => {
        const value = Number(initiativeInput)
        if (!Number.isNaN(value)) Encounter.setInitiative(participant.id, value)
    }

    const onToggleAction = () => Encounter.toggleFlag(participant.id, 'actionUsed')
    const onToggleBonus = () => Encounter.toggleFlag(participant.id, 'bonusActionUsed')
    const onToggleDelayed = () => Encounter.toggleFlag(participant.id, 'delayedActionUsed')

    const onRemoveState = (stateId: string) => Encounter.removeState(participant.id, stateId)
    const onAddState = (name: string) => Encounter.addState(participant.id, name)
    const openAddStateMenu = (el: HTMLElement) => setAddStateAnchor(el)
    const closeAddStateMenu = () => setAddStateAnchor(null)

    const onShowCard = () => {
        if (!monster) return
        WindowManager.open('monsterCardWindow', {
            title: monster.name,
            instanceKey: monster.id,
            params: { monsterId: monster.id },
            width: 360,
            height: 480,
        })
    }

    const data = { monster, hpInput, maxHpInput, initiativeInput, hpDialogOpen, maxHpDialogOpen, addStateAnchor }
    const events = {
        onSelect,
        openHpDialog,
        closeHpDialog,
        submitHp,
        setHpInput,
        openMaxHpDialog,
        closeMaxHpDialog,
        submitMaxHp,
        setMaxHpInput,
        onInitiativeChange,
        onInitiativeBlur,
        onToggleAction,
        onToggleBonus,
        onToggleDelayed,
        onRemoveState,
        onAddState,
        openAddStateMenu,
        closeAddStateMenu,
        onShowCard,
    }

    return { data, events }
}
