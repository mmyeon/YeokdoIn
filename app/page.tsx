"use client";

import Link from "next/link";
import Image from "next/image";

const BUTTONS = [
  { label: "Snatch", value: "snatch" },
  { label: "Clean", value: "clean" },
  { label: "Snatch + Clean", value: "snatch,clean" },
];

// TODO: 사용되는 로컬 스토리지 키 한 곳에서 관리
export type LOCAL_STORAGE_KEYS = "selectedLift";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src="/logo.svg"
        alt="YeokdoIn logo"
        width={500}
        height={500}
        priority
      />

      <h1 className="">훈련할 종목을 선택해 주세요.</h1>

      <div className="flex flex-col gap-4">
        {BUTTONS.map(({ value, label }) => (
          <Link
            key={value}
            href="/pr"
            onClick={() => localStorage.setItem("selectedLift", value)}
          >
            <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {label}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
