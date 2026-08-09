import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Scenes } from '../../domain/Scenes'
import { useSceneCanvasContext } from './SceneCanvasContext'
import { IMAGE_DEFAULT_MAX_SIZE, RESIZE_HANDLE_SIZE } from './primitiveConstants'
import type { CanvasPrimitive } from '../../domain/types'

interface ImagePrimitiveNodeProps {
    primitive: CanvasPrimitive
    selected: boolean
}

/**
 * The node's own top-left position (x/y) never changes during a resize — only
 * width/height grow from the bottom-right corner — so unlike the line endpoints,
 * this can just render the live size directly via local state without needing to
 * work around React Flow's node positioning at all; its ResizeObserver naturally
 * tracks the rendered size as it changes.
 */
export const ImagePrimitiveNode = ({ primitive, selected }: ImagePrimitiveNodeProps) => {
    const { screenToFlowPosition } = useReactFlow()
    const { sceneId, mode } = useSceneCanvasContext()
    const [sizeOverride, setSizeOverride] = useState<{ width: number; height: number } | null>(null)

    const baseWidth = primitive.width ?? IMAGE_DEFAULT_MAX_SIZE
    const baseHeight = primitive.height ?? IMAGE_DEFAULT_MAX_SIZE
    const width = sizeOverride?.width ?? baseWidth
    const height = sizeOverride?.height ?? baseHeight
    const aspectRatio = baseWidth / baseHeight || 1

    const onResizePointerDown = (e: ReactPointerEvent) => {
        if (e.button !== 0 || mode !== 'edit') return
        e.stopPropagation()
        const startPoint = screenToFlowPosition({ x: e.clientX, y: e.clientY })

        const handleMove = (ev: PointerEvent) => {
            const point = screenToFlowPosition({ x: ev.clientX, y: ev.clientY })
            const dx = point.x - startPoint.x
            const newWidth = Math.max(20, baseWidth + dx)
            setSizeOverride({ width: newWidth, height: newWidth / aspectRatio })
        }
        const handleUp = () => {
            window.removeEventListener('pointermove', handleMove)
            window.removeEventListener('pointerup', handleUp)
            setSizeOverride((current) => {
                if (current && sceneId) {
                    Scenes.updatePrimitive(sceneId, primitive.id, {
                        width: Math.round(current.width),
                        height: Math.round(current.height),
                    })
                }
                return null
            })
        }
        window.addEventListener('pointermove', handleMove)
        window.addEventListener('pointerup', handleUp)
    }

    return (
        <div
            className={`primitive-node primitive-node--image${selected ? ' primitive-node--selected' : ''}`}
            style={{ width, height, transform: `rotate(${primitive.rotation}deg)` }}
        >
            <img
                className="primitive-node__image"
                src={primitive.imageUrl}
                alt=""
                draggable={false}
                style={{ width, height }}
            />
            {mode === 'edit' && (
                <div
                    className="nodrag primitive-node__resize-handle"
                    style={{ width: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE }}
                    onPointerDown={onResizePointerDown}
                    title="Изменить размер"
                />
            )}
        </div>
    )
}
