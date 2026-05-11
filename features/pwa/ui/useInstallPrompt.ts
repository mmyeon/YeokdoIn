"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

interface UseInstallPromptResult {
  canInstall: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  isInstalled: boolean;
  handleInstall: () => Promise<void>;
  handleDismiss: () => void;
}

export function useInstallPrompt(): UseInstallPromptResult {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPhone|iPad/.test(ua) && !/CriOS|FxiOS/.test(ua));
    setIsDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall(): Promise<void> {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss(): void {
    localStorage.setItem(DISMISS_KEY, "true");
    setIsDismissed(true);
  }

  return {
    canInstall: deferredPrompt !== null,
    isIOS,
    isDismissed,
    isInstalled,
    handleInstall,
    handleDismiss,
  };
}
