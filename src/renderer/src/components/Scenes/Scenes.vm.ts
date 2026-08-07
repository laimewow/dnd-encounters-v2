import { useState } from 'react'
import { Scenes, useActiveSceneId, useScenesForGame } from '../../domain/Scenes'
import { useActiveGameId } from '../../domain/Games'
import { useMonsterLibrary } from '../../domain/MonsterLibrary'
import { useMasterCardsForGame } from '../../domain/MasterCards'
import { WindowManager } from '../../domain/WindowManager'
import type { MasterCard, MonsterResource, Scene } from '../../domain/types'

export const summarizePlan = (monsters: Record<string, number>, monsterLibrary: MonsterResource[]): string =>
    Object.entries(monsters)
        .map(([id, count]) => `${monsterLibrary.find((m) => m.id === id)?.name ?? '?'}: ${count}`)
        .join(', ')

export const useScenesVM = () => {
    const activeGameId = useActiveGameId()
    const scenes = useScenesForGame(activeGameId)
    const activeSceneId = useActiveSceneId(activeGameId)
    const monsterLibrary = useMonsterLibrary()
    const masterCards = useMasterCardsForGame(activeGameId)

    const [sceneDialogOpen, setSceneDialogOpen] = useState(false)
    const [editingSceneId, setEditingSceneId] = useState<string | null>(null)
    const [sceneName, setSceneName] = useState('')
    const [sceneDescription, setSceneDescription] = useState('')

    const [planDialogSceneId, setPlanDialogSceneId] = useState<string | null>(null)
    const [planName, setPlanName] = useState('')
    const [planSearch, setPlanSearch] = useState('')
    const [planCounts, setPlanCounts] = useState<Record<string, number>>({})

    const openAddScene = () => {
        setEditingSceneId(null)
        setSceneName('')
        setSceneDescription('')
        setSceneDialogOpen(true)
    }
    const openEditScene = (scene: Scene) => {
        setEditingSceneId(scene.id)
        setSceneName(scene.name)
        setSceneDescription(scene.description)
        setSceneDialogOpen(true)
    }
    const closeSceneDialog = () => setSceneDialogOpen(false)
    const submitScene = () => {
        if (!activeGameId || !sceneName.trim()) return
        if (editingSceneId) Scenes.update(editingSceneId, { name: sceneName.trim(), description: sceneDescription })
        else Scenes.add(activeGameId, sceneName.trim(), sceneDescription)
        setSceneDialogOpen(false)
    }
    const removeScene = (id: string) => Scenes.remove(id)
    const onSetActiveScene = (id: string) => {
        if (activeGameId) Scenes.setActive(activeGameId, id)
    }

    const openAddPlan = (sceneId: string) => {
        setPlanDialogSceneId(sceneId)
        setPlanName('')
        setPlanSearch('')
        setPlanCounts({})
    }
    const closePlanDialog = () => setPlanDialogSceneId(null)
    const incrementPlanMonster = (id: string) => setPlanCounts((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
    const decrementPlanMonster = (id: string) => setPlanCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) - 1) }))
    const submitPlan = () => {
        if (!planDialogSceneId || !planName.trim()) return
        const monsters = Object.fromEntries(Object.entries(planCounts).filter(([, n]) => n > 0))
        Scenes.addPlannedEncounter(planDialogSceneId, planName.trim(), monsters)
        setPlanDialogSceneId(null)
    }
    const removePlan = (sceneId: string, planId: string) => Scenes.removePlannedEncounter(sceneId, planId)

    const startPlan = (monsters: Record<string, number>) => Scenes.startPlannedEncounter(monsters)

    const onLinkMasterCard = (sceneId: string, cardId: string) => Scenes.linkMasterCard(sceneId, cardId)
    const onUnlinkMasterCard = (sceneId: string, cardId: string) => Scenes.unlinkMasterCard(sceneId, cardId)
    const onOpenMasterCard = (card: MasterCard) => {
        WindowManager.open('masterCardWindow', {
            title: card.title,
            instanceKey: card.id,
            params: { cardId: card.id },
            width: 360,
            height: 420,
        })
    }

    const filteredPlanMonsters = monsterLibrary
        .filter((m) => m.name.toLowerCase().includes(planSearch.toLowerCase()))
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))

    const data = {
        activeGameId,
        scenes,
        activeSceneId,
        monsterLibrary,
        masterCards,
        sceneDialogOpen,
        editingSceneId,
        sceneName,
        sceneDescription,
        planDialogSceneId,
        planName,
        planSearch,
        planCounts,
        filteredPlanMonsters,
    }
    const events = {
        openAddScene,
        openEditScene,
        closeSceneDialog,
        submitScene,
        removeScene,
        onSetActiveScene,
        setSceneName,
        setSceneDescription,
        openAddPlan,
        closePlanDialog,
        submitPlan,
        removePlan,
        setPlanName,
        setPlanSearch,
        incrementPlanMonster,
        decrementPlanMonster,
        startPlan,
        onLinkMasterCard,
        onUnlinkMasterCard,
        onOpenMasterCard,
    }

    return { data, events }
}
