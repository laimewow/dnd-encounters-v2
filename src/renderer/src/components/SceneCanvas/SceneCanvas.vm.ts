import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { applyNodeChanges, useReactFlow, type Node, type NodeChange } from '@xyflow/react'
import { toastError } from 'basic-front'
import { useActiveGameId } from '../../domain/Games'
import { Scenes, useActiveScene, useScenesForGame } from '../../domain/Scenes'
import { useMasterCardsForGame } from '../../domain/MasterCards'
import { WindowManager } from '../../domain/WindowManager'
import type { CanvasPrimitive, PrimitiveShape } from '../../domain/types'
import {
    IMAGE_DEFAULT_MAX_SIZE,
    LINE_HANDLE_PADDING,
    PRIMITIVE_SIZE,
    STICKER_DEFAULT_HEIGHT,
    STICKER_DEFAULT_WIDTH,
} from './primitiveConstants'
import { MASTER_CARD_DRAG_TYPE, PRIMITIVE_SHAPE_DRAG_TYPE } from '../../lib/dragTypes'
import { extensionFromMime, fitWithinMax, readImageNaturalSize } from '../../lib/imageFile'

type Mode = 'edit' | 'use'

/** A line's node position is the top-left of its two-point bounding box (plus handle
 *  padding), matching what LinePrimitiveNode assumes its own (0,0) origin to be. */
function lineOrigin(primitive: CanvasPrimitive): { x: number; y: number } {
    const x2 = primitive.x2 ?? primitive.x
    const y2 = primitive.y2 ?? primitive.y
    return { x: Math.min(primitive.x, x2) - LINE_HANDLE_PADDING, y: Math.min(primitive.y, y2) - LINE_HANDLE_PADDING }
}

function toNode(primitive: CanvasPrimitive): Node {
    return {
        id: primitive.id,
        type: 'primitive',
        position: primitive.shape === 'line' ? lineOrigin(primitive) : { x: primitive.x, y: primitive.y },
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
    const wrapperRef = useRef<HTMLDivElement>(null)

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
            if (!scene) return
            const primitive = scene.primitives.find((p) => p.id === node.id)
            if (!primitive) return

            if (primitive.shape === 'line') {
                const origin = lineOrigin(primitive)
                const dx = node.position.x - origin.x
                const dy = node.position.y - origin.y
                const x2 = primitive.x2 ?? primitive.x
                const y2 = primitive.y2 ?? primitive.y
                Scenes.updatePrimitive(scene.id, node.id, {
                    x: primitive.x + dx,
                    y: primitive.y + dy,
                    x2: x2 + dx,
                    y2: y2 + dy,
                })
            } else {
                Scenes.movePrimitive(scene.id, node.id, node.position.x, node.position.y)
            }
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

    /** Saves a working copy of the image via IPC, then adds an image primitive centered on (flowX, flowY). */
    const addImageFromFile = useCallback(
        async (file: File, flowX: number, flowY: number) => {
            if (!scene) return
            try {
                const natural = await readImageNaturalSize(file)
                const { width, height } = fitWithinMax(natural.width, natural.height, IMAGE_DEFAULT_MAX_SIZE)
                const bytes = await file.arrayBuffer()
                const relativePath = await window.api.images.save(bytes, extensionFromMime(file.type))
                Scenes.addImagePrimitive(
                    scene.id,
                    `app://data/${relativePath}`,
                    flowX - width / 2,
                    flowY - height / 2,
                    width,
                    height,
                )
            } catch (err) {
                console.error('Failed to add image to canvas:', err)
                toastError('Не удалось добавить изображение')
            }
        },
        [scene],
    )

    const onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault()
            if (!scene) return
            const point = screenToFlowPosition({ x: event.clientX, y: event.clientY })

            const imageFile = Array.from(event.dataTransfer.files).find((f) => f.type.startsWith('image/'))
            if (imageFile) {
                addImageFromFile(imageFile, point.x, point.y)
                return
            }

            const shape = event.dataTransfer.getData(PRIMITIVE_SHAPE_DRAG_TYPE) as PrimitiveShape | ''
            const cardId = event.dataTransfer.getData(MASTER_CARD_DRAG_TYPE)
            const position =
                shape === 'sticker'
                    ? { x: point.x - STICKER_DEFAULT_WIDTH / 2, y: point.y - STICKER_DEFAULT_HEIGHT / 2 }
                    : { x: point.x - PRIMITIVE_SIZE / 2, y: point.y - PRIMITIVE_SIZE / 2 }

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
        [scene, masterCards, screenToFlowPosition, addImageFromFile],
    )

    // Paste an image from the clipboard (edit mode only, and only when the paste isn't
    // meant for a text field elsewhere in the app) at the center of the current viewport.
    useEffect(() => {
        if (mode !== 'edit') return

        const handlePaste = (event: ClipboardEvent) => {
            const target = event.target as HTMLElement | null
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return
            }
            const items = event.clipboardData?.items
            if (!items) return
            const imageItem = Array.from(items).find((item) => item.type.startsWith('image/'))
            const file = imageItem?.getAsFile()
            if (!file) return
            event.preventDefault()

            const rect = wrapperRef.current?.getBoundingClientRect()
            const center = rect
                ? screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
                : { x: 0, y: 0 }
            addImageFromFile(file, center.x, center.y)
        }

        document.addEventListener('paste', handlePaste)
        return () => document.removeEventListener('paste', handlePaste)
    }, [mode, screenToFlowPosition, addImageFromFile])

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

    const data = { activeGameId, scene, scenesForGame, masterCards, mode, nodes, selectedPrimitive, wrapperRef }
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
