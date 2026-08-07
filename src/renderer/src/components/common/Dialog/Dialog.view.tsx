import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './Dialog.style.scss'

interface DialogProps {
    open: boolean
    onClose: () => void
    onSubmit?: () => void
    title: string
    children: ReactNode
    actions?: ReactNode
}

export const Dialog = ({ open, onClose, onSubmit, title, children, actions }: DialogProps) => {
    useEffect(() => {
        if (!open) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
                return
            }
            if ((e.key === 'Enter' || e.code === 'NumpadEnter') && onSubmit) {
                if ((e.target as HTMLElement).tagName === 'TEXTAREA') return
                onSubmit()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose, onSubmit])

    if (!open) return null

    return createPortal(
        <div
            className="dialog-backdrop"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="dialog">
                <div className="dialog__title">{title}</div>
                <div className="dialog__body">{children}</div>
                {actions && <div className="dialog__actions">{actions}</div>}
            </div>
        </div>,
        document.body,
    )
}
