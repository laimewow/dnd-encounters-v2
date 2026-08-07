import { toastError } from 'basic-front'
import { persistedField } from '../lib/persistedField'
import { genId } from '../lib/random'
import { generateMonsterFromResource } from '../lib/monsterCollection'
import { Encounter } from './Encounter'
import { MonsterLibrary } from './MonsterLibrary'
import { WindowManager } from './WindowManager'
import type { CanvasPrimitive, EncounterTemplate, PrimitiveShape, Scene } from './types'

const _scenes = persistedField<Scene[]>('scenes', [])
// Keyed by gameId so each game remembers its own current scene independently.
const _activeSceneByGame = persistedField<Record<string, string>>('activeSceneByGame', {})

export const useScenes = () => _scenes((s) => s.value)
export const useScenesForGame = (gameId: string | null) => {
    const scenes = useScenes()
    return gameId ? scenes.filter((s) => s.gameId === gameId) : []
}
export const useActiveSceneId = (gameId: string | null) => {
    const map = _activeSceneByGame((s) => s.value)
    return gameId ? (map[gameId] ?? null) : null
}
export const useActiveScene = (gameId: string | null) => {
    const scenes = useScenes()
    const activeSceneId = useActiveSceneId(gameId)
    return scenes.find((s) => s.id === activeSceneId) ?? null
}

function setScenes(update: (scenes: Scene[]) => Scene[]) {
    _scenes.getState().setValue(update(_scenes.getState().value))
}

function setActiveScene(gameId: string, sceneId: string | null) {
    const map = { ..._activeSceneByGame.getState().value }
    if (sceneId) map[gameId] = sceneId
    else delete map[gameId]
    _activeSceneByGame.getState().setValue(map)
}

function clearActiveIfMatches(gameId: string, sceneId: string) {
    if (_activeSceneByGame.getState().value[gameId] === sceneId) setActiveScene(gameId, null)
}

function updatePrimitive(sceneId: string, primitiveId: string, patch: Partial<Omit<CanvasPrimitive, 'id'>>) {
    setScenes((scenes) =>
        scenes.map((s) =>
            s.id === sceneId
                ? { ...s, primitives: s.primitives.map((p) => (p.id === primitiveId ? { ...p, ...patch } : p)) }
                : s,
        ),
    )
}

function newPrimitive(shape: PrimitiveShape, x: number, y: number): CanvasPrimitive {
    return {
        id: genId(),
        shape,
        x,
        y,
        rotation: 0,
        fillColor: '#2f6fed',
        textColor: '#ffffff',
        label: '',
        action: { type: 'none' },
    }
}

function rotatePrimitive(sceneId: string, primitiveId: string, delta: number) {
    const scene = _scenes.getState().value.find((s) => s.id === sceneId)
    const primitive = scene?.primitives.find((p) => p.id === primitiveId)
    if (!primitive) return
    updatePrimitive(sceneId, primitiveId, { rotation: (primitive.rotation + delta + 360) % 360 })
}

/** Starts a fight from a planned encounter's monster list. Shared by the Scenes list window and canvas primitives. */
function startPlannedEncounter(monsters: Record<string, number>): void {
    if (Encounter.current()) {
        toastError('Бой уже идёт')
        WindowManager.open('combat', { title: 'Бой', width: 640, height: 600 })
        return
    }
    Encounter.start()
    for (const [monsterId, count] of Object.entries(monsters)) {
        const monster = MonsterLibrary.findById(monsterId)
        if (!monster) continue
        for (let i = 0; i < count; i++) Encounter.addParticipant(generateMonsterFromResource(monster))
    }
    WindowManager.open('combat', { title: 'Бой', width: 640, height: 600 })
}

export const Scenes = {
    useScenes,
    useScenesForGame,
    useActiveSceneId,
    useActiveScene,

    forGame(gameId: string): Scene[] {
        return _scenes.getState().value.filter((s) => s.gameId === gameId)
    },

    byId(id: string): Scene | undefined {
        return _scenes.getState().value.find((s) => s.id === id)
    },

    activeIdForGame(gameId: string): string | null {
        return _activeSceneByGame.getState().value[gameId] ?? null
    },

    setActive: setActiveScene,

    add(gameId: string, name: string, description: string): Scene {
        const scene: Scene = {
            id: genId(),
            gameId,
            name,
            description,
            plannedEncounters: [],
            primitives: [],
            masterCardIds: [],
        }
        setScenes((scenes) => [...scenes, scene])
        if (!_activeSceneByGame.getState().value[gameId]) setActiveScene(gameId, scene.id)
        return scene
    },

    update(id: string, patch: Partial<Pick<Scene, 'name' | 'description'>>) {
        setScenes((scenes) => scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    },

    remove(id: string) {
        const scene = _scenes.getState().value.find((s) => s.id === id)
        setScenes((scenes) => scenes.filter((s) => s.id !== id))
        if (scene) clearActiveIfMatches(scene.gameId, id)
    },

    removeForGame(gameId: string) {
        setScenes((scenes) => scenes.filter((s) => s.gameId !== gameId))
        setActiveScene(gameId, null)
    },

    addPlannedEncounter(sceneId: string, name: string, monsters: Record<string, number>) {
        const plan: EncounterTemplate = { id: genId(), name, monsters }
        setScenes((scenes) =>
            scenes.map((s) => (s.id === sceneId ? { ...s, plannedEncounters: [...s.plannedEncounters, plan] } : s)),
        )
    },

    removePlannedEncounter(sceneId: string, planId: string) {
        setScenes((scenes) =>
            scenes.map((s) =>
                s.id === sceneId
                    ? { ...s, plannedEncounters: s.plannedEncounters.filter((p) => p.id !== planId) }
                    : s,
            ),
        )
    },

    startPlannedEncounter,

    addPrimitive(sceneId: string, shape: PrimitiveShape, x: number, y: number): CanvasPrimitive {
        const primitive = newPrimitive(shape, x, y)
        setScenes((scenes) =>
            scenes.map((s) => (s.id === sceneId ? { ...s, primitives: [...s.primitives, primitive] } : s)),
        )
        return primitive
    },

    updatePrimitive,

    movePrimitive(sceneId: string, primitiveId: string, x: number, y: number) {
        updatePrimitive(sceneId, primitiveId, { x, y })
    },

    rotatePrimitive,

    removePrimitive(sceneId: string, primitiveId: string) {
        setScenes((scenes) =>
            scenes.map((s) =>
                s.id === sceneId ? { ...s, primitives: s.primitives.filter((p) => p.id !== primitiveId) } : s,
            ),
        )
    },

    /** One-shot fixup for scenes saved before the canvas feature existed (no `primitives` field yet). */
    ensurePrimitivesField() {
        setScenes((scenes) => scenes.map((s) => (s.primitives ? s : { ...s, primitives: [] })))
    },

    /** One-shot fixup for primitives saved before rotation existed (no `rotation` field yet). */
    ensureRotationField() {
        setScenes((scenes) =>
            scenes.map((s) => ({
                ...s,
                primitives: s.primitives.map((p) => (p.rotation === undefined ? { ...p, rotation: 0 } : p)),
            })),
        )
    },

    /** One-shot fixup for scenes saved before scene-linked master cards existed. */
    ensureMasterCardIdsField() {
        setScenes((scenes) => scenes.map((s) => (s.masterCardIds ? s : { ...s, masterCardIds: [] })))
    },

    linkMasterCard(sceneId: string, cardId: string) {
        setScenes((scenes) =>
            scenes.map((s) =>
                s.id === sceneId && !s.masterCardIds.includes(cardId)
                    ? { ...s, masterCardIds: [...s.masterCardIds, cardId] }
                    : s,
            ),
        )
    },

    unlinkMasterCard(sceneId: string, cardId: string) {
        setScenes((scenes) =>
            scenes.map((s) =>
                s.id === sceneId ? { ...s, masterCardIds: s.masterCardIds.filter((id) => id !== cardId) } : s,
            ),
        )
    },

    /** Called when a master card itself is deleted, so no scene keeps a dangling reference to it. */
    unlinkMasterCardEverywhere(cardId: string) {
        setScenes((scenes) =>
            scenes.map((s) =>
                s.masterCardIds.includes(cardId)
                    ? { ...s, masterCardIds: s.masterCardIds.filter((id) => id !== cardId) }
                    : s,
            ),
        )
    },
}
