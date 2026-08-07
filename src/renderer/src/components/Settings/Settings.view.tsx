import { PawPrint, Save, Upload } from 'lucide-react'
import { useSettingsVM } from './Settings.vm'
import type { WindowContentProps } from '../window/WindowContentProps'
import './Settings.style.scss'

export const Settings = (_props: WindowContentProps) => {
    const { data, events } = useSettingsVM()

    return (
        <div className="settings">
            <section className="settings__section">
                <h3 className="settings__heading">Тема</h3>
                <div className="settings__row">
                    <button
                        type="button"
                        className={`btn ${data.theme === 'light' ? 'btn--primary' : 'btn--outline'}`}
                        onClick={() => events.onSetTheme('light')}
                    >
                        Светлая
                    </button>
                    <button
                        type="button"
                        className={`btn ${data.theme === 'dark' ? 'btn--primary' : 'btn--outline'}`}
                        onClick={() => events.onSetTheme('dark')}
                    >
                        Тёмная
                    </button>
                </div>
            </section>

            <section className="settings__section">
                <h3 className="settings__heading">Резервная копия</h3>
                <div className="settings__row">
                    <button type="button" className="btn btn--outline" onClick={events.onExport}>
                        <Save size={16} />
                        Сохранить
                    </button>
                    <button type="button" className="btn btn--outline" onClick={events.onImport}>
                        <Upload size={16} />
                        Загрузить
                    </button>
                </div>
            </section>

            <section className="settings__section">
                <h3 className="settings__heading">Библиотеки</h3>
                <div className="settings__row">
                    <button type="button" className="btn btn--outline" onClick={events.openMonsterLibrary}>
                        <PawPrint size={16} />
                        Монстры
                    </button>
                </div>
            </section>
        </div>
    )
}
