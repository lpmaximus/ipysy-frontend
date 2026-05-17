import type { DeviceInfo } from '@/types/device/device-info'

export type { DeviceInfo }

// ─── Strategy: Provider ───────────────────────────────────────────────────────

/**
 * Contrato do provider de informações de dispositivo.
 *
 * Implemente esta interface para cada plataforma:
 *   - Web:     `WebDeviceInfoProvider`  (já registrado automaticamente)
 *   - Android: `NativeDeviceInfoProvider` com `react-native-device-info`
 *   - iOS:     `NativeDeviceInfoProvider` com `react-native-device-info`
 *
 * Troque o provider chamando `registerDeviceInfoProvider()` na inicialização do app.
 */
export interface DeviceInfoProvider {
  getDeviceInfo(): DeviceInfo | Promise<DeviceInfo>
}

// ─── Registry ─────────────────────────────────────────────────────────────────

let activeProvider: DeviceInfoProvider | null = null

/** Registra o provider ativo. Chame uma vez na inicialização do app. */
export function registerDeviceInfoProvider(provider: DeviceInfoProvider): void {
  activeProvider = provider
}

/** Retorna o DeviceInfo do provider registrado, ou null se nenhum registrado. */
export async function resolveDeviceInfo(): Promise<DeviceInfo | null> {
  if (!activeProvider) return null
  return activeProvider.getDeviceInfo()
}

// ─── Web Provider ─────────────────────────────────────────────────────────────

function parseUserAgent(ua: string): { browser: string; browserVersion: string; os: string } {
  let browser = 'Unknown'
  let browserVersion = ''
  let os = 'Unknown'

  const edgeMatch = ua.match(/Edg\/(\d+)/)
  const chromeMatch = ua.match(/Chrome\/(\d+)/)
  const firefoxMatch = ua.match(/Firefox\/(\d+)/)
  const safariMatch = ua.match(/Version\/(\d+).*Safari/)

  if (edgeMatch) {
    browser = 'Edge'
    browserVersion = edgeMatch[1]
  } else if (chromeMatch) {
    browser = 'Chrome'
    browserVersion = chromeMatch[1]
  } else if (firefoxMatch) {
    browser = 'Firefox'
    browserVersion = firefoxMatch[1]
  } else if (safariMatch) {
    browser = 'Safari'
    browserVersion = safariMatch[1]
  }

  if (/Windows NT 10\.0/.test(ua)) os = 'Windows 10/11'
  else if (/Windows NT 6\.3/.test(ua)) os = 'Windows 8.1'
  else if (/Windows NT 6\.1/.test(ua)) os = 'Windows 7'
  else if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS X ([\d_]+)/.test(ua)) {
    const v = ua.match(/Mac OS X ([\d_]+)/)?.[1].replace(/_/g, '.') ?? ''
    os = `macOS ${v}`
  } else if (/Android ([\d.]+)/.test(ua)) {
    const v = ua.match(/Android ([\d.]+)/)?.[1] ?? ''
    os = `Android ${v}`
  } else if (/iPhone OS ([\d_]+)/.test(ua)) {
    const v = ua.match(/iPhone OS ([\d_]+)/)?.[1].replace(/_/g, '.') ?? ''
    os = `iOS ${v}`
  } else if (/Linux/.test(ua)) os = 'Linux'

  return { browser, browserVersion, os }
}

/**
 * Provider para browser (Next.js / web).
 * Registrado automaticamente quando `window` está disponível.
 *
 * Para React Native, crie um `NativeDeviceInfoProvider` e registre
 * via `registerDeviceInfoProvider()` no ponto de entrada do app.
 *
 * Exemplo React Native:
 * ```ts
 * import DeviceInfo from 'react-native-device-info'
 * import { Platform } from 'react-native'
 * import { registerDeviceInfoProvider, type DeviceInfoProvider } from '@/lib/device/device-info'
 *
 * const NativeDeviceInfoProvider: DeviceInfoProvider = {
 *   async getDeviceInfo() {
 *     return {
 *       platform: Platform.OS as 'android' | 'ios',
 *       os: `${Platform.OS} ${Platform.Version}`,
 *       language: DeviceInfo.getDeviceLocaleSync(),
 *       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
 *       appVersion: DeviceInfo.getVersion(),
 *       buildNumber: DeviceInfo.getBuildNumber(),
 *       deviceModel: DeviceInfo.getModel(),
 *       manufacturer: await DeviceInfo.getManufacturer(),
 *     }
 *   },
 * }
 *
 * registerDeviceInfoProvider(NativeDeviceInfoProvider)
 * ```
 */
export const WebDeviceInfoProvider: DeviceInfoProvider = {
  getDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent
    const { browser, browserVersion, os } = parseUserAgent(ua)
    return {
      platform: 'web',
      os,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: ua,
      browser,
      browserVersion,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      touchSupport: navigator.maxTouchPoints > 0,
    }
  },
}

// Auto-registra o provider web quando executando no browser
if (typeof window !== 'undefined') {
  registerDeviceInfoProvider(WebDeviceInfoProvider)
}
