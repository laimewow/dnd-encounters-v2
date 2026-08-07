import { PartyMembers, usePartyMembers } from '../../domain/PartyMembers'
import { findClassOption } from '../../lib/classOptions'

export const usePartyMemberCardVM = (memberId: string | undefined) => {
    const members = usePartyMembers()
    const member = members.find((m) => m.id === memberId) ?? null

    const onNameChange = (name: string) => {
        if (memberId) PartyMembers.update(memberId, { name })
    }
    const onIconChange = (icon: string) => {
        if (memberId) PartyMembers.update(memberId, { icon })
    }
    const onClassChange = (classKey: string) => {
        if (!memberId) return
        const option = findClassOption(classKey)
        PartyMembers.update(memberId, { classKey: classKey || undefined, icon: option ? option.iconUrl : '' })
    }
    const onCurrentHealthChange = (value: string) => {
        if (!memberId) return
        const n = Number(value)
        if (!Number.isNaN(n)) PartyMembers.update(memberId, { currentHealth: n })
    }
    const onMaxHealthChange = (value: string) => {
        if (!memberId) return
        const n = Number(value)
        if (!Number.isNaN(n)) PartyMembers.update(memberId, { maxHealth: n })
    }

    const data = { member }
    const events = { onNameChange, onIconChange, onClassChange, onCurrentHealthChange, onMaxHealthChange }

    return { data, events }
}
