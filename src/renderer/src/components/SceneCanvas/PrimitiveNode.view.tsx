import type { NodeProps } from '@xyflow/react'
import type { CanvasPrimitive } from '../../domain/types'
import { PRIMITIVE_SIZE } from './primitiveConstants'
import './PrimitiveNode.style.scss'

const CENTER = PRIMITIVE_SIZE / 2

function buildStarPoints(cx: number, cy: number, outerR: number, innerR: number): string {
    const points: string[] = []
    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2
        const r = i % 2 === 0 ? outerR : innerR
        points.push(`${(cx + r * Math.cos(angle)).toFixed(2)},${(cy + r * Math.sin(angle)).toFixed(2)}`)
    }
    return points.join(' ')
}
const STAR_POINTS = buildStarPoints(CENTER, CENTER, CENTER - 4, (CENTER - 4) * 0.42)
// Arrow pointing up by default; .rotation reorients it.
const ARROW_POINTS = `${CENTER},4 52,26 40,26 40,60 24,60 24,26 12,26`

export const PrimitiveNode = ({ data, selected }: NodeProps) => {
    const primitive = data as unknown as CanvasPrimitive

    return (
        <div className={`primitive-node${selected ? ' primitive-node--selected' : ''}`}>
            {/* overflow:visible so the label (outside the rotated group below) is never clipped by the viewBox when it's wider than the shape */}
            <svg
                width={PRIMITIVE_SIZE}
                height={PRIMITIVE_SIZE}
                viewBox={`0 0 ${PRIMITIVE_SIZE} ${PRIMITIVE_SIZE}`}
                style={{ overflow: 'visible' }}
            >
                {/* Only the shape rotates here — the label lives outside this group so it
                    always stays upright and readable regardless of primitive.rotation. */}
                <g style={{ transform: `rotate(${primitive.rotation}deg)`, transformOrigin: '50% 50%' }}>
                    {primitive.shape === 'square' && (
                        <rect
                            x="4"
                            y="4"
                            width={PRIMITIVE_SIZE - 8}
                            height={PRIMITIVE_SIZE - 8}
                            rx="6"
                            fill={primitive.fillColor}
                        />
                    )}
                    {primitive.shape === 'circle' && (
                        <circle cx={CENTER} cy={CENTER} r={CENTER - 4} fill={primitive.fillColor} />
                    )}
                    {primitive.shape === 'triangle' && (
                        <polygon
                            points={`${CENTER},4 ${PRIMITIVE_SIZE - 4},${PRIMITIVE_SIZE - 4} 4,${PRIMITIVE_SIZE - 4}`}
                            fill={primitive.fillColor}
                        />
                    )}
                    {primitive.shape === 'star' && <polygon points={STAR_POINTS} fill={primitive.fillColor} />}
                    {primitive.shape === 'arrow' && <polygon points={ARROW_POINTS} fill={primitive.fillColor} />}
                </g>
                {primitive.label && (
                    <text
                        x={CENTER}
                        y={CENTER + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill={primitive.textColor}
                        pointerEvents="none"
                    >
                        {primitive.label}
                    </text>
                )}
            </svg>
        </div>
    )
}
