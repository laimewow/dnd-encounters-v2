import { useMonsterCardWindowVM } from './MonsterCardWindow.vm'
import { formatAttack } from '../../lib/attackFormat'
import type { WindowContentProps } from '../window/WindowContentProps'
import './MonsterCardWindow.style.scss'

export const MonsterCardWindow = ({ win }: WindowContentProps) => {
    const { data } = useMonsterCardWindowVM(win.params?.monsterId)

    if (!data.monster) {
        return (
            <div className="monster-card-window">
                <p className="monster-card-window__missing">Монстр удалён</p>
            </div>
        )
    }

    const monster = data.monster

    return (
        <div className="monster-card-window">
            <div className="monster-card-window__header">
                <img className="monster-card-window__icon" src={monster.iconUrl} alt="" />
                <div className="monster-card-window__title">{monster.name}</div>
            </div>

            <div className="monster-card-window__stats">
                <span>HP: {monster.baseHealth}</span>
                <span>КД: {monster.armorClass}</span>
            </div>

            {monster.attacks.length > 0 && (
                <div className="monster-card-window__attacks">
                    {monster.attacks.map((a) => (
                        <div key={a.id} className="monster-card-window__attack">
                            <div className="monster-card-window__attack-line">
                                {a.name && <span className="monster-card-window__attack-name">{a.name}</span>}
                                <span className="monster-card-window__attack-formula">{formatAttack(a)}</span>
                            </div>
                            {a.notes && <p className="monster-card-window__attack-notes">{a.notes}</p>}
                        </div>
                    ))}
                </div>
            )}

            {monster.notes && <p className="monster-card-window__notes">{monster.notes}</p>}
        </div>
    )
}
