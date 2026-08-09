import { useEffect, useRef, useState } from 'react'
import { RotateCcw, RotateCw, X, Trash2 } from 'lucide-react'
import type { CanvasPrimitive, MasterCard, PrimitiveAction, PrimitiveShape, Scene } from '../../domain/types'
import './PrimitiveInspector.style.scss'

const HAS_LABEL: PrimitiveShape[] = ['square', 'circle', 'star', 'triangle', 'arrow', 'text']
const HAS_FILL_COLOR: PrimitiveShape[] = ['square', 'circle', 'star', 'triangle', 'arrow', 'line']
const HAS_TEXT_COLOR: PrimitiveShape[] = ['square', 'circle', 'star', 'triangle', 'arrow', 'text']
const HAS_ROTATION: PrimitiveShape[] = ['square', 'circle', 'star', 'triangle', 'arrow', 'text', 'image']
const HAS_ACTION: PrimitiveShape[] = ['square', 'circle', 'star', 'triangle', 'arrow', 'image']

interface PrimitiveInspectorProps {
    primitive: CanvasPrimitive
    scene: Scene
    scenesForGame: Scene[]
    masterCards: MasterCard[]
    onChange: (patch: Partial<Omit<CanvasPrimitive, 'id'>>) => void
    onRemove: () => void
    onRotate: (delta: number) => void
    onClose: () => void
}

const COLOR_COMMIT_DEBOUNCE_MS = 50

/**
 * Committing a color on every native `input` event (i.e. continuously while dragging
 * the picker) floods the domain store, which forces React Flow to re-measure the node
 * on every single change — under a fast drag that can arrive faster than the
 * measurement can complete, leaving the node stuck `visibility: hidden`. Keep the
 * swatch itself instantly responsive via local state, but only commit to the domain
 * (and thus only touch the node's identity) after a short pause in dragging.
 */
function useDebouncedColor(value: string, primitiveId: string, commit: (color: string) => void) {
    const [local, setLocal] = useState(value)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        setLocal(value)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- resync only when selection changes, not on every commit echo
    }, [primitiveId])

    const onChange = (color: string) => {
        setLocal(color)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => commit(color), COLOR_COMMIT_DEBOUNCE_MS)
    }

    return [local, onChange] as const
}

const ACTION_LABELS: Record<PrimitiveAction['type'], string> = {
    none: 'Нет',
    openMasterCard: 'Открыть карточку мастера',
    startEncounter: 'Начать бой из плана',
    switchScene: 'Сменить сцену',
}

export const PrimitiveInspector = ({
    primitive,
    scene,
    scenesForGame,
    masterCards,
    onChange,
    onRemove,
    onRotate,
    onClose,
}: PrimitiveInspectorProps) => {
    const [localFillColor, onFillColorChange] = useDebouncedColor(primitive.fillColor, primitive.id, (color) =>
        onChange({ fillColor: color }),
    )
    const [localTextColor, onTextColorChange] = useDebouncedColor(primitive.textColor, primitive.id, (color) =>
        onChange({ textColor: color }),
    )
    const showFillColor = HAS_FILL_COLOR.includes(primitive.shape)
    const showTextColor = HAS_TEXT_COLOR.includes(primitive.shape)

    const onActionTypeChange = (type: PrimitiveAction['type']) => {
        let action: PrimitiveAction
        switch (type) {
            case 'openMasterCard':
                action = { type, cardId: masterCards[0]?.id ?? '' }
                break
            case 'startEncounter':
                action = { type, planId: scene.plannedEncounters[0]?.id ?? '' }
                break
            case 'switchScene':
                action = { type, sceneId: scenesForGame.find((s) => s.id !== scene.id)?.id ?? '' }
                break
            default:
                action = { type: 'none' }
        }
        onChange({ action })
    }

    const onTargetChange = (id: string) => {
        if (primitive.action.type === 'openMasterCard') onChange({ action: { type: 'openMasterCard', cardId: id } })
        else if (primitive.action.type === 'startEncounter')
            onChange({ action: { type: 'startEncounter', planId: id } })
        else if (primitive.action.type === 'switchScene') onChange({ action: { type: 'switchScene', sceneId: id } })
    }

    return (
        <div className="primitive-inspector">
            <div className="primitive-inspector__header">
                <span className="primitive-inspector__title">Примитив</span>
                <button type="button" className="btn btn--icon" onClick={onClose} title="Закрыть">
                    <X size={16} />
                </button>
            </div>

            {HAS_LABEL.includes(primitive.shape) && (
                <label className="field">
                    <span className="field__label">Текст</span>
                    <input
                        className="input"
                        value={primitive.label}
                        onChange={(e) => onChange({ label: e.target.value })}
                    />
                </label>
            )}

            {showFillColor && showTextColor && (
                <div className="field-row">
                    <label className="field">
                        <span className="field__label">Цвет заливки</span>
                        <input
                            className="primitive-inspector__color"
                            type="color"
                            value={localFillColor}
                            onChange={(e) => onFillColorChange(e.target.value)}
                        />
                    </label>
                    <label className="field">
                        <span className="field__label">Цвет текста</span>
                        <input
                            className="primitive-inspector__color"
                            type="color"
                            value={localTextColor}
                            onChange={(e) => onTextColorChange(e.target.value)}
                        />
                    </label>
                </div>
            )}
            {showFillColor && !showTextColor && (
                <label className="field">
                    <span className="field__label">{primitive.shape === 'line' ? 'Цвет линии' : 'Цвет заливки'}</span>
                    <input
                        className="primitive-inspector__color"
                        type="color"
                        value={localFillColor}
                        onChange={(e) => onFillColorChange(e.target.value)}
                    />
                </label>
            )}
            {!showFillColor && showTextColor && (
                <label className="field">
                    <span className="field__label">Цвет текста</span>
                    <input
                        className="primitive-inspector__color"
                        type="color"
                        value={localTextColor}
                        onChange={(e) => onTextColorChange(e.target.value)}
                    />
                </label>
            )}

            {HAS_ROTATION.includes(primitive.shape) && (
                <div className="field">
                    <span className="field__label">Поворот</span>
                    <div className="primitive-inspector__rotate">
                        <button
                            type="button"
                            className="btn btn--outline"
                            onClick={() => onRotate(-90)}
                            title="Повернуть на 90° против часовой"
                        >
                            <RotateCcw size={16} />
                        </button>
                        <button
                            type="button"
                            className="btn btn--outline"
                            onClick={() => onRotate(90)}
                            title="Повернуть на 90° по часовой"
                        >
                            <RotateCw size={16} />
                        </button>
                    </div>
                </div>
            )}

            {HAS_ACTION.includes(primitive.shape) && (
                <>
                    <label className="field">
                        <span className="field__label">Действие по двойному клику</span>
                        <select
                            className="select"
                            value={primitive.action.type}
                            onChange={(e) => onActionTypeChange(e.target.value as PrimitiveAction['type'])}
                        >
                            {Object.entries(ACTION_LABELS).map(([type, label]) => (
                                <option key={type} value={type}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>

                    {primitive.action.type === 'openMasterCard' && (
                        <label className="field">
                            <span className="field__label">Карточка</span>
                            <select
                                className="select"
                                value={primitive.action.cardId}
                                onChange={(e) => onTargetChange(e.target.value)}
                            >
                                <option value="">—</option>
                                {masterCards.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    {primitive.action.type === 'startEncounter' && (
                        <label className="field">
                            <span className="field__label">Запланированный энкаунтер</span>
                            <select
                                className="select"
                                value={primitive.action.planId}
                                onChange={(e) => onTargetChange(e.target.value)}
                            >
                                <option value="">—</option>
                                {scene.plannedEncounters.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    {primitive.action.type === 'switchScene' && (
                        <label className="field">
                            <span className="field__label">Сцена</span>
                            <select
                                className="select"
                                value={primitive.action.sceneId}
                                onChange={(e) => onTargetChange(e.target.value)}
                            >
                                <option value="">—</option>
                                {scenesForGame.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                </>
            )}

            <button type="button" className="btn btn--danger primitive-inspector__remove" onClick={onRemove}>
                <Trash2 size={16} />
                Удалить примитив
            </button>
        </div>
    )
}
