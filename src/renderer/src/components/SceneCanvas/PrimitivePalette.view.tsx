import type { DragEvent } from 'react'
import { ArrowUp, Circle, Slash, Square, Star, StickyNote, Triangle, Type, type LucideIcon } from 'lucide-react'
import type { PrimitiveShape } from '../../domain/types'
import { PRIMITIVE_SHAPE_DRAG_TYPE } from '../../lib/dragTypes'
import './PrimitivePalette.style.scss'

const SHAPES: { shape: PrimitiveShape; label: string; icon: LucideIcon }[] = [
    { shape: 'square', label: 'Квадрат', icon: Square },
    { shape: 'circle', label: 'Круг', icon: Circle },
    { shape: 'star', label: 'Звезда', icon: Star },
    { shape: 'triangle', label: 'Треугольник', icon: Triangle },
    { shape: 'arrow', label: 'Стрелка', icon: ArrowUp },
    { shape: 'line', label: 'Линия', icon: Slash },
    { shape: 'text', label: 'Текст', icon: Type },
    { shape: 'sticker', label: 'Стикер', icon: StickyNote },
]

const onDragStart = (event: DragEvent<HTMLDivElement>, shape: PrimitiveShape) => {
    event.dataTransfer.setData(PRIMITIVE_SHAPE_DRAG_TYPE, shape)
    event.dataTransfer.effectAllowed = 'move'
}

export const PrimitivePalette = () => (
    <div className="primitive-palette">
        {SHAPES.map(({ shape, label, icon: Icon }) => (
            <div
                key={shape}
                className="primitive-palette__item"
                draggable
                onDragStart={(e) => onDragStart(e, shape)}
                title={`Перетащите на канвас: ${label}`}
            >
                <Icon size={20} />
                <span>{label}</span>
            </div>
        ))}
        <p className="primitive-palette__hint">Изображение: перетащите файл на канвас или вставьте (Ctrl+V)</p>
    </div>
)
