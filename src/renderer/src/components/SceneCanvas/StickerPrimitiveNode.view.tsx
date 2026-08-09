import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Scenes } from '../../domain/Scenes'
import { useSceneCanvasContext } from './SceneCanvasContext'
import {
    RESIZE_HANDLE_SIZE,
    STICKER_DEFAULT_HEIGHT,
    STICKER_DEFAULT_WIDTH,
    STICKER_MIN_HEIGHT,
    STICKER_MIN_WIDTH,
} from './primitiveConstants'
import type { CanvasPrimitive } from '../../domain/types'

interface StickerPrimitiveNodeProps {
    primitive: CanvasPrimitive
    selected: boolean
}

const FIELD_COMMIT_DEBOUNCE_MS = 300

/** Same reasoning as PrimitiveInspector's color debounce: committing on every keystroke
 *  forces React Flow to re-measure this node on every keystroke, which can visibly
 *  flicker it under fast typing. Local state keeps typing instant; the domain only
 *  hears about it after a short pause (or immediately on blur, so nothing is lost). */
function useDebouncedField(value: string, primitiveId: string, commit: (v: string) => void) {
    const [local, setLocal] = useState(value)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        setLocal(value)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- resync only when selection changes, not on every commit echo
    }, [primitiveId])

    const onChange = (v: string) => {
        setLocal(v)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => commit(v), FIELD_COMMIT_DEBOUNCE_MS)
    }
    const flush = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        commit(local)
    }

    return [local, onChange, flush] as const
}

export const StickerPrimitiveNode = ({ primitive, selected }: StickerPrimitiveNodeProps) => {
    const { screenToFlowPosition } = useReactFlow()
    const { sceneId, mode } = useSceneCanvasContext()
    const [sizeOverride, setSizeOverride] = useState<{ width: number; height: number } | null>(null)

    const commitTitle = (title: string) => {
        if (sceneId) Scenes.updatePrimitive(sceneId, primitive.id, { label: title })
    }
    const commitContent = (content: string) => {
        if (sceneId) Scenes.updatePrimitive(sceneId, primitive.id, { content })
    }
    const [localTitle, onTitleChange, flushTitle] = useDebouncedField(primitive.label, primitive.id, commitTitle)
    const [localContent, onContentChange, flushContent] = useDebouncedField(
        primitive.content ?? '',
        primitive.id,
        commitContent,
    )

    const baseWidth = primitive.width ?? STICKER_DEFAULT_WIDTH
    const baseHeight = primitive.height ?? STICKER_DEFAULT_HEIGHT
    const width = sizeOverride?.width ?? baseWidth
    const height = sizeOverride?.height ?? baseHeight

    const onResizePointerDown = (e: ReactPointerEvent) => {
        if (e.button !== 0 || mode !== 'edit') return
        e.stopPropagation()
        const startPoint = screenToFlowPosition({ x: e.clientX, y: e.clientY })

        const handleMove = (ev: PointerEvent) => {
            const point = screenToFlowPosition({ x: ev.clientX, y: ev.clientY })
            const newWidth = Math.max(STICKER_MIN_WIDTH, baseWidth + (point.x - startPoint.x))
            const newHeight = Math.max(STICKER_MIN_HEIGHT, baseHeight + (point.y - startPoint.y))
            setSizeOverride({ width: newWidth, height: newHeight })
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
            className={`primitive-node primitive-node--sticker${selected ? ' primitive-node--selected' : ''}`}
            style={{ width, height }}
        >
            <div className="primitive-node__sticker-titlebar">
                {mode === 'edit' ? (
                    <input
                        className="nodrag primitive-node__sticker-title-input"
                        value={localTitle}
                        placeholder="Название"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
                        onBlur={flushTitle}
                    />
                ) : (
                    <span className="primitive-node__sticker-title-text">{primitive.label || 'Без названия'}</span>
                )}
            </div>
            {mode === 'edit' ? (
                <textarea
                    className="nodrag nowheel primitive-node__sticker-content primitive-node__sticker-content-input"
                    value={localContent}
                    placeholder="Текст заметки..."
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onContentChange(e.target.value)}
                    onBlur={flushContent}
                />
            ) : (
                <div className="nowheel primitive-node__sticker-content">{primitive.content}</div>
            )}
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
