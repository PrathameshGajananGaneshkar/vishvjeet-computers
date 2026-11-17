import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __deferredPWAInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export type PWAInstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt) {
      return window.__deferredPWAInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already running as installed app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect platform & in-app WebView environments
    const ua = window.navigator.userAgent || '';
    const uaLower = ua.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(uaLower));
    setIsAndroid(/android/.test(uaLower));
    setIsInAppBrowser(
      /whatsapp|instagram|fbav|fban|line\/|snapchat|wv\)|; wv\)/i.test(ua)
    );
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Sync any prompt captured before React mounted
    if (window.__deferredPWAInstallPrompt) {
      setDeferredPrompt(window.__deferredPWAInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPWAInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handleEarlyPromptReady = () => {
      if (window.__deferredPWAInstallPrompt) {
        setDeferredPrompt(window.__deferredPWAInstallPrompt);
      }
    };

    const handleAppInstalled = () => {
      window.__deferredPWAInstallPrompt = null;
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handleEarlyPromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-app-installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handleEarlyPromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<PWAInstallOutcome> => {
    const promptEvent = deferredPrompt || window.__deferredPWAInstallPrompt || null;
    if (!promptEvent) {
      return 'unavailable';
    }
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      window.__deferredPWAInstallPrompt = null;
      setDeferredPrompt(null);
      if (outcome === 'accepted') {
        setIsInstalled(true);
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('PWA install prompt failed:', err);
      return 'unavailable';
    }
  };

  return {
    isInstallable: !!(deferredPrompt || (typeof window !== 'undefined' && window.__deferredPWAInstallPrompt)),
    isInstalled,
    isIOS,
    isAndroid,
    isInAppBrowser,
    isInIframe,
    install,
  };
}
