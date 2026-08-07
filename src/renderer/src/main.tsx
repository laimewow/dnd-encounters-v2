import { configureYottaEntrypoint, AuthModel } from 'basic-front'
import { Desktop } from './components/Desktop/Desktop.view'
import { TopBar } from './components/TopBar/TopBar.view'
import { runStartupMigration } from './domain/migration'
import ru from './i18n/ru'
import './index.css'

runStartupMigration()

configureYottaEntrypoint({
    baseUrl: '',

    auth: AuthModel.NONE(),

    theme: {
        themes: {
            light: {
                '--color-desktop-bg': '#dfe3ea',
                '--color-surface': '#ffffff',
                '--color-surface-alt': '#f4f5f7',
                '--color-border': '#d8dce3',
                '--color-border-strong': '#b9c0cc',
                '--color-text': '#171b21',
                '--color-text-secondary': '#4d5563',
                '--color-text-muted': '#8a919e',
                '--color-window-header': '#eceff3',
                '--color-window-header-text': '#171b21',
            },
            dark: {
                '--color-desktop-bg': '#1b1e24',
                '--color-surface': '#262a32',
                '--color-surface-alt': '#20232a',
                '--color-border': '#383d47',
                '--color-border-strong': '#4a5060',
                '--color-text': '#e8eaed',
                '--color-text-secondary': '#a8afbd',
                '--color-text-muted': '#6b7280',
                '--color-window-header': '#2e333c',
                '--color-window-header-text': '#e8eaed',
            },
        },
        defaultTheme: 'light',
    },

    i18n: {
        defaultLanguage: 'ru',
        resources: { ru: { translation: ru } },
    },

    header: <TopBar />,

    routes: [
        { path: '/', element: <Desktop /> },
    ],
})
