import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'

interface UseWindowDragOptions {
    onMove: (x: number, y: number) => void
    onDragStart?: () => void
}

export const useWindowDrag = (x: number, y: number, { onMove, onDragStart }: UseWindowDragOptions) => {
    const start = useRef<{ pointerX: number; pointerY: number; originX: number; originY: number } | null>(null)

    const onPointerDown = useCallback((e: ReactPointerEvent) => {
        if (e.button !== 0) return
        onDragStart?.()
        start.current = { pointerX: e.clientX, pointerY: e.clientY, originX: x, originY: y }

        const handleMove = (ev: PointerEvent) => {
            if (!start.current) return
            const dx = ev.clientX - start.current.pointerX
            const dy = ev.clientY - start.current.pointerY
            onMove(Math.max(0, start.current.originX + dx), Math.max(0, start.current.originY + dy))
        }
        const handleUp = () => {
            start.current = null
            window.removeEventListener('pointermove', handleMove)
            window.removeEventListener('pointerup', handleUp)
        }
        window.addEventListener('pointermove', handleMove)
        window.addEventListener('pointerup', handleUp)
    }, [x, y, onMove, onDragStart])

    return { onPointerDown }
}
