import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './Menu.style.scss'

interface MenuProps {
    anchorEl: HTMLElement | null
    open: boolean
    onClose: () => void
    children: ReactNode
}

export const Menu = ({ anchorEl, open, onClose, children }: MenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        const handlePointerDown = (e: PointerEvent) => {
            const target = e.target as Node
            if (menuRef.current?.contains(target)) return
            if (anchorEl?.contains(target)) return
            onClose()
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        window.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [open, anchorEl, onClose])

    if (!open || !anchorEl) return null

    const rect = anchorEl.getBoundingClientRect()
    const style: CSSProperties = {
        top: Math.min(rect.bottom + 4, window.innerHeight - 40),
        left: Math.min(rect.left, window.innerWidth - 240),
    }

    return createPortal(
        <div className="menu" ref={menuRef} style={style}>
            {children}
        </div>,
        document.body,
    )
}
