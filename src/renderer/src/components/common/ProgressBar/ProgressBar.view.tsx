interface ProgressBarProps {
    value: number
    max: number
}

export const ProgressBar = ({ value, max }: ProgressBarProps) => {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0
    const tier = pct > 50 ? 'high' : pct > 25 ? 'mid' : 'low'

    return (
        <div className="progress-bar">
            <div className={`progress-bar__fill progress-bar__fill--${tier}`} style={{ width: `${pct}%` }} />
        </div>
    )
}
