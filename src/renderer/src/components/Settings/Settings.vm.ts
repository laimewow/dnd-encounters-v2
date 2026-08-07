import { useTheme, setTheme, toastError, toastInfo } from 'basic-front'
import { SaveLoad } from '../../domain/SaveLoad'
import { WindowManager } from '../../domain/WindowManager'

export const useSettingsVM = () => {
    const theme = useTheme()

    const onSetTheme = (name: string) => setTheme(name)

    const onExport = async () => {
        const ok = await SaveLoad.exportAll()
        if (ok) toastInfo('Резервная копия сохранена')
    }

    const onImport = async () => {
        const result = await SaveLoad.importAll()
        if (result === 'ok') toastInfo('Резервная копия загружена')
        if (result === 'error') toastError('Не удалось загрузить резервную копию — файл повреждён')
    }

    const openMonsterLibrary = () =>
        WindowManager.open('monsterLibrary', { title: 'Монстры', width: 420, height: 480 })

    const data = { theme }
    const events = { onSetTheme, onExport, onImport, openMonsterLibrary }

    return { data, events }
}
