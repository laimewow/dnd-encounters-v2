import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'

interface UseWindowResizeOptions {
    onResize: (width: number, height: number) => void
    minWidth?: number
    minHeight?: number
}

export const useWindowResize = (
    width: number,
    height: number,
    { onResize, minWidth = 280, minHeight = 180 }: UseWindowResizeOptions,
) => {
    const start = useRef<{ pointerX: number; pointerY: number; originW: number; originH: number } | null>(null)

    const onPointerDown = useCallback((e: ReactPointerEvent) => {
        if (e.button !== 0) return
        e.stopPropagation()
        start.current = { pointerX: e.clientX, pointerY: e.clientY, originW: width, originH: height }

        const handleMove = (ev: PointerEvent) => {
            if (!start.current) return
            const dw = ev.clientX - start.current.pointerX
            const dh = ev.clientY - start.current.pointerY
            onResize(Math.max(minWidth, start.current.originW + dw), Math.max(minHeight, start.current.originH + dh))
        }
        const handleUp = () => {
            start.current = null
            window.removeEventListener('pointermove', handleMove)
            window.removeEventListener('pointerup', handleUp)
        }
        window.addEventListener('pointermove', handleMove)
        window.addEventListener('pointerup', handleUp)
    }, [width, height, onResize, minWidth, minHeight])

    return { onPointerDown }
}
