import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
}

export const IconButton = ({ children, className, ...rest }: IconButtonProps) => {
    return (
        <button type="button" className={`btn btn--icon${className ? ` ${className}` : ''}`} {...rest}>
            {children}
        </button>
    )
}
