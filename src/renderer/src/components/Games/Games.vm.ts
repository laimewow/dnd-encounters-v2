import { useState } from 'react'
import { Games, useActiveGameId, useGames } from '../../domain/Games'
import { PartyMembers } from '../../domain/PartyMembers'
import { Scenes } from '../../domain/Scenes'
import { MasterCards } from '../../domain/MasterCards'
import type { Game } from '../../domain/types'

export const useGamesVM = () => {
    const games = useGames()
    const activeGameId = useActiveGameId()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

    const openAddDialog = () => {
        setEditingId(null)
        setName('')
        setDescription('')
        setDialogOpen(true)
    }

    const openEditDialog = (game: Game) => {
        setEditingId(game.id)
        setName(game.name)
        setDescription(game.description)
        setDialogOpen(true)
    }

    const closeDialog = () => setDialogOpen(false)

    const submit = () => {
        if (!name.trim()) return
        if (editingId) Games.update(editingId, { name: name.trim(), description })
        else Games.add(name.trim(), description)
        setDialogOpen(false)
    }

    const onSetActive = (id: string) => Games.setActive(id)
    const requestDelete = (id: string) => setDeleteConfirmId(id)
    const cancelDelete = () => setDeleteConfirmId(null)
    const confirmDelete = () => {
        if (deleteConfirmId) {
            PartyMembers.removeForGame(deleteConfirmId)
            Scenes.removeForGame(deleteConfirmId)
            MasterCards.removeForGame(deleteConfirmId)
            Games.remove(deleteConfirmId)
        }
        setDeleteConfirmId(null)
    }

    const data = { games, activeGameId, dialogOpen, editingId, name, description, deleteConfirmId }
    const events = {
        openAddDialog,
        openEditDialog,
        closeDialog,
        submit,
        setName,
        setDescription,
        onSetActive,
        requestDelete,
        cancelDelete,
        confirmDelete,
    }

    return { data, events }
}
