import { useState } from 'react'
import { MasterCards, useMasterCardsForGame } from '../../domain/MasterCards'
import { useActiveGameId } from '../../domain/Games'
import { WindowManager } from '../../domain/WindowManager'
import type { MasterCard } from '../../domain/types'

export const useMasterCardsVM = () => {
    const activeGameId = useActiveGameId()
    const cards = useMasterCardsForGame(activeGameId)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')

    const openAddDialog = () => {
        setEditingId(null)
        setTitle('')
        setText('')
        setDialogOpen(true)
    }

    const openEditDialog = (card: MasterCard) => {
        setEditingId(card.id)
        setTitle(card.title)
        setText(card.text)
        setDialogOpen(true)
    }

    const closeDialog = () => setDialogOpen(false)

    const submit = () => {
        if (!activeGameId || !title.trim()) return
        if (editingId) MasterCards.update(editingId, { title: title.trim(), text })
        else MasterCards.add(activeGameId, title.trim(), text)
        setDialogOpen(false)
    }

    const onRemove = (id: string) => MasterCards.remove(id)

    const openAsWindow = (card: MasterCard) => {
        WindowManager.open('masterCardWindow', {
            title: card.title,
            instanceKey: card.id,
            params: { cardId: card.id },
            width: 360,
            height: 420,
        })
    }

    const data = { activeGameId, cards, dialogOpen, editingId, title, text }
    const events = { openAddDialog, openEditDialog, closeDialog, submit, setTitle, setText, onRemove, openAsWindow }

    return { data, events }
}
