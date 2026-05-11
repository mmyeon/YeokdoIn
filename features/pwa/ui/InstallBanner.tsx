"use client";

import { X } from "lucide-react";
import { useInstallPrompt } from "./useInstallPrompt";

export function InstallBanner() {
  const { canInstall, isIOS, isDismissed, isInstalled, handleInstall, handleDismiss } =
    useInstallPrompt();

  if (isDismissed || isInstalled || (!canInstall && !isIOS)) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-[#0A0B0C] border-b border-white/10 px-4 py-3">
      {canInstall && !isIOS ? (
        <>
          <p className="text-sm text-white/80 flex-1">앱으로 더 빠르게 이용하세요</p>
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-[#0A0B0C] hover:bg-white/90 transition-colors"
          >
            앱으로 설치하기
          </button>
        </>
      ) : (
        <p className="text-sm text-white/80 flex-1">
          Safari 공유 버튼(↑) → 홈 화면에 추가
        </p>
      )}
      <button
        onClick={handleDismiss}
        aria-label="배너 닫기"
        className="shrink-0 rounded-md p-1 text-white/60 hover:text-white/90 hover:bg-white/10 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
