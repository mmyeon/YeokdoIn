"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocalStorage } from "./hooks/useLocalStorage";

const BUTTONS = [
  { label: "Snatch", value: "snatch" },
  { label: "Clean", value: "clean" },
  { label: "Snatch + Clean", value: "snatch,clean" },
];

export default function Home() {
  const { setLocalStorageItem } = useLocalStorage();

  return (
    <div className="w-screen h-screen flex items-center justify-center p-5">
      <div className="flex flex-col items-center justify-center w-screen h-screen gap-4 max-w-md">
        <Image
          src="/logo.svg"
          alt="YeokdoIn logo"
          width={300}
          height={300}
          priority
        />

        <h1 className="text-2xl font-bold">
          오늘 어떤 종목을 훈련하실 건가요?
        </h1>
        <span>훈련할 종목을 선택해 주세요!</span>

        <div className="flex flex-col gap-4 w-full flex-">
          {BUTTONS.map(({ value, label }) => (
            <Link
              key={value}
              href="/pr"
              onClick={() => setLocalStorageItem("selectedLift", value)}
            >
              <button className="w-full border-2 border- text-black hover:bg-blue-300  font-bold py-2 px-4 rounded">
                {label}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
