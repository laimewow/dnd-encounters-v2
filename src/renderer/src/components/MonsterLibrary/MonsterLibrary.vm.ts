import { useMemo, useState } from 'react'
import { toastError, toastInfo } from 'basic-front'
import { MonsterLibrary, useMonsterLibrary } from '../../domain/MonsterLibrary'
import { WindowManager } from '../../domain/WindowManager'
import { genId } from '../../lib/random'
import { parseTtgMonster } from '../../lib/monsterImport'
import type { MonsterAttack, MonsterResource } from '../../domain/types'

const blankAttack = (): MonsterAttack => ({
    id: genId(),
    name: '',
    attackBonus: 0,
    damageRoll: '',
    damageBonus: 0,
    notes: '',
})

export const useMonsterLibraryVM = () => {
    const monsters = useMonsterLibrary()
    const [importing, setImporting] = useState(false)
    const [search, setSearch] = useState('')

    const visibleMonsters = useMemo(() => {
        const query = search.trim().toLowerCase()
        return monsters
            .filter((m) => m.name.toLowerCase().includes(query))
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    }, [monsters, search])

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [iconUrl, setIconUrl] = useState('')
    const [baseHealth, setBaseHealth] = useState('10')
    const [armorClass, setArmorClass] = useState('10')
    const [notes, setNotes] = useState('')
    const [attacks, setAttacks] = useState<MonsterAttack[]>([])

    const openAddDialog = () => {
        setEditingId(null)
        setName('')
        setIconUrl('')
        setBaseHealth('10')
        setArmorClass('10')
        setNotes('')
        setAttacks([])
        setDialogOpen(true)
    }

    const openEditDialog = (monster: MonsterResource) => {
        setEditingId(monster.id)
        setName(monster.name)
        setIconUrl(monster.iconUrl)
        setBaseHealth(String(monster.baseHealth))
        setArmorClass(String(monster.armorClass))
        setNotes(monster.notes)
        setAttacks(monster.attacks)
        setDialogOpen(true)
    }

    const closeDialog = () => setDialogOpen(false)

    const addAttack = () => setAttacks((a) => [...a, blankAttack()])
    const updateAttack = (id: string, patch: Partial<Omit<MonsterAttack, 'id'>>) =>
        setAttacks((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)))
    const removeAttack = (id: string) => setAttacks((a) => a.filter((x) => x.id !== id))

    const submit = () => {
        if (!name.trim()) return
        if (editingId) {
            const existing = MonsterLibrary.findById(editingId)
            MonsterLibrary.update({
                id: editingId,
                name: name.trim(),
                iconUrl,
                baseHealth: Number(baseHealth) || 1,
                armorClass: Number(armorClass) || 0,
                attacks,
                notes,
                masterTooltip: existing?.masterTooltip,
            })
        } else {
            MonsterLibrary.add({
                name: name.trim(),
                iconUrl,
                baseHealth: Number(baseHealth) || 1,
                armorClass: Number(armorClass) || 0,
                attacks,
                notes,
            })
        }
        setDialogOpen(false)
    }

    const onRemove = (id: string) => MonsterLibrary.remove(id)

    const openAsWindow = (monster: MonsterResource) => {
        WindowManager.open('monsterCardWindow', {
            title: monster.name,
            instanceKey: monster.id,
            params: { monsterId: monster.id },
            width: 360,
            height: 480,
        })
    }

    const importFromFolder = async () => {
        const folderPath = await window.api.monsterImport.pickFolder()
        if (!folderPath) return

        setImporting(true)
        try {
            const entries = await window.api.monsterImport.readFolder(folderPath)
            const parsed: Omit<MonsterResource, 'id'>[] = []
            let unparsed = 0
            for (const entry of entries) {
                const monster = parseTtgMonster(entry.raw, entry.iconDataUrl)
                if (monster) parsed.push(monster)
                else unparsed++
            }

            const { imported, skipped } = await MonsterLibrary.importMany(parsed)
            const parts = [`импортировано: ${imported}`]
            if (skipped > 0) parts.push(`пропущено (уже есть): ${skipped}`)
            if (unparsed > 0) parts.push(`не распознано: ${unparsed}`)
            toastInfo(`Импорт монстров — ${parts.join(', ')}`)
        } catch (err) {
            console.error('Monster import failed:', err)
            toastError('Не удалось импортировать монстров')
        } finally {
            setImporting(false)
        }
    }

    const data = {
        monsters: visibleMonsters,
        search,
        importing,
        dialogOpen,
        editingId,
        name,
        iconUrl,
        baseHealth,
        armorClass,
        notes,
        attacks,
    }
    const events = {
        setSearch,
        openAddDialog,
        openEditDialog,
        closeDialog,
        submit,
        setName,
        setIconUrl,
        setBaseHealth,
        setArmorClass,
        setNotes,
        addAttack,
        updateAttack,
        removeAttack,
        onRemove,
        openAsWindow,
        importFromFolder,
    }

    return { data, events }
}
