import type { DragEvent } from 'react'
import { ArrowUp, Circle, Square, Star, Triangle, type LucideIcon } from 'lucide-react'
import type { PrimitiveShape } from '../../domain/types'
import { PRIMITIVE_SHAPE_DRAG_TYPE } from '../../lib/dragTypes'
import './PrimitivePalette.style.scss'

const SHAPES: { shape: PrimitiveShape; label: string; icon: LucideIcon }[] = [
    { shape: 'square', label: 'Квадрат', icon: Square },
    { shape: 'circle', label: 'Круг', icon: Circle },
    { shape: 'star', label: 'Звезда', icon: Star },
    { shape: 'triangle', label: 'Треугольник', icon: Triangle },
    { shape: 'arrow', label: 'Стрелка', icon: ArrowUp },
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
    </div>
)
