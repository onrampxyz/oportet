import { PortoConfig } from '@porto/apps'
import { Dialog, Mode, type RiseWallet, Storage } from 'rise-wallet'
import 'rise-wallet/register'

const theme = localStorage.getItem('__porto_theme') ?? 'light'
const themeController = Dialog.createThemeController()

const host = (() => {
  const url = new URL(PortoConfig.getDialogHost())
  if (import.meta.env.DEV) url.port = window.location.port
  return url.href
})()

export const config = {
  ...PortoConfig.getConfig(
    import.meta.env.VITE_VERCEL_ENV === 'production' ? 'prod' : undefined,
  ),
  mode: Mode.dialog({
    host,
    theme: {
      colorScheme: theme as 'light' | 'light dark' | 'dark',
      // baseBackground: '#e6e8ec',
      // primaryBackground: '#625ca2',
      // primaryContent: '#ffffff', //foreground
      // secondaryBackground: '#e6e8ec',
      // secondaryContent: '#bcc4',
    },
    themeController,
  }),
  storage: Storage.combine(Storage.cookie(), Storage.localStorage()),
} as const satisfies RiseWallet.Config

// export const porto = Porto.create(config)
