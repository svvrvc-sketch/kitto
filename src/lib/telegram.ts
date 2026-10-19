/**
 * Telegram WebApp SDK Safe Integration
 * Guards against "[Telegram.WebView] > postEvent" console errors when running in normal browsers.
 */

export function isTelegramWebApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const webApp = window.Telegram?.WebApp;
    // Telegram WebView strictly passes a non-empty initData string
    return Boolean(webApp && typeof webApp.initData === 'string' && webApp.initData.length > 0);
  } catch {
    return false;
  }
}

export function initTelegramApp(onThemeDetected?: (isDark: boolean) => void): boolean {
  if (!isTelegramWebApp()) {
    // Normal browser environment - DO NOT call Telegram SDK methods
    return false;
  }

  try {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      if (typeof tg.expand === 'function') {
        tg.expand();
      }
      if (typeof tg.enableClosingConfirmation === 'function') {
        tg.enableClosingConfirmation();
      }

      if (tg.colorScheme && onThemeDetected) {
        onThemeDetected(tg.colorScheme === 'dark');
      }

      // Add helper class to document body for Telegram ergonomic styles
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('is-telegram-webapp');
      }
      return true;
    }
  } catch (e) {
    console.warn('Telegram WebApp safe init notice:', e);
  }
  return false;
}

export function getTelegramUser() {
  if (!isTelegramWebApp()) return null;
  return window.Telegram?.WebApp?.initDataUnsafe?.user || null;
}

/**
 * Sends a notification to @kittouzbot when a user logs in via manual details
 */
export async function notifyTelegramLogin(payload: {
  name: string;
  contact: string;
  email?: string;
  city?: string;
  provider?: string;
}) {
  try {
    await fetch('/api/telegram-login-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn('Telegram notification notice:', e);
  }
}

