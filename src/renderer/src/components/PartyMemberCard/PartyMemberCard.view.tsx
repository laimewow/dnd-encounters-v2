import { usePartyMemberCardVM } from './PartyMemberCard.vm'
import { classOptions } from '../../lib/classOptions'
import type { WindowContentProps } from '../window/WindowContentProps'
import './PartyMemberCard.style.scss'

export const PartyMemberCard = ({ win }: WindowContentProps) => {
    const { data, events } = usePartyMemberCardVM(win.params?.memberId)

    if (!data.member) {
        return (
            <div className="party-member-card">
                <p className="party-member-card__missing">Персонаж удалён</p>
            </div>
        )
    }

    const member = data.member

    return (
        <div className="party-member-card">
            <div className="party-member-card__icon-row">
                <img className="party-member-card__icon" src={member.icon} alt="" />
            </div>

            <label className="field">
                <span className="field__label">Имя</span>
                <input className="input" value={member.name} onChange={(e) => events.onNameChange(e.target.value)} />
            </label>

            <label className="field">
                <span className="field__label">Класс</span>
                <select
                    className="select"
                    value={member.classKey ?? ''}
                    onChange={(e) => events.onClassChange(e.target.value)}
                >
                    <option value="">—</option>
                    {classOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </label>

            <label className="field">
                <span className="field__label">Иконка (URL)</span>
                <input className="input" value={member.icon} onChange={(e) => events.onIconChange(e.target.value)} />
            </label>

            <div className="field-row">
                <label className="field">
                    <span className="field__label">Текущее HP</span>
                    <input
                        className="input"
                        type="number"
                        value={member.currentHealth}
                        onChange={(e) => events.onCurrentHealthChange(e.target.value)}
                    />
                </label>
                <label className="field">
                    <span className="field__label">Макс. HP</span>
                    <input
                        className="input"
                        type="number"
                        value={member.maxHealth}
                        onChange={(e) => events.onMaxHealthChange(e.target.value)}
                    />
                </label>
            </div>
        </div>
    )
}
