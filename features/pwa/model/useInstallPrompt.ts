"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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
    const iosDevice = /iPhone|iPad/.test(ua);
    const notBrowserChrome = !/CriOS|FxiOS/.test(ua);
    setIsIOS(iosDevice && notBrowserChrome);

    setIsDismissed(localStorage.getItem("pwa-install-dismissed") === "true");

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
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss(): void {
    localStorage.setItem("pwa-install-dismissed", "true");
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
