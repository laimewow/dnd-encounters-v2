import { Menu } from '../../common/Menu/Menu.view'
import { conditionCollection } from '../../../lib/conditionCollection'

interface ParticipantStateMenuProps {
    anchorEl: HTMLElement | null
    open: boolean
    onClose: () => void
    onPick: (conditionName: string) => void
}

export const ParticipantStateMenu = ({ anchorEl, open, onClose, onPick }: ParticipantStateMenuProps) => {
    return (
        <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
            {conditionCollection.map((c) => (
                <button
                    key={c.name}
                    type="button"
                    className="menu__item"
                    onClick={() => {
                        onPick(c.name)
                        onClose()
                    }}
                >
                    <img className="icon-img" src={c.icon} alt="" />
                    {c.name}
                </button>
            ))}
        </Menu>
    )
}
