import { UserPlus } from 'lucide-react'
import { usePartyVM } from './Party.vm'
import { PartyMemberRow } from './PartyMemberRow/PartyMemberRow.view'
import type { WindowContentProps } from '../window/WindowContentProps'
import './Party.style.scss'

export const Party = (_props: WindowContentProps) => {
    const { data, events } = usePartyVM()

    if (!data.activeGameId) {
        return (
            <div className="party">
                <p className="party__empty">Сначала выберите активную игру в окне «Игры»</p>
            </div>
        )
    }

    return (
        <div className="party">
            <div className="party__toolbar">
                <button type="button" className="btn btn--primary" onClick={events.onAdd}>
                    <UserPlus size={16} />
                    Добавить
                </button>
            </div>
            <div className="party__list">
                {data.members.length === 0 && <p className="party__empty">Группа пуста</p>}
                {data.members.map((m) => (
                    <PartyMemberRow key={m.id} member={m} />
                ))}
            </div>
        </div>
    )
}
