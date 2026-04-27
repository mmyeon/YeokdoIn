"use client";

import { Suspense } from "react";
import Image from "next/image";
import useAuth from "@/features/auth/model/useAuth";
import { SocialAuthProvider } from "@/types/auth";
import ErrorDisplay from "./ErrorDisplay";

const LoginPage = () => {
  const { signInWithOAuth } = useAuth();

  return (
    <div className="mx-auto max-w-md min-h-dvh bg-yd-bg text-yd-text font-sans flex flex-col px-6 pt-5">
      <TopBar />

      <Slogan />

      <div className="flex-1" />

      <Suspense>
        <ErrorDisplay />
      </Suspense>

      <CtaCopy />

      <div className="flex flex-col gap-2.5 mb-3.5">
        <ProviderButton
          provider="kakao"
          onClick={() => signInWithOAuth("kakao")}
        />
        <ProviderButton
          provider="google"
          onClick={() => signInWithOAuth("google")}
        />
      </div>

    </div>
  );
};

export default LoginPage;

const BarbellMark = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 36 36">
    <rect x="3" y="10" width="3" height="16" rx="1" fill="var(--yd-on-primary)" />
    <rect x="7" y="13" width="2" height="10" rx="1" fill="var(--yd-on-primary)" />
    <rect x="9" y="17" width="18" height="2" rx="1" fill="var(--yd-on-primary)" />
    <rect x="27" y="13" width="2" height="10" rx="1" fill="var(--yd-on-primary)" />
    <rect x="30" y="10" width="3" height="16" rx="1" fill="var(--yd-on-primary)" />
  </svg>
);

const TopBar = () => (
  <div className="flex items-center">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md bg-yd-primary flex items-center justify-center">
        <BarbellMark size={14} />
      </div>
      <span className="text-[13px] font-semibold text-yd-text tracking-[-0.1px]">
        YeokdoIn
      </span>
    </div>
  </div>
);

const Slogan = () => (
  <div className="mt-16">
    <div className="font-mono text-[11px] text-yd-text-muted tracking-[1.6px] uppercase mb-2">
      Built by lifters · For lifters
    </div>

    <div
      className="font-sans font-bold text-yd-text"
      style={{
        fontSize: 56,
        letterSpacing: -2,
        lineHeight: 0.95,
        textWrap: "balance",
      }}
    >
      Lift heavy,
      <br />
      <span className="text-yd-primary">track everything.</span>
    </div>

    <div className="mt-3.5 flex items-center gap-2 text-[12px] text-yd-text-muted font-sans">
      <span
        className="px-2 py-[3px] rounded-full font-mono text-[10px] font-bold tracking-[1px]"
        style={{
          background: "var(--yd-primary-subtle)",
          color: "var(--yd-primary)",
        }}
      >
        SNATCH · C&amp;J · SQUAT
      </span>
      <span>·</span>
      <span>PR · Programs · Video</span>
    </div>

    <ClimbSparkline />
  </div>
);

const ClimbSparkline = () => (
  <svg
    width="100%"
    height="48"
    viewBox="0 0 320 48"
    className="block mt-[18px]"
    aria-hidden
  >
    <defs>
      <linearGradient id="login-spark-fill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="var(--yd-primary)" stopOpacity="0.35" />
        <stop offset="1" stopColor="var(--yd-primary)" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0,40 L40,38 L80,34 L120,32 L160,28 L200,22 L240,20 L280,14 L320,10"
      stroke="var(--yd-primary)"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M0,40 L40,38 L80,34 L120,32 L160,28 L200,22 L240,20 L280,14 L320,10 L320,48 L0,48 Z"
      fill="url(#login-spark-fill)"
    />
    {[
      [40, 38],
      [80, 34],
      [120, 32],
      [160, 28],
      [200, 22],
      [240, 20],
      [280, 14],
      [320, 10],
    ].map(([cx, cy]) => (
      <circle
        key={cx}
        cx={cx}
        cy={cy}
        r={2}
        fill="var(--yd-primary)"
      />
    ))}
  </svg>
);

const CtaCopy = () => (
  <div className="mb-4">
    <div
      className="font-sans font-bold text-yd-text"
      style={{
        fontSize: 22,
        letterSpacing: -0.5,
        lineHeight: 1.2,
      }}
    >
      Sign in to start tracking.
    </div>
    <div className="mt-1.5 text-[12px] text-yd-text-muted font-sans leading-[1.5]">
      PR · Programs · Form video — synced across devices.
    </div>
  </div>
);

const PROVIDER_LABEL: Record<SocialAuthProvider, string> = {
  kakao: "Continue with Kakao",
  google: "Continue with Google",
};

interface ProviderButtonProps {
  provider: SocialAuthProvider;
  onClick: () => void;
}

const ProviderButton = ({ provider, onClick }: ProviderButtonProps) => {
  const isKakao = provider === "kakao";
  const style = isKakao
    ? {
        background: "#FEE500",
        color: "#181600",
        border: "1px solid #FEE500",
      }
    : {
        background: "#FFFFFF",
        color: "#1F1F1F",
        border: "1px solid #DADCE0",
      };

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className="w-full flex items-center gap-3 rounded-xl px-4 py-3.5 font-sans text-[14px] font-semibold tracking-[-0.1px] transition-opacity hover:opacity-90"
    >
      <span className="w-[22px] flex justify-center">
        <Image
          src={isKakao ? "/icons/kakao.svg" : "/icons/google.svg"}
          alt=""
          width={20}
          height={20}
        />
      </span>
      <span className="flex-1 text-left">{PROVIDER_LABEL[provider]}</span>
    </button>
  );
};

