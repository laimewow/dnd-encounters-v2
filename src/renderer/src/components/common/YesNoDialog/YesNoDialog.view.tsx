import type { ReactNode } from 'react'
import { Dialog } from '../Dialog/Dialog.view'

interface YesNoDialogProps {
    open: boolean
    title: string
    message: ReactNode
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export const YesNoDialog = ({
    open,
    title,
    message,
    confirmLabel = 'Да',
    cancelLabel = 'Нет',
    onConfirm,
    onCancel,
}: YesNoDialogProps) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            onSubmit={onConfirm}
            title={title}
            actions={
                <>
                    <button type="button" className="btn btn--outline" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button type="button" className="btn btn--primary" onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </>
            }
        >
            {message}
        </Dialog>
    )
}
