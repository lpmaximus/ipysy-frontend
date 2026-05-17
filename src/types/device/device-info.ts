/**
 * Informações do dispositivo enviadas no header `device-info`.
 * Interface compartilhada entre browser e apps mobile (Android/iOS).
 */
export interface DeviceInfo {
  platform: 'web' | 'android' | 'ios'

  // ── Campos comuns ──────────────────────────────────────────────────────────
  os?: string          // ex: "Windows 11", "macOS 14", "Android 14", "iOS 17"
  osVersion?: string   // ex: "10.0.22631"
  language?: string    // ex: "pt-BR"
  timezone?: string    // ex: "America/Sao_Paulo"

  // ── Web ────────────────────────────────────────────────────────────────────
  userAgent?: string
  browser?: string         // ex: "Chrome", "Firefox", "Safari", "Edge"
  browserVersion?: string  // ex: "124"
  screenWidth?: number
  screenHeight?: number
  viewportWidth?: number
  viewportHeight?: number
  devicePixelRatio?: number
  touchSupport?: boolean

  // ── Mobile (React Native / Expo) ──────────────────────────────────────────
  appVersion?: string    // ex: "1.0.0"
  buildNumber?: string   // ex: "42"
  deviceModel?: string   // ex: "Pixel 8", "iPhone 15"
  manufacturer?: string  // ex: "Google", "Apple"
}
