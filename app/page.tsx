"use client";

import Link from "next/link";
import Image from "next/image";
import "jotai-devtools/styles.css";
import { ROUTES } from "@/routes";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 max-w-md">
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

      <Button
        className="w-full h-12 rounded-xl text-base font-semibold bg-primary"
        asChild
      >
        <Link href={ROUTES.TRAINING.SELECT_LIFT}>시작하기</Link>
      </Button>
    </div>
  );
}
