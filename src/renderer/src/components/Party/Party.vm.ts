import { PartyMembers, usePartyMembersForActiveGame } from '../../domain/PartyMembers'
import { useActiveGameId } from '../../domain/Games'

export const usePartyVM = () => {
    const activeGameId = useActiveGameId()
    const members = usePartyMembersForActiveGame()

    const onAdd = () => {
        if (activeGameId) PartyMembers.add(activeGameId)
    }

    const data = { activeGameId, members }
    const events = { onAdd }

    return { data, events }
}
