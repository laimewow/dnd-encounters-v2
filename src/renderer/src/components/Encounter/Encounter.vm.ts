import { useEffect, useRef, useState } from 'react'
import { Encounter, useEncounter, useSelectedParticipant } from '../../domain/Encounter'
import { useIsWindowFocused } from '../../domain/WindowManager'
import { useActiveGameId } from '../../domain/Games'

const isTypingTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false
    return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

export const useEncounterVM = () => {
    const encounter = useEncounter()
    const selected = useSelectedParticipant()
    const focused = useIsWindowFocused('combat')
    const activeGameId = useActiveGameId()

    const addMonsterButtonRef = useRef<HTMLButtonElement>(null)
    const [monsterPickerOpen, setMonsterPickerOpen] = useState(false)

    const [warning, setWarning] = useState('')
    const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const showWarning = (text: string) => {
        setWarning(text)
        if (warningTimer.current) clearTimeout(warningTimer.current)
        warningTimer.current = setTimeout(() => setWarning(''), 2500)
    }

    const [runAwayConfirmOpen, setRunAwayConfirmOpen] = useState(false)

    const [hpDialogOpen, setHpDialogOpen] = useState(false)
    const [hpInput, setHpInput] = useState('0')
    const [maxHpDialogOpen, setMaxHpDialogOpen] = useState(false)
    const [maxHpInput, setMaxHpInput] = useState('0')
    const [initiativeDialogOpen, setInitiativeDialogOpen] = useState(false)
    const [initiativeInput, setInitiativeInput] = useState('0')

    const onStart = () => {
        if (activeGameId) Encounter.start()
    }

    const onAdvancePhase = () => {
        const stage = encounter?.stage
        const ok = Encounter.advancePhase()
        if (!ok && stage === 0) showWarning('Добавьте хотя бы одного противника!')
    }

    const onRollForNpc = () => Encounter.rollForNpc()
    const onNextTurn = () => Encounter.nextTurn()

    const onRunAwayRequest = () => setRunAwayConfirmOpen(true)
    const onRunAwayConfirm = () => {
        setRunAwayConfirmOpen(false)
        Encounter.finish()
    }
    const onRunAwayCancel = () => setRunAwayConfirmOpen(false)

    const onForceFinish = () => Encounter.finish()

    const openMonsterPicker = () => setMonsterPickerOpen(true)
    const closeMonsterPicker = () => setMonsterPickerOpen(false)

    const openHpDialogForSelected = () => {
        if (!selected) return
        setHpInput('0')
        setHpDialogOpen(true)
    }
    const closeHpDialog = () => setHpDialogOpen(false)
    const submitHpDialog = () => {
        if (selected) Encounter.modHealth(selected.id, Number(hpInput) || 0)
        setHpDialogOpen(false)
    }

    const openMaxHpDialogForSelected = () => {
        if (!selected) return
        setMaxHpInput('0')
        setMaxHpDialogOpen(true)
    }
    const closeMaxHpDialog = () => setMaxHpDialogOpen(false)
    const submitMaxHpDialog = () => {
        if (selected) Encounter.modMaxHealth(selected.id, Number(maxHpInput) || 0)
        setMaxHpDialogOpen(false)
    }

    const openInitiativeDialogForSelected = () => {
        if (!selected) return
        setInitiativeInput(String(selected.initiative))
        setInitiativeDialogOpen(true)
    }
    const closeInitiativeDialog = () => setInitiativeDialogOpen(false)
    const submitInitiativeDialog = () => {
        if (selected) {
            const value = Number(initiativeInput)
            if (!Number.isNaN(value)) Encounter.setInitiative(selected.id, value)
        }
        setInitiativeDialogOpen(false)
    }

    useEffect(() => {
        const anyOverlayOpen =
            hpDialogOpen || maxHpDialogOpen || initiativeDialogOpen || runAwayConfirmOpen || monsterPickerOpen

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!focused || isTypingTarget(e.target)) return

            if (e.ctrlKey && e.shiftKey && e.code === 'KeyR') {
                e.preventDefault()
                onForceFinish()
                return
            }

            if (!encounter) {
                if (e.code === 'KeyF') onStart()
                return
            }

            if (anyOverlayOpen) return

            if (e.code === 'ArrowUp') {
                e.preventDefault()
                Encounter.selectPrev()
                return
            }
            if (e.code === 'ArrowDown') {
                e.preventDefault()
                Encounter.selectNext()
                return
            }
            if (e.code === 'KeyF' && (encounter.stage === 0 || encounter.stage === 2)) {
                onAdvancePhase()
                return
            }
            if (e.code === 'KeyA') {
                openMonsterPicker()
                return
            }
            if (e.code === 'KeyT' && encounter.stage === 0) {
                onRollForNpc()
                return
            }
            if (e.code === 'KeyR' && encounter.stage === 1) {
                onRunAwayRequest()
                return
            }
            if (e.code === 'Space' && encounter.stage === 1) {
                e.preventDefault()
                onNextTurn()
                return
            }
            if (e.code === 'KeyD' && selected) {
                openHpDialogForSelected()
                return
            }
            if (e.code === 'KeyM' && selected) {
                openMaxHpDialogForSelected()
                return
            }
            if (e.code === 'KeyI' && selected) {
                openInitiativeDialogForSelected()
                return
            }

            const target = e.shiftKey ? selected : encounter.participants.find((p) => p.currentTurn)
            if (target) {
                if (e.code === 'Digit1') {
                    Encounter.toggleFlag(target.id, 'actionUsed')
                    return
                }
                if (e.code === 'Digit2') {
                    Encounter.toggleFlag(target.id, 'bonusActionUsed')
                    return
                }
                if (e.code === 'Digit3') {
                    Encounter.toggleFlag(target.id, 'delayedActionUsed')
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [focused, encounter, selected, hpDialogOpen, maxHpDialogOpen, initiativeDialogOpen, runAwayConfirmOpen, monsterPickerOpen])

    const stageMessage = !activeGameId
        ? 'Сначала выберите активную игру в окне «Игры»'
        : !encounter
          ? 'Нет активного боя (F — начать)'
          : encounter.stage === 0
          ? 'Добавляйте монстров и кидайте инициативу! (F - продолжить)'
          : encounter.stage === 1
            ? (encounter.participants.find((p) => p.currentTurn)?.name ?? '')
            : 'Бой окончен! (F - завершить)'

    const data = {
        activeGameId,
        encounter,
        selected,
        message: warning || stageMessage,
        addMonsterButtonRef,
        monsterPickerOpen,
        runAwayConfirmOpen,
        hpDialogOpen,
        hpInput,
        maxHpDialogOpen,
        maxHpInput,
        initiativeDialogOpen,
        initiativeInput,
    }

    const events = {
        onStart,
        onAdvancePhase,
        onRollForNpc,
        onNextTurn,
        onRunAwayRequest,
        onRunAwayConfirm,
        onRunAwayCancel,
        onForceFinish,
        openMonsterPicker,
        closeMonsterPicker,
        closeHpDialog,
        submitHpDialog,
        setHpInput,
        closeMaxHpDialog,
        submitMaxHpDialog,
        setMaxHpInput,
        closeInitiativeDialog,
        submitInitiativeDialog,
        setInitiativeInput,
    }

    return { data, events }
}
