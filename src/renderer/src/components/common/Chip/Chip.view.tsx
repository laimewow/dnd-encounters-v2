import type { MouseEventHandler, ReactNode } from 'react'

interface ChipProps {
    active?: boolean
    onClick?: MouseEventHandler<HTMLButtonElement>
    children: ReactNode
    title?: string
}

export const Chip = ({ active, onClick, children, title }: ChipProps) => {
    const className = `chip${active ? ' chip--active' : ''}`

    if (!onClick) {
        return (
            <span className={className} title={title}>
                {children}
            </span>
        )
    }

    return (
        <button type="button" className={className} onClick={onClick} title={title}>
            {children}
        </button>
    )
}
