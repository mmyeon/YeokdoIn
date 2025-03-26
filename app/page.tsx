"use client";

import Link from "next/link";
import Image from "next/image";
import "jotai-devtools/styles.css";
import { ROUTES } from "@/routes";

export default function Home() {
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

        <h1 className="text-2xl font-bold">YeokdoIn</h1>
        <p className="text-center">
          개인 기록(PR)을 기반으로 훈련 중량을 계산하고, 프로그램을 설정하세요.
        </p>

        <Link href={ROUTES.TRAINING.SELECT_LIFT}>
          <button className="w-full border-2 text-black hover:bg-blue-300 font-bold py-2 px-4 rounded">
            시작하기
          </button>
        </Link>
      </div>
    </div>
  );
}
