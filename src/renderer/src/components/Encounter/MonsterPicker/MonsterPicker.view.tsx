import { useMonsterPickerVM } from './MonsterPicker.vm'
import { Menu } from '../../common/Menu/Menu.view'

interface MonsterPickerProps {
    anchorEl: HTMLElement | null
    open: boolean
    onClose: () => void
}

export const MonsterPicker = ({ anchorEl, open, onClose }: MonsterPickerProps) => {
    const { data, events } = useMonsterPickerVM(onClose)

    return (
        <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
            {data.monsters.length === 0 && <div className="menu__empty">Библиотека монстров пуста</div>}
            {data.monsters.map((m) => (
                <button
                    key={m.id}
                    type="button"
                    className="menu__item"
                    onClick={() => events.onPickMonster(m.id)}
                >
                    <img className="icon-img" src={m.iconUrl} alt="" />
                    {m.name}
                </button>
            ))}
        </Menu>
    )
}
