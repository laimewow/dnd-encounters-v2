import { useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Scenes } from '../../domain/Scenes'
import { useSceneCanvasContext } from './SceneCanvasContext'
import { LINE_HANDLE_PADDING, LINE_HANDLE_RADIUS } from './primitiveConstants'
import type { CanvasPrimitive } from '../../domain/types'

interface LinePrimitiveNodeProps {
    primitive: CanvasPrimitive
    selected: boolean
}

type EndpointOverride = { x: number; y: number } | null

/**
 * Each endpoint drags independently via its own pointer-event handling (not React
 * Flow's node drag — that still moves the whole line, handled in SceneCanvas.vm.ts's
 * onNodeDragStop). The node's own position/size (and thus what React Flow measures
 * and positions the wrapper div at) is derived from the *committed* primitive fields
 * and never changes mid-drag; only the rendered endpoint position moves, via local
 * state, relative to that fixed origin. The SVG has overflow:visible so the line can
 * freely extend past its nominal box while dragging beyond the original span.
 */
export const LinePrimitiveNode = ({ primitive, selected }: LinePrimitiveNodeProps) => {
    const { screenToFlowPosition } = useReactFlow()
    const { sceneId, mode } = useSceneCanvasContext()
    const [override1, setOverride1] = useState<EndpointOverride>(null)
    const [override2, setOverride2] = useState<EndpointOverride>(null)

    const px2 = primitive.x2 ?? primitive.x
    const py2 = primitive.y2 ?? primitive.y

    const originX = Math.min(primitive.x, px2) - LINE_HANDLE_PADDING
    const originY = Math.min(primitive.y, py2) - LINE_HANDLE_PADDING
    const width = Math.abs(px2 - primitive.x) + LINE_HANDLE_PADDING * 2
    const height = Math.abs(py2 - primitive.y) + LINE_HANDLE_PADDING * 2

    const p1x = (override1?.x ?? primitive.x) - originX
    const p1y = (override1?.y ?? primitive.y) - originY
    const p2x = (override2?.x ?? px2) - originX
    const p2y = (override2?.y ?? py2) - originY

    const dragEndpoint = (which: 1 | 2) => (e: ReactPointerEvent) => {
        if (e.button !== 0 || mode !== 'edit') return
        e.stopPropagation()

        const setOverride = which === 1 ? setOverride1 : setOverride2
        const handleMove = (ev: PointerEvent) => {
            const point = screenToFlowPosition({ x: ev.clientX, y: ev.clientY })
            setOverride({ x: point.x, y: point.y })
        }
        const handleUp = (ev: PointerEvent) => {
            window.removeEventListener('pointermove', handleMove)
            window.removeEventListener('pointerup', handleUp)
            const point = screenToFlowPosition({ x: ev.clientX, y: ev.clientY })
            if (sceneId) {
                Scenes.updatePrimitive(
                    sceneId,
                    primitive.id,
                    which === 1 ? { x: point.x, y: point.y } : { x2: point.x, y2: point.y },
                )
            }
            setOverride(null)
        }
        window.addEventListener('pointermove', handleMove)
        window.addEventListener('pointerup', handleUp)
    }

    return (
        <div className={`primitive-node${selected ? ' primitive-node--selected' : ''}`}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                <line
                    x1={p1x}
                    y1={p1y}
                    x2={p2x}
                    y2={p2y}
                    stroke={primitive.fillColor}
                    strokeWidth={4}
                    strokeLinecap="round"
                />
                {mode === 'edit' && (
                    <>
                        <circle
                            className="nodrag primitive-node__line-handle"
                            cx={p1x}
                            cy={p1y}
                            r={LINE_HANDLE_RADIUS}
                            fill={primitive.fillColor}
                            onPointerDown={dragEndpoint(1)}
                        />
                        <circle
                            className="nodrag primitive-node__line-handle"
                            cx={p2x}
                            cy={p2y}
                            r={LINE_HANDLE_RADIUS}
                            fill={primitive.fillColor}
                            onPointerDown={dragEndpoint(2)}
                        />
                    </>
                )}
            </svg>
        </div>
    )
}
