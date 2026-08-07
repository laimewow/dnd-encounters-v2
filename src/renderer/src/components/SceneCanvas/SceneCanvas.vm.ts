import { useCallback, useEffect, useState, type DragEvent } from 'react'
import { applyNodeChanges, useReactFlow, type Node, type NodeChange } from '@xyflow/react'
import { useActiveGameId } from '../../domain/Games'
import { Scenes, useActiveScene, useScenesForGame } from '../../domain/Scenes'
import { useMasterCardsForGame } from '../../domain/MasterCards'
import { WindowManager } from '../../domain/WindowManager'
import type { CanvasPrimitive, PrimitiveShape } from '../../domain/types'
import { PRIMITIVE_SIZE } from './primitiveConstants'
import { MASTER_CARD_DRAG_TYPE, PRIMITIVE_SHAPE_DRAG_TYPE } from '../../lib/dragTypes'

type Mode = 'edit' | 'use'

function toNode(primitive: CanvasPrimitive): Node {
    return {
        id: primitive.id,
        type: 'primitive',
        position: { x: primitive.x, y: primitive.y },
        data: primitive as unknown as Record<string, unknown>,
    }
}

/**
 * Rebuilds the node list, but reuses the exact previous node object for any primitive
 * whose reference hasn't changed. React Flow only keeps a node's cached measured
 * dimensions (and thus `visibility: visible`) across an update if the incoming node
 * object is reference-equal to the one it saw last time (see `adoptUserNodes`'
 * `checkEquality` fast path) — handing it a brand new object every time, even for
 * unrelated field edits, resets that measurement and flashes the node to
 * `visibility: hidden` until a ResizeObserver callback catches up. Under rapid edits
 * (e.g. dragging a native color picker) those resets can arrive faster than the
 * observer ever reports back, leaving the node permanently hidden.
 */
function syncNodes(primitives: CanvasPrimitive[], prevNodes: Node[]): Node[] {
    const prevById = new Map(prevNodes.map((n) => [n.id, n]))
    return primitives.map((primitive) => {
        const prev = prevById.get(primitive.id)
        if (prev && prev.data === (primitive as unknown as Record<string, unknown>)) return prev
        return toNode(primitive)
    })
}

export const useSceneCanvasVM = () => {
    const activeGameId = useActiveGameId()
    const scene = useActiveScene(activeGameId)
    const scenesForGame = useScenesForGame(activeGameId)
    const masterCards = useMasterCardsForGame(activeGameId)
    const { screenToFlowPosition, fitView } = useReactFlow()

    const [mode, setMode] = useState<Mode>('use')
    const [nodes, setNodes] = useState<Node[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        setNodes(scene ? scene.primitives.map(toNode) : [])
        setSelectedId(null)
        requestAnimationFrame(() => fitView({ duration: 200 }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scene?.id])

    useEffect(() => {
        if (scene) setNodes((prev) => syncNodes(scene.primitives, prev))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scene?.primitives])

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        // Never let React Flow's own internal mechanics (its default Backspace/Delete
        // keybinding, or any other built-in gesture) remove a node from our local mirror.
        // Deletion is exclusively domain-driven, via the inspector's trash button — a
        // remove-change reaching here would desync this local `nodes` cache from
        // `scene.primitives` (the actual source of truth) without ever touching the
        // domain data, making primitives look like they vanished until something else
        // happens to change `scene.primitives` and re-trigger the resync effect below.
        setNodes((nds) => applyNodeChanges(changes.filter((c) => c.type !== 'remove'), nds))
    }, [])

    const onNodeDragStop = useCallback(
        (_event: unknown, node: Node) => {
            if (scene) Scenes.movePrimitive(scene.id, node.id, node.position.x, node.position.y)
        },
        [scene],
    )

    const dispatchAction = useCallback(
        (primitive: CanvasPrimitive) => {
            switch (primitive.action.type) {
                case 'openMasterCard': {
                    const cardId = primitive.action.cardId
                    const card = masterCards.find((c) => c.id === cardId)
                    WindowManager.open('masterCardWindow', {
                        title: card?.title ?? 'Карточка',
                        instanceKey: cardId,
                        params: { cardId },
                        width: 360,
                        height: 420,
                    })
                    break
                }
                case 'startEncounter': {
                    const planId = primitive.action.planId
                    const plan = scene?.plannedEncounters.find((p) => p.id === planId)
                    if (plan) Scenes.startPlannedEncounter(plan.monsters)
                    break
                }
                case 'switchScene':
                    if (activeGameId) Scenes.setActive(activeGameId, primitive.action.sceneId)
                    break
                case 'none':
                    break
            }
        },
        [scene, masterCards, activeGameId],
    )

    const onNodeClick = useCallback(
        (_event: unknown, node: Node) => {
            if (mode === 'edit') setSelectedId(node.id)
        },
        [mode],
    )

    const onNodeDoubleClick = useCallback(
        (_event: unknown, node: Node) => {
            if (mode !== 'use' || !scene) return
            const primitive = scene.primitives.find((p) => p.id === node.id)
            if (primitive) dispatchAction(primitive)
        },
        [mode, scene, dispatchAction],
    )

    const toggleMode = () => {
        setMode((m) => (m === 'edit' ? 'use' : 'edit'))
        setSelectedId(null)
    }

    const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault()
            if (!scene) return
            const shape = event.dataTransfer.getData(PRIMITIVE_SHAPE_DRAG_TYPE) as PrimitiveShape | ''
            const cardId = event.dataTransfer.getData(MASTER_CARD_DRAG_TYPE)
            const point = screenToFlowPosition({ x: event.clientX, y: event.clientY })
            const position = { x: point.x - PRIMITIVE_SIZE / 2, y: point.y - PRIMITIVE_SIZE / 2 }

            if (shape) {
                Scenes.addPrimitive(scene.id, shape, position.x, position.y)
                return
            }
            if (cardId) {
                const card = masterCards.find((c) => c.id === cardId)
                const primitive = Scenes.addPrimitive(scene.id, 'circle', position.x, position.y)
                Scenes.updatePrimitive(scene.id, primitive.id, {
                    label: card?.title ?? '',
                    action: { type: 'openMasterCard', cardId },
                })
            }
        },
        [scene, masterCards, screenToFlowPosition],
    )

    const selectedPrimitive = scene?.primitives.find((p) => p.id === selectedId) ?? null

    const updateSelected = (patch: Partial<Omit<CanvasPrimitive, 'id'>>) => {
        if (scene && selectedId) Scenes.updatePrimitive(scene.id, selectedId, patch)
    }
    const removeSelected = () => {
        if (scene && selectedId) Scenes.removePrimitive(scene.id, selectedId)
        setSelectedId(null)
    }
    const rotateSelected = (delta: number) => {
        if (scene && selectedId) Scenes.rotatePrimitive(scene.id, selectedId, delta)
    }
    const closeInspector = () => setSelectedId(null)

    const data = { activeGameId, scene, scenesForGame, masterCards, mode, nodes, selectedPrimitive }
    const events = {
        onNodesChange,
        onNodeDragStop,
        onNodeClick,
        onNodeDoubleClick,
        toggleMode,
        onDragOver,
        onDrop,
        updateSelected,
        removeSelected,
        rotateSelected,
        closeInspector,
    }

    return { data, events }
}
