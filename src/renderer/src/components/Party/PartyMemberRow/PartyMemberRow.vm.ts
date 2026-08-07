import { useState } from 'react'
import { PartyMembers } from '../../../domain/PartyMembers'
import { WindowManager } from '../../../domain/WindowManager'
import type { PartyMember } from '../../../domain/types'

export const usePartyMemberRowVM = (member: PartyMember) => {
    const [hpDialogOpen, setHpDialogOpen] = useState(false)
    const [hpInput, setHpInput] = useState('0')
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

    const openCard = () => {
        WindowManager.open('partyMemberCard', {
            title: member.name,
            instanceKey: member.id,
            params: { memberId: member.id },
            width: 340,
            height: 460,
        })
    }

    const openHealDialog = () => {
        setHpInput('0')
        setHpDialogOpen(true)
    }
    const closeHealDialog = () => setHpDialogOpen(false)
    const submitHeal = () => {
        PartyMembers.heal(member.id, Number(hpInput) || 0)
        setHpDialogOpen(false)
    }

    const requestDelete = () => setDeleteConfirmOpen(true)
    const confirmDelete = () => {
        PartyMembers.remove(member.id)
        setDeleteConfirmOpen(false)
    }
    const cancelDelete = () => setDeleteConfirmOpen(false)

    const data = { hpDialogOpen, hpInput, deleteConfirmOpen }
    const events = {
        openCard,
        openHealDialog,
        closeHealDialog,
        submitHeal,
        setHpInput,
        requestDelete,
        confirmDelete,
        cancelDelete,
    }

    return { data, events }
}
